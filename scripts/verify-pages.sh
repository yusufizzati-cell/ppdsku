#!/bin/bash
# Verify Fase 1 pages render with expected content
BASE="http://localhost:3000"

check() {
  local path="$1"
  local needle="$2"
  local code
  code=$(curl -s -o /tmp/vp.html -w "%{http_code}" "$BASE$path")
  if [ "$code" = "200" ] && grep -q "$needle" /tmp/vp.html; then
    echo "PASS  $path (HTTP $code, found: \"$needle\")"
  else
    echo "FAIL  $path (HTTP $code, missing: \"$needle\")"
  fi
}

echo "=== Fase 1 Page Verification ==="
check "/" "Tau kelemahan kamu"
check "/onkrad/quiz" "Onkologi Radiasi"
check "/upgrade" "Upgrade ke PRO"
check "/payment/pending" "Menunggu Konfirmasi"
check "/payment/failed" "Belum Berhasil"
check "/auth/login" "Masuk"
check "/auth/register" "Buat Akun"
check "/api/subscription/status" "success"
echo "=== Done ==="
