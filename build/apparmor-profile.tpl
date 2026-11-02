abi <abi/4.0>,
include <tunables/global>

# Lets the Electron binary use user namespaces for Chromium's sandbox on
# Ubuntu 24.04+. It targets `<executable>.bin`, the real binary behind the
# launcher script (see scripts/linux-sandbox-wrapper.cjs).
profile "${executable}" "/opt/${sanitizedProductName}/${executable}.bin" flags=(unconfined) {
  userns,

  # Site-specific additions and overrides. See local/README for details.
  include if exists <local/${executable}>
}
