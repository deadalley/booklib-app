// electron-builder afterPack hook (Linux only).
//
// On distributions that block unprivileged user namespaces (e.g. Ubuntu
// 24.04+ via AppArmor), Chromium falls back to the setuid `chrome-sandbox`
// helper. Inside an AppImage that helper is on a user-owned FUSE mount, so it
// can never be setuid root and the app aborts on start with
// "The SUID sandbox helper binary was found, but is not configured correctly".
//
// electron-builder only adds `--no-sandbox` to the AppImage's embedded
// .desktop entry, not when the AppImage is run directly. So the real binary is
// renamed to `<name>.bin` and replaced by a small launcher that, only when
// running from an AppImage, adds `--no-sandbox` if user namespaces can't be
// used. The .deb keeps the full sandbox: it installs an AppArmor profile for
// `<name>.bin` (build/apparmor-profile.tpl) and makes chrome-sandbox setuid
// root where user namespaces are unavailable.
const fs = require('node:fs/promises')
const path = require('node:path')

const launcher = (binName) => `#!/bin/sh
# BookLib launcher: see scripts/linux-sandbox-wrapper.cjs
HERE="$(dirname "$(readlink -f "$0")")"
BIN="$HERE/${binName}"

# Can Chromium's user namespace sandbox work for an unconfined process?
userns_sandbox_works() {
  # Test hook to simulate a system without usable user namespaces
  [ -n "$BOOKLIB_FORCE_NO_USERNS" ] && return 1
  # Ubuntu 24.04+: AppArmor strips capabilities in new user namespaces of
  # programs without their own profile, which AppImages can't have
  [ "$(cat /proc/sys/kernel/apparmor_restrict_unprivileged_userns 2>/dev/null)" = "1" ] && return 1
  # Debian and older kernels can switch them off entirely
  [ "$(cat /proc/sys/kernel/unprivileged_userns_clone 2>/dev/null)" = "0" ] && return 1
  # Otherwise try it: create a namespace and map our user to root in it
  command -v unshare >/dev/null 2>&1 || return 1
  unshare --user --map-root-user true >/dev/null 2>&1
}

# Inside an AppImage the setuid chrome-sandbox helper can never be root-owned,
# so without user namespaces Chromium would abort on start. Installed
# packages (.deb) keep the full sandbox: they ship an AppArmor profile or a
# setuid helper.
if [ -n "$APPIMAGE" ] && ! userns_sandbox_works; then
  exec "$BIN" --no-sandbox "$@"
fi
exec "$BIN" "$@"
`

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return

  const name = context.packager.executableName
  const exe = path.join(context.appOutDir, name)
  const bin = `${name}.bin`

  await fs.rename(exe, path.join(context.appOutDir, bin))
  await fs.writeFile(exe, launcher(bin), { mode: 0o755 })
}
