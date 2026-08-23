#!/usr/bin/env bash
set -euo pipefail

# Generate BUNGLE's own QZ Tray signing pair.
# Keep the private key on the POS server only. Import the public
# qz-rsa-cert.pem into QZ Tray Site Manager on each printing computer.

QZ_DIR="${1:-/etc/bungle/qz}"
CERT_FILE="$QZ_DIR/qz-rsa-cert.pem"
KEY_FILE="$QZ_DIR/private-key.pem"

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "Usage: $0 [certificate-directory]"
  echo "Default directory: /etc/bungle/qz"
  exit 0
fi

if [[ -e "$CERT_FILE" || -e "$KEY_FILE" ]]; then
  echo "Refusing to overwrite an existing QZ certificate or private key."
  echo "If rotation is intended, back up the current pair and remove both files first."
  exit 1
fi

mkdir -p "$QZ_DIR"
umask 077

openssl req \
  -x509 \
  -newkey rsa:2048 \
  -sha256 \
  -days 3650 \
  -nodes \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -subj "/O=BUNGLE/CN=BUNGLE POS QZ Signing" \
  -addext "keyUsage=digitalSignature" \
  -addext "basicConstraints=critical,CA:FALSE"

chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo "Generated:"
echo "  Public certificate: $CERT_FILE"
echo "  Private key:        $KEY_FILE"
echo
echo "Import only $CERT_FILE into QZ Tray Site Manager."
echo "Never upload or share $KEY_FILE."