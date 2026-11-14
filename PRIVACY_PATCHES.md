# Privacy patches (fork-specific)

This fork of [Stigmatoz/web-activity-time-tracker](https://github.com/Stigmatoz/web-activity-time-tracker) is hardened so that no tracked data leaves the device. This file is the checklist of standing patches to re-apply after every upstream merge.

## Standing patches

| # | Patch | Files |
|---|---|---|
| 1 | Favicons come from Chrome's local `_favicon` API (`chrome-extension://<id>/_favicon/?pageUrl=...`) instead of `google.com/s2/favicons`, which received every tracked domain. Needs the `favicon` permission. | `src/utils/favicon.ts`, `src/manifest.json`, `src/components/TabItem.vue`, `src/components/WebsiteStats.vue`, `src/pages/Block.vue` |
| 2 | No uninstall URL (`setUninstallURL` to `webtracker.online`). | `src/background.ts` |
| 3 | No release-notes tab on update, and the "Show changelog" setting is removed (code, UI, storage param). | `src/background.ts`, `src/components/GeneralSettings.vue`, `src/storage/storage-params.ts` |
| 4 | Strict extension-page CSP: `default-src 'self'; script-src 'self'; object-src 'self'; connect-src 'none'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; media-src 'self'; frame-src 'none'` | `src/manifest.json` |
| 5 | Build does not inline the build machine's environment: `'process.env': {}`. | `vite.config.ts` |

Quick check that they are still in place:
```bash
grep -rn "google.com/s2\|webtracker.online\|setUninstallURL\|SHOW_CHANGELOG" src      # expect no matches
grep -n "connect-src 'none'\|\"favicon\"" src/manifest.json                            # expect both
grep -n "'process.env'" vite.config.ts                                                 # expect {}
```

## Known remaining outbound links (user-click only)
GitHub links, Chrome Web Store review/support links, the promo for the author's YouTube extension (`utm_source=watt`), plus the review prompt and promo modal UI. Candidates for removal if wanted: `src/utils/chrome-url.ts`, `src/components/{Review,PromoClearYouTube,PromoCleanYoutubeModal,MyApps,About}.vue`.

## Personal tweaks
None yet. List them here so syncs preserve them.

## Build
The lockfile is version 5.4, so it needs **pnpm 7** (Node 20 works).
```bash
npx pnpm@7 install --frozen-lockfile
npx pnpm@7 exec vite build --mode production   # output in dist/
```
`dist/`, `node_modules/` and `artifacts/` are gitignored.

## Install (load unpacked)
Chrome on macOS can't install `.crx` files from outside the Web Store.
1. `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → choose `dist/`.
2. **Don't move or rename `dist/`.** The unpacked extension's ID comes from its path; a new path means a new extension with empty data. After rebuilding, overwrite the same folder and click reload.

## Migrating history from the Web Store version
Extension storage is per extension ID, so this build can't read the store version's data automatically.
1. Don't uninstall the public version yet (that deletes its data).
2. Public extension: Settings → General → **Backup**; check the JSON isn't empty.
3. Load this build, then Settings → General → **Restore** with that JSON. Re-enter any limits or whitelist entries that didn't come back.
4. Only then uninstall the public version.

Take a Backup before every future update as well.

## Verify no data leaves the device
DevTools → Network on the popup, the dashboard, and the service worker. Expect zero external requests.

## Audit log
- 2026-11-14: initial audit and hardening (commit `6645120`). Build verified; `dist/` free of `google.com/s2` and `webtracker.online`; `vue-tsc` error count unchanged (12 pre-existing). Not yet browser-tested.
