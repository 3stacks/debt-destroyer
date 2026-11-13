#!/usr/bin/env bash
# Run the Maestro flows on a simulator or an emulator that is open now.
#   scripts/e2e.sh ios [flow]       the booted iOS simulator
#   scripts/e2e.sh android [flow]   the first Android device that adb shows
#   scripts/e2e.sh both [flow]      both at the same time
#   scripts/e2e.sh expo-go-ios      Expo Go on the booted iOS simulator (run `npm run start:e2e` first)
# Give a flow file, for example maestro/flows/03-refinance.yaml, to run only that flow.
set -euo pipefail
cd "$(dirname "$0")/.."

platform="${1:-}"
target="${2:-maestro}"
APP_ID="${APP_ID:-com.lukeboyle.debtdestroyer}"

ios_device() {
  xcrun simctl list devices booted -j | python3 -c 'import json,sys; d=[x for v in json.load(sys.stdin)["devices"].values() for x in v if x["state"]=="Booted"]; print(d[0]["udid"] if d else "")'
}
android_device() {
  adb devices | awk 'NR>1 && $2=="device" {print $1; exit}'
}

run() { # <device> <app id> <link> <output name>
  echo "Running the flows on $4 ($1)"
  maestro --device "$1" test -e APP_ID="$2" -e LINK="$3" --test-output-dir "maestro-output/$4" "$target"
}

case "$platform" in
  ios)
    device=$(ios_device); [ -n "$device" ] || { echo "Boot an iOS simulator first." >&2; exit 1; }
    run "$device" "$APP_ID" "debtdestroyer://" ios ;;
  android)
    device=$(android_device); [ -n "$device" ] || { echo "Start an Android emulator first." >&2; exit 1; }
    run "$device" "$APP_ID" "debtdestroyer://" android ;;
  both)
    "$0" ios "$target" & ios_pid=$!
    "$0" android "$target" & android_pid=$!
    status=0
    wait "$ios_pid" || status=1
    wait "$android_pid" || status=1
    exit "$status" ;;
  expo-go-ios)
    device=$(ios_device); [ -n "$device" ] || { echo "Boot an iOS simulator first." >&2; exit 1; }
    run "$device" host.exp.Exponent "exp://127.0.0.1:8081/--/" expo-go-ios ;;
  *)
    sed -n '2,8p' "$0"; exit 2 ;;
esac
