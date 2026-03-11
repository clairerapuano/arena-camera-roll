# Deploying to clairescameraroll.com

## Option A: Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project** and import `clairerapuano/arena-camera-roll`
3. Configure:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Add your custom domain: **Project Settings** → **Domains** → add `clairescameraroll.com`
5. Click **Deploy**

After setup, every `git push` to your main branch will auto-deploy.

---

## Option B: Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **Add new site** → **Import an existing project** → choose GitHub → select the repo
3. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add custom domain: **Domain settings** → **Add custom domain** → `clairescameraroll.com`
5. Click **Deploy site**

---

## Option C: GitHub Pages

1. In your repo, go to **Settings** → **Pages**
2. Under **Build and deployment**:
   - **Source:** GitHub Actions
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

4. For a custom domain, add a `CNAME` file in `dist` with `clairescameraroll.com` (or configure in repo Settings → Pages)

---

## Option D: Manual upload (FTP, cPanel, etc.)

1. Run the build locally:
   ```bash
   npm run build
   ```
2. Upload everything inside the `dist/` folder to your web host’s root (e.g. `public_html` or `www`)
3. Ensure these files are present:
   - `index.html`
   - `script.js`
   - `assets/` (CSS, fonts, images)

---

## After deploying

- **Cache:** If you use a CDN (Cloudflare, etc.), purge the cache so visitors get the new files
- **HTTPS:** Ensure your host serves the site over HTTPS
- **DNS:** Point `clairescameraroll.com` to your host’s servers (A record or CNAME)
