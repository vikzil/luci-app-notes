'use strict';
'require baseclass';

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function inlineMarkdown(value) {
	let s = escapeHtml(value);

	// Shield backslash-escaped punctuation before parsing Markdown.
	const escapes = [];

	s = s.replace(/\\([\\`*_{}\[\]()#+.!>~-])/g, (_, ch) => {
		escapes.push(ch);
		return `\x01ESC${escapes.length - 1}\x01`;
	});

	// Inline code after escaped backticks have been shielded.
	const code = [];

	s = s.replace(/`([^`]+)`/g, (_, value) => {
		code.push(`<code>${value}</code>`);
		return `\x00CODE${code.length - 1}\x00`;
	});

	s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
	s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
	s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
	s = s.replace(/_([^_]+)_/g, "<em>$1</em>");

	s = s.replace(/\x00CODE(\d+)\x00/g, (_, i) => code[i]);
	s = s.replace(/\x01ESC(\d+)\x01/g, (_, i) => escapes[i]);

	return s;
}

function renderMarkdownImpl(markdown) {
	const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
	const output = [];

	let inCode = false;
	let codeLines = [];
	let listType = null;

	function closeList() {
		if (listType) {
			output.push(`</${listType}>`);
			listType = null;
		}
	}

	function closeCode() {
		if (inCode) {
			output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
			codeLines = [];
			inCode = false;
		}
	}

	for (const line of lines) {
		// Fenced code block
		if (/^```/.test(line)) {
			if (inCode)
				closeCode();
			else
				inCode = true;

			continue;
		}

		if (inCode) {
			codeLines.push(line);
			continue;
		}

		// Blank line
		if (!line.trim()) {
			closeList();
			continue;
		}

		// Horizontal rule
		if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
			closeList();
			output.push("<hr>");
			continue;
		}

		// Headings
		const heading = line.match(/^\s*(#{1,6})\s+(.+)$/);

		if (heading) {
			closeList();

			const level = heading[1].length;
			output.push(
				`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`
			);

			continue;
		}

		// Blockquote
		const quote = line.match(/^\s*>\s?(.*)$/);

		if (quote) {
			closeList();
			output.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
			continue;
		}

		// Unordered list
		const unordered = line.match(/^\s*[-*+]\s+(.+)$/);

		if (unordered) {
			if (listType !== "ul") {
				closeList();
				output.push("<ul>");
				listType = "ul";
			}

			output.push(`<li>${inlineMarkdown(unordered[1])}</li>`);
			continue;
		}

		// Ordered list
		const ordered = line.match(/^\s*\d+\.\s+(.+)$/);

		if (ordered) {
			if (listType !== "ol") {
				closeList();
				output.push("<ol>");
				listType = "ol";
			}

			output.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
			continue;
		}

		// Normal paragraph. Leading whitespace is snapped to indent
		// "levels" (2 spaces = 1 level) and rendered as margin-left in
		// em, matching the 2em padding-left used for lists in notes.css,
		// so continuation text lines up exactly under a list item.
		closeList();

		const indentMatch = line.match(/^([ \t]*)(.*)$/);
		const indentChars = indentMatch[1].replace(/\t/g, "  ").length;
		const level = Math.round(indentChars / 2);
		const text = indentMatch[2];

		if (level > 0) {
			output.push(`<p style="margin-left: ${level * 2}em">${inlineMarkdown(text)}</p>`);
		} else {
			output.push(`<p>${inlineMarkdown(text)}</p>`);
		}
	}

	closeCode();
	closeList();

	return output.join("\n");
}

return baseclass.extend({
	renderMarkdown: function(markdown) {
		return renderMarkdownImpl(markdown);
	}
});
