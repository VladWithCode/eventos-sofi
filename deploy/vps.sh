#!/usr/bin/env bash
# Deploy to a VPS that runs nginx + pm2 (no Docker, no dependency install on the server).
#
# What it does, in order:
#   1. Takes a snapshot of the database the site will run with (see "Why a snapshot" below).
#   2. Builds the Next.js standalone bundle here against that snapshot (no build on the VPS).
#   3. Stops the pm2 app and rsyncs the bundle to $DEPLOY_DIR/app.
#   4. With data: replaces $DEPLOY_DIR/data (SQLite database + uploaded photos) with the local one.
#      Admin accounts live in the database: with ADMIN_EMAIL and ADMIN_PASSWORD set in
#      vps.env the server starts with that single account, otherwise the local accounts are copied.
#   5. Writes $DEPLOY_DIR/ecosystem.config.cjs (secrets, mode 600) and starts the app with pm2.
#
# Layout on the VPS:
#   $DEPLOY_DIR/app    replaced on every deploy
#   $DEPLOY_DIR/data   sofi.db + uploads/, never touched by --code-only; BACK THIS UP
#   $DEPLOY_DIR/app/data -> ../data   (the app reads ./data relative to its own folder)
#
# Why a snapshot: the public pages are prerendered at build time from the database, and stay
# that way until someone edits content in the admin. So the build must read the same content
# the server will have: the local database when data is pushed, the VPS database otherwise.
#
# nginx is not touched. In your server block:
#   client_max_body_size 15m;                      # photo uploads from the admin (12 MB each)
#   location / {
#     proxy_pass http://127.0.0.1:$DEPLOY_PORT;
#     proxy_set_header Host $host;
#     proxy_set_header X-Forwarded-For $remote_addr;   # rate limits and Meta matching use it
#     proxy_set_header X-Forwarded-Proto $scheme;
#   }
# Serve it over HTTPS: the admin session cookie is Secure in production.
#
# Setup once:
#   cp deploy/vps.env.example deploy/vps.env   # then edit
#
# Usage:
#   ./deploy/vps.sh --code-only  build + code; keeps the VPS database and uploads (normal deploy)
#   ./deploy/vps.sh              build + code + local data (asks before replacing the VPS data)
#   ./deploy/vps.sh --yes        same, no confirmation prompt
set -euo pipefail
cd "$(dirname "$0")/.."

with_data=1
assume_yes=0
for arg in "$@"; do
  case $arg in
    --code-only) with_data=0 ;;
    --yes) assume_yes=1 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

die() { echo "error: $*" >&2; exit 1; }
step() { printf '\n==> %s\n' "$*"; }

[ -f deploy/vps.env ] || die "missing deploy/vps.env (copy deploy/vps.env.example)"
# KEY=value lines are read literally, never run as shell: a password such as pa$4word would
# otherwise be expanded ("$4: unbound variable"). One pair of surrounding quotes is removed.
while IFS= read -r line || [ -n "$line" ]; do
  line=${line%$'\r'}
  [[ $line =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]] || continue
  key=${BASH_REMATCH[1]}
  value=${BASH_REMATCH[2]}
  if [[ $value =~ ^\"(.*)\"$ || $value =~ ^\'(.*)\'$ ]]; then value=${BASH_REMATCH[1]}; fi
  export "$key=$value"
done < deploy/vps.env

: "${DEPLOY_SSH:?set DEPLOY_SSH in deploy/vps.env}"
: "${DEPLOY_DIR:?set DEPLOY_DIR in deploy/vps.env}"
: "${DEPLOY_URL:?set DEPLOY_URL in deploy/vps.env}"
DEPLOY_PORT=${DEPLOY_PORT:-3020}
DEPLOY_PM2_NAME=${DEPLOY_PM2_NAME:-eventos-sofi}
DEPLOY_URL=${DEPLOY_URL%/}
# Loopback only: nginx is the single way in, so the port needs no firewall rule.
DEPLOY_BIND=${DEPLOY_BIND:-127.0.0.1}

# Optional. The app creates this account only in a database that has no users yet, so on a
# --code-only deploy to a server that already has accounts these two are ignored.
ADMIN_EMAIL=${ADMIN_EMAIL:-}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-}
# Optional. Without a Pixel id the site runs with Meta tracking off.
NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID:-}
META_CAPI_TOKEN=${META_CAPI_TOKEN:-}
META_TEST_EVENT_CODE=${META_TEST_EVENT_CODE:-}
META_DOMAIN_VERIFICATION=${META_DOMAIN_VERIFICATION:-}

local_db=data/sofi.db
[ "$with_data" = 0 ] || [ -f "$local_db" ] || die "$local_db not found (run the site locally once, or use --code-only)"

work=$(mktemp -d)
ctl="$work/ssh.sock"
ssh_opts=(-o ControlMaster=auto -o "ControlPath=$ctl" -o ControlPersist=120)
cleanup() {
  ssh "${ssh_opts[@]}" -O exit "$DEPLOY_SSH" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

# Runs a bash script on the VPS with positional args; loads nvm when present (pm2/node often live there).
remote() {
  local script=$1; shift
  ssh "${ssh_opts[@]}" "$DEPLOY_SSH" "bash -s -- $(printf '%q ' "$@")" <<<'set -euo pipefail
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
'"$script"
}

# Copies a SQLite database into one clean file, safe while another process has it open
# (a plain file copy could miss changes that still sit in the -wal file). Args: source, target.
snapshot_js='const { DatabaseSync } = require("node:sqlite"); const db = new DatabaseSync(process.argv[1]); db.prepare("VACUUM INTO ?").run(process.argv[2]); db.close();'

step "Checking $DEPLOY_SSH"
read -r r_arch r_node < <(remote 'echo "$(uname -m) $(node -v 2>/dev/null || echo none)"')
[ "$r_arch" = "$(uname -m)" ] || die "VPS is $r_arch, this machine is $(uname -m): sharp's native binary would not match"
[ "$r_node" != none ] || die "node not found on the VPS"
r_major=${r_node#v}; r_major=${r_major%%.*}
[ "$r_major" -ge 24 ] || die "VPS node $r_node is too old (the app uses the built-in node:sqlite, Node >= 24)"
remote 'command -v pm2 >/dev/null' || die "pm2 not found on the VPS"
echo "VPS: $r_arch, node $r_node, pm2 ok"

if [ "$with_data" = 1 ] && [ "$assume_yes" = 0 ]; then
  echo
  echo "This REPLACES the database and uploaded photos in $DEPLOY_SSH:$DEPLOY_DIR/data with the"
  echo "local ./data. Bookings and messages received on the VPS will be lost."
  echo "Use --code-only to keep them."
  read -r -p "Type the app name ($DEPLOY_PM2_NAME) to continue: " ok
  [ "$ok" = "$DEPLOY_PM2_NAME" ] || die "aborted"
fi

build_db="$work/site.db"
if [ "$with_data" = 1 ]; then
  step "Snapshot of the local database"
  node -e "$snapshot_js" "$local_db" "$build_db"
else
  step "Snapshot of the VPS database"
  has_remote_db=$(remote '[ -f "$1/data/sofi.db" ] && echo yes || echo no' "$DEPLOY_DIR")
  if [ "$has_remote_db" = yes ]; then
    remote 'rm -f "$1/data/.deploy-snapshot.db"; node -e "$2" "$1/data/sofi.db" "$1/data/.deploy-snapshot.db"' \
      "$DEPLOY_DIR" "$snapshot_js"
    rsync -az -e "ssh ${ssh_opts[*]}" "$DEPLOY_SSH:$DEPLOY_DIR/data/.deploy-snapshot.db" "$build_db"
    remote 'rm -f "$1/data/.deploy-snapshot.db"' "$DEPLOY_DIR"
  else
    echo "No database on the VPS yet: building with the starter content, which the app creates on first start."
  fi
fi
[ -f "$build_db" ] && du -h "$build_db" | cut -f1

step "Building (NEXT_PUBLIC_SITE_URL=$DEPLOY_URL)"
# Shell variables take precedence over .env.local during the build.
# The admin variables are blanked so a local test account is never created in the build database.
DATABASE_PATH=$build_db \
ADMIN_EMAIL='' \
ADMIN_PASSWORD='' \
NEXT_PUBLIC_SITE_URL=$DEPLOY_URL \
NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID \
META_DOMAIN_VERIFICATION=$META_DOMAIN_VERIFICATION \
NEXT_TELEMETRY_DISABLED=1 \
  pnpm build

bundle="$work/app"
cp -a .next/standalone "$bundle"
mkdir -p "$bundle/.next"
cp -a .next/static "$bundle/.next/static"
# The build traces this machine's data/ (uploads) and seed/ into the bundle. Local data must
# never ship inside the app folder, and seed is copied fresh below.
rm -rf "$bundle/public" "$bundle/seed" "$bundle/data"
cp -a public "$bundle/public"
# Starter photos: copied into data/uploads by the app the first time it creates the database.
cp -a seed "$bundle/seed"
rm -f "$bundle"/.env*

step "Uploading app to $DEPLOY_SSH:$DEPLOY_DIR/app"
remote 'mkdir -p "$1/app" "$1/data/uploads"; pm2 stop "$2" >/dev/null 2>&1 || true' "$DEPLOY_DIR" "$DEPLOY_PM2_NAME"
# --exclude keeps the data symlink out of --delete's reach.
rsync -az --delete --exclude=/data -e "ssh ${ssh_opts[*]}" "$bundle/" "$DEPLOY_SSH:$DEPLOY_DIR/app/"
remote 'ln -sfn ../data "$1/app/data"' "$DEPLOY_DIR"

if [ "$with_data" = 1 ]; then
  step "Replacing database and uploads"
  # The build may have written to its copy; snapshot again so one clean file is uploaded.
  node -e "$snapshot_js" "$build_db" "$work/upload.db"
  if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
    # The app creates the vps.env admin only in a database without users, so the local
    # (development) accounts must not travel with the data.
    node -e 'const { DatabaseSync } = require("node:sqlite"); const db = new DatabaseSync(process.argv[1]); db.exec("DELETE FROM sessions; DELETE FROM users;"); db.close();' "$work/upload.db"
    echo "Admin account: $ADMIN_EMAIL (from deploy/vps.env), created when the app starts"
  else
    echo "Admin accounts: copied from the local database (ADMIN_EMAIL/ADMIN_PASSWORD not set in deploy/vps.env)"
  fi
  remote 'rm -f "$1/data/sofi.db" "$1/data/sofi.db-wal" "$1/data/sofi.db-shm"' "$DEPLOY_DIR"
  rsync -az -e "ssh ${ssh_opts[*]}" "$work/upload.db" "$DEPLOY_SSH:$DEPLOY_DIR/data/sofi.db"
  mkdir -p data/uploads
  rsync -az --delete -e "ssh ${ssh_opts[*]}" data/uploads/ "$DEPLOY_SSH:$DEPLOY_DIR/data/uploads/"
fi

step "Starting $DEPLOY_PM2_NAME with pm2 on port $DEPLOY_PORT"
node -e '
const [name, dir, port, bind, ...kv] = process.argv.slice(1);
const env = { NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1", PORT: port, HOSTNAME: bind };
for (let i = 0; i < kv.length; i += 2) if (kv[i + 1]) env[kv[i]] = kv[i + 1];
const app = { name, cwd: dir + "/app", script: "server.js", exec_mode: "fork", instances: 1, max_memory_restart: "512M", env };
process.stdout.write("module.exports = " + JSON.stringify({ apps: [app] }, null, 2) + ";\n");
' "$DEPLOY_PM2_NAME" "$DEPLOY_DIR" "$DEPLOY_PORT" "$DEPLOY_BIND" \
  NEXT_PUBLIC_SITE_URL "$DEPLOY_URL" \
  ADMIN_EMAIL "$ADMIN_EMAIL" \
  ADMIN_PASSWORD "$ADMIN_PASSWORD" \
  NEXT_PUBLIC_META_PIXEL_ID "$NEXT_PUBLIC_META_PIXEL_ID" \
  META_CAPI_TOKEN "$META_CAPI_TOKEN" \
  META_TEST_EVENT_CODE "$META_TEST_EVENT_CODE" \
  META_DOMAIN_VERIFICATION "$META_DOMAIN_VERIFICATION" \
  > "$work/ecosystem.config.cjs"
chmod 600 "$work/ecosystem.config.cjs"
rsync -a --chmod=F600 -e "ssh ${ssh_opts[*]}" "$work/ecosystem.config.cjs" "$DEPLOY_SSH:$DEPLOY_DIR/ecosystem.config.cjs"

remote '
# delete + start so env changes in the ecosystem file always apply
pm2 delete "$3" >/dev/null 2>&1 || true
pm2 start "$1/ecosystem.config.cjs" >/dev/null
pm2 save >/dev/null
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$2/" || true)
  if [ "$code" = 200 ]; then
    # The admin login reads the database at request time; the home page is prerendered.
    code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$2/admin/login" || true)
    [ "$code" = 200 ] && { echo "health: / and /admin/login return 200 on port $2"; exit 0; }
  fi
  sleep 2
done
echo "health check failed (last status: ${code:-none}). Recent logs:" >&2
pm2 logs "$3" --lines 40 --nostream >&2
exit 1
' "$DEPLOY_DIR" "$DEPLOY_PORT" "$DEPLOY_PM2_NAME"

step "Done: $DEPLOY_URL (nginx -> 127.0.0.1:$DEPLOY_PORT)"
