#!/usr/bin/env bash
# Downloads the Figma images listed in scripts/figma-assets.tsv into assets/.
# Skips files that already exist. Fails if any download is not a real image.
# Run from the repo root:  bash scripts/fetch-assets.sh
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p assets

fail=0
while IFS=$'\t' read -r name url; do
  [[ -z "${name}" || "${name}" == \#* ]] && continue
  out="assets/${name}"
  if [[ -s "${out}" ]]; then
    echo "skip   ${name}"
    continue
  fi
  tmp="$(mktemp)"
  code="$(curl -sSL -o "${tmp}" -w '%{http_code}' "${url}" || echo 000)"
  type="$(file -b --mime-type "${tmp}" 2>/dev/null || echo unknown)"
  if [[ "${code}" == "200" && ( "${type}" == image/* || "${type}" == text/xml || "${type}" == text/plain ) ]]; then
    mv "${tmp}" "${out}"
    echo "saved  ${name} (${type})"
  else
    rm -f "${tmp}"
    echo "FAILED ${name}: HTTP ${code}, ${type}" >&2
    fail=1
  fi
done < scripts/figma-assets.tsv

if [[ "${fail}" -ne 0 ]]; then
  echo "Some images failed. The Figma links may have expired: export those layers from Figma into assets/ by hand." >&2
  exit 1
fi
