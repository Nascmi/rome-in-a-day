# Deployment and Release

## Production

- Firebase project: `rome-in-a-day-nathan`
- Public URL: https://rome-in-a-day-nathan.web.app
- GitHub repository: https://github.com/Nascmi/rome-in-a-day
- Production branch: `main`

Firebase Hosting serves the statically exported `out/` directory.

## Local Validation

Install dependencies:

```powershell
npm install
```

Run locally:

```powershell
npm run dev
```

Create the production export:

```powershell
npm run build
```

Expected result:

- The build completes successfully.
- Route `/` is statically generated.
- `out/manifest.webmanifest` exists.
- `out/sw.js` exists.

Check patch formatting:

```powershell
git diff --check
```

## Firebase Release

```powershell
firebase deploy --only hosting --project rome-in-a-day-nathan
```

Verify:

```powershell
Invoke-WebRequest -Uri "https://rome-in-a-day-nathan.web.app/" -UseBasicParsing
Invoke-WebRequest -Uri "https://rome-in-a-day-nathan.web.app/manifest.webmanifest" -UseBasicParsing
Invoke-WebRequest -Uri "https://rome-in-a-day-nathan.web.app/sw.js" -UseBasicParsing
```

All endpoints should return HTTP 200.

## GitHub Release

The local repository tracks:

```text
origin https://github.com/Nascmi/rome-in-a-day.git
```

After validation and an intentional commit:

```powershell
git push origin main
```

Confirm:

```powershell
git status -sb
git log -1 --oneline --decorate
```

The expected status is a clean `main...origin/main`.

## Release Checklist

1. Confirm the worktree contains only intended changes.
2. Run `npm run build`.
3. Run `git diff --check`.
4. Perform phone-size visual review for UI changes.
5. Test campaign completion if victory logic changed.
6. Increment the service-worker cache name when stale offline assets could persist.
7. Commit the validated source.
8. Deploy the exact built source to Firebase.
9. Push the same commit to GitHub.
10. Verify the public page, manifest, and service worker.
11. Record the Firebase version and Git commit in the handoff.

## Rollback

Firebase retains Hosting versions. Use the Firebase Console to select a previously known-good Hosting release if production is broken.

For source rollback, prefer a new revert commit rather than rewriting `main` history:

```powershell
git revert <bad-commit>
git push origin main
```

Then rebuild and redeploy Firebase from the reverted source.

## Connected OpenAI Site

`.openai/hosting.json` contains a separate connected Sites project identifier. Public internet publishing was disabled for that workspace, so the player-facing production release uses Firebase Hosting. Do not replace the Firebase deployment with the connected Sites project unless anonymous public access is verified.

