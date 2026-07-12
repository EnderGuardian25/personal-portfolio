# CLAUDE.md

Project guidance for Claude Code. See `README.md` for setup/customize and `HANDOFF.md` for full architecture, design rules, and server/infra notes.

## ⚠️ This is a PUBLIC repository — no personal information

The GitHub repo (`EnderGuardian25/personal-portfolio`) and the `main` branch are public. Anything committed — **including anything in git history** — is world-readable forever. Before committing, make sure none of the following ever lands in a tracked file:

**Never commit:**
- **The full CV/résumé** — it contains home address, date of birth, personal email, and third-party referees' phone numbers/emails. The real PDF lives in `assets/private/` (gitignored). The site's Résumé section uses a `mailto:` "Request CV" button instead of serving a file. If a résumé must be published, publish only a **sanitized** version (no address, no DOB, no referee contact details).
- **Raw photo originals** — phone photos carry **GPS EXIF** (exact coordinates) and camera serials. Keep originals in `assets/` (gitignored); only commit the EXIF-stripped, optimized copies in `public/photography/` (produced by `npm run optimize-photos`). Verify new images have no EXIF/GPS before committing.
- **Server / infrastructure details** — the VPS IP address, SSH config, `deploy.sh`, or any file naming the host. `deploy.sh` lives on the server only, never in the repo.
- **Secrets** — API keys, tokens, passwords, private keys, `.env*` files.
- **Machine/session state** — e.g. `.claude/scheduled_tasks.lock` and other local-only artifacts.

**Deliberately public (do NOT scrub):** the business contact email and WhatsApp number in `lib/site.js`, and the social links in `SOCIALS`. These are intentional public contact info for a freelance site — leave them as-is.

**Before any commit or push to a public branch:** scan the staged diff for the categories above (IPs, emails beyond the intended contact address, phone numbers, addresses, EXIF-bearing images, secrets). If personal data has already reached history, sanitizing the working tree is not enough — the history must be rewritten (e.g. `git filter-repo`) and force-pushed.

The `.gitignore` already excludes `assets/private/`, `assets/photography-originals/`, `.env*.local`, and `.claude/scheduled_tasks.lock` — keep those rules intact.

## Build / verify

- Dev: `npm run dev` (http://localhost:3000). Use `lab.localhost:3000` to exercise the lab subdomain locally.
- Never run `npm run build` while `next dev` is running — they share `.next` and clobber each other.
- The lab is served at **lab.damiandc.com** via `proxy.js`; `damiandc.com/lab` returns a 404 by design. Don't "fix" that 404.
