# LifeCare Staffing – Troubleshooting & "What to do next"

## 1) If GitHub says there are merge conflicts
Conflicts commonly happen in:
- `public/admin.html`
- `public/admin.js`
- `public/styles.css`

### Recommended commands
```bash
git checkout main
git pull origin main

git checkout codex/create-template-for-multi-founder-website-pdiada
git merge main
```

Then open conflicted files and remove conflict markers:
- `<<<<<<< HEAD`
- `=======`
- `>>>>>>> main`

Keep the latest **field-based admin editor** version (not raw JSON textarea), then:

```bash
git add public/admin.html public/admin.js public/styles.css
git commit -m "Resolve merge conflicts on admin files"
git push
```

---

## 2) Quick local health check
Run:
```bash
npm run check
```

This validates server and frontend scripts for syntax issues.

---

## 3) Start app locally
```bash
npm start
```

Open:
- Homepage: `http://localhost:4173/`
- Admin: `http://localhost:4173/admin`

Default password is controlled by `ADMIN_PASSWORD`.

---

## 4) Render deployment checklist
1. Push latest branch to GitHub.
2. In Render, create **Web Service** from this repo.
3. Set start command: `npm start`.
4. Add env var:
   - `ADMIN_PASSWORD=your-strong-password`
5. Deploy and verify `/` and `/admin`.

---

## 5) Important persistence note
Current content is saved to:
- `data/content.json`

If your Render instance is restarted/redeployed, local filesystem writes may not persist depending on plan/config.
For production persistence, move content storage to persistent disk or database.
