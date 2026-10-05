include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-notes
PKG_VERSION:=0.1.0
PKG_RELEASE:=3

PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=Viktors Zilinskis

LUCI_TITLE:=LuCI Notes
LUCI_DEPENDS:=+luci-base +rpcd +rpcd-mod-ucode
LUCI_PKGARCH:=all
LUCI_DESCRIPTION:=Simple Markdown notes application for LuCI.

LUCI_MINIFY_JS:=0
LUCI_MINIFY_CSS:=0

define Package/$(PKG_NAME)/conffiles
/etc/notes.md
endef

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	/usr/libexec/luci-app-notes-default 2>/dev/null || true
	/etc/init.d/ucitrack reload 2>/dev/null || true
	rm -f /tmp/luci-indexcache*
	rm -rf /tmp/luci-modulecache
	/etc/init.d/rpcd restart 2>/dev/null
}
exit 0
endef

define Package/$(PKG_NAME)/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	rm -f /tmp/luci-indexcache*
	rm -rf /tmp/luci-modulecache
	/etc/init.d/rpcd restart 2>/dev/null
}
exit 0
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
