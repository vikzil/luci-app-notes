# LuCI Notes

A lightweight Markdown notes application for LuCI, storing content in a single plain-text file on the router. 

## Description

This app adds a Notes page to LuCI (System -> Notes) backed by `/etc/notes.md`. It uses:

- An rpcd ucode backend (notes ubus object) for reading and writing the file
- A JavaScript LuCI view for the editor/viewer UI
- A small custom Markdown-to-HTML renderer without external dependencies

Note: there is currently no live preview while editing. Formatting is applied after you save and switch back to view mode.

## Compatibility

Both .ipk and .apk packages are built with LUCI_PKGARCH:=all option and should run on any OpenWrt-supported architecture.

Tested and working with both OpenWrt package formats:

- .ipk - tested on x86_64, OpenWrt v24.10.8
- .apk - tested on x86_64, OpenWrt v25.12.5

## Installation

Download the appropriate package for your OpenWrt version from the [latest release](https://github.com/vikzil/luci-app-notes/releases/latest). 

To use a translated interface and localized default notes, also download the corresponding `luci-i18n-notes-*` language package.

There is currently no custom package repository, so these packages are not signed by a trusted repository.

### apk (OpenWrt v25.x and later)

Install the application package with --allow-untrusted:

`apk add --allow-untrusted /path/to/luci-app-notes-*.apk`

If using a language package, install it the same way. For example:

`apk add --allow-untrusted /path/to/luci-i18n-notes-*.apk`

### ipk (OpenWrt v24.x and earlier)

Install the application package:

`opkg install /path/to/luci-app-notes_*.ipk`

If using a language package, install it as well. For example:

`opkg install /path/to/luci-i18n-notes-*.ipk`

After installing, log in to LuCI and go to System -> Notes.

The file `/etc/notes.md` is a conffile, so it survives package upgrades and will not be overwritten if you have already edited it. 

If the default notes have not been modified, switching to a supported LuCI language also switches them to the corresponding localized version.

Uninstalling the package does not automatically delete `/etc/notes.md`. Remove it manually if you want a clean slate.

Note: Installing or uninstalling this package restarts rpcd to register or unregister its RPC backend. If you're logged in to LuCI at the time, you'll be logged out and need to log back in.

## Build Notes

- Place the package under `package/luci-app-notes/`.
- Run `make menuconfig` and make sure luci-app-notes is selected under:
  LuCI ---> 3. Applications --->
- To build support for additional languages, select the desired languages under:
  LuCI ---> 2. Modules ---> Translations --->
- Build just this package:
  `make package/luci-app-notes/{clean,compile} V=s`
- Verify that the package has been built:
```
find bin/packages -iname '*luci-app-notes*'
```

## Markdown Scope & Usage

LuCI Notes supports a small subset of Markdown. The examples below show the available formatting.

---

# Header 1
`# Header 1`

---

## Header 2
`## Header 2`

---

### Header 3
`### Header 3`

---

**Bold text**

`**Bold text**`

---

__Also bold text__

`__Also bold text__`

---

*Italic text*

`*Italic text*`

---

_Also italic text_

`_Also italic text_`

---

Inline `code` like this

\`code\`

---

> A blockquote

`> A blockquote`

---

- Unordered list item one
- Unordered list item two
+ Unordered list item three
+ Unordered list item four
* Unordered list item five
* Unordered list item six

`- Unordered list item one`

`- Unordered list item two`

`+ Unordered list item three`

`+ Unordered list item four`

`* Unordered list item five`

`* Unordered list item six`

---

1. Ordered list item one
2. Ordered list item two

`1. Ordered list item one`

`2. Ordered list item two`

---

```
function example() {
    return true;
}
```

\``` \
function example() { \
    return true; \
} \
\```

--- 

Special characters can be escaped using a backslash:

\*\*This text is not bold, because asterisks are escaped\*\*

`\*\*This text is not bold, because asterisks are escaped\*\*`

---

Horizontal rules:

`---`

---

## Not supported
- Links 
- Images
- Tables
- Nested lists
- HTML passthrough (input is escaped and not interpreted)
- Live preview while editing

---

## Screenshots

**Menu location**

![Notes entry in the LuCI menu](screenshots/menu.png)

**View mode**

![Notes description in view mode](screenshots/overview.png)

**Edit mode**

![Markdown source in edit mode](screenshots/markdown-edit.png)

**Rendered result**

![Rendered Markdown in view mode](screenshots/markdown-rendered.png)
