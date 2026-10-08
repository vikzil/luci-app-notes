'use strict';

'require view';
'require rpc';
'require notes.markdown as markdown';

const readNotes = rpc.declare({
	object: 'notes',
	method: 'read'
});

const writeNotes = rpc.declare({
	object: 'notes',
	method: 'write',
	params: [ 'contents' ]
});

return view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,

	load: function() {
		return readNotes();
	},

	render: function(data) {
		let contents = data.contents || '';
		let container;

		// Load the preview stylesheet. 'require' only loads .js modules,
		// so the CSS has to be injected manually.
		if (!document.querySelector('link[href*="notes/notes.css"]')) {
			document.head.appendChild(E('link', {
				'rel': 'stylesheet',
				'type': 'text/css',
				'href': L.resource('notes/notes.css')
			}));
		}

		function showView() {
			let preview = E('div', {
				'class': 'notes-preview'
			});

			/*
			* markdown.js escapes user content before generating HTML.
			*/
			preview.innerHTML = markdown.renderMarkdown(contents);

			container.replaceChildren(
				preview,

				E('div', {
					'class': 'cbi-page-actions',
					'style': 'text-align: right;'
				}, [
					E('button', {
						'class': 'btn cbi-button cbi-button-action',
						'click': showEdit
					}, _('Edit'))
				])
			);
		}

		function showEdit() {
			let textarea = E('textarea', {
				'style': [
					'width: 100%',
					'min-height: 500px',
					'font-family: monospace',
					'box-sizing: border-box'
				].join(';')
			}, [
				contents
			]);

			container.replaceChildren(
				textarea,

				E('div', {
					'class': 'cbi-page-actions',
					'style': 'text-align: right;'
				}, [
					E('button', {
						'class': 'btn',
						'click': showView
					}, _('Cancel')),

					E('button', {
						'class': 'btn cbi-button cbi-button-save',
						'click': function() {
							return writeNotes(textarea.value)
								.then(function(result) {
									if (result && result.success) {
										contents = textarea.value;
										showView();
									} else {
										let message = _('Failed to save notes.');

										if (result && result.error === 'open_read')
											message = _('Could not open file for reading: %s').format(result.path);
										else if (result && result.error === 'open_write')
											message = _('Could not open file for writing: %s').format(result.path);
										else if (result && result.error === 'write_incomplete')
											message = _('Could not write complete file: %s').format(result.path);
										else if (result && result.error)
											message = result.error;

										alert(message);
									}
								});
						}
					}, _('Save'))
				])
			);

			textarea.focus();
		}

		container = E('div', {}, [
			E('h2', {}, _('Notes'))
		]);

		showView();

		return container;
	}
});
