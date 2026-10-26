#!/usr/bin/env bash
set -euo pipefail
# Run only in an approved admin environment with PG* credentials already configured.
# Do not put credentials in argv or paste them into chat.
: "${SPACEOPS_BACKUP_PATH:?Set an absolute output path outside the git checkout}"
case "$SPACEOPS_BACKUP_PATH" in /*) ;; *) echo 'Use an absolute backup path'; exit 1;; esac
if test -e "$SPACEOPS_BACKUP_PATH"; then echo 'Backup path already exists; choose a new path'; exit 1; fi
umask 077
pg_dump --format=custom --no-owner --file="$SPACEOPS_BACKUP_PATH"
pg_restore --list "$SPACEOPS_BACKUP_PATH" >/dev/null
printf '%s\n' 'Backup created and archive index validated. Restore-test it in an isolated database before migrating.'
