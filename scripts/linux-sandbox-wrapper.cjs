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
// renamed to `<name>.bin` and replaced by a small launcher that adds
// `--no-sandbox` only when neither sandbox mode can work. The .deb keeps the
// full sandbox: its post-install script makes chrome-sandbox setuid root when
// user namespaces are unavailable.
const fs = require('node:fs/promises')
const path = require('node:path')

const launcher = (binName) => `#!/bin/sh
# BookLib launcher: see scripts/linux-sandbox-wrapper.cjs
HERE="$(dirname "$(readlink -f "$0")")"
BIN="$HERE/${binName}"

sandbox_works() {
  # Test hook to simulate a system without user namespaces
  [ -n "$BOOKLIB_FORCE_NO_USERNS" ] && return 1
  # Chromium's user namespace sandbox
  if [ -L /proc/self/ns/user ] && command -v unshare >/dev/null 2>&1 &&
    unshare --user true >/dev/null 2>&1; then
    return 0
  fi
  # setuid helper, as set up by the .deb post-install script
  SANDBOX="$HERE/chrome-sandbox"
  [ -u "$SANDBOX" ] && [ "$(stat -c %u "$SANDBOX" 2>/dev/null)" = "0" ]
}

if sandbox_works; then
  exec "$BIN" "$@"
else
  exec "$BIN" --no-sandbox "$@"
fi
`

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return

  const name = context.packager.executableName
  const exe = path.join(context.appOutDir, name)
  const bin = `${name}.bin`

  await fs.rename(exe, path.join(context.appOutDir, bin))
  await fs.writeFile(exe, launcher(bin), { mode: 0o755 })
}
