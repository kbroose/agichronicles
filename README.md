# The AGI Chronicles — book site

Landing page for *The AGI Chronicles* by Kevin Roose (FSG, October 6, 2026).
Static site, deployed on GitHub Pages.

- **Live:** https://kbroose.github.io/agichronicles/
- Design mirrors the book jacket: black ground, Newsreader serif, iridescent
  prism gradient, chromatic-aberration ghosting on display type.
- Contact form posts to the Cloudflare Worker at
  `kevinroose-form.kbroose.workers.dev` (same worker as kevinroose.com), so no
  email address appears anywhere in this repo or on the site.
- Substack signups via embedded `kevinroose.substack.com/embed` (section + modal).

## Going live on theagichronicles.com

1. **GitHub:** repo Settings → Pages → Custom domain → `theagichronicles.com`
   (this creates a `CNAME` file). Keep "Enforce HTTPS" checked once the cert
   is issued.
2. **GoDaddy DNS** for `theagichronicles.com`:
   - Four `A` records on `@`: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME` record: `www` → `kbroose.github.io`
3. **Cloudflare Worker:** paste the updated `worker.js` from
   `~/kevinroose-form-worker/` into the kevinroose-form worker (its
   `ALLOWED_ORIGINS` now includes the book domains) and deploy, or the contact
   form will 403 on the custom domain.
4. **This repo:** swap the `kbroose.github.io/agichronicles` URLs in
   `index.html` (canonical + og/twitter tags + JSON-LD image) for
   `https://theagichronicles.com/`.
5. **agichronicles.com:** set up domain forwarding at GoDaddy →
   `https://theagichronicles.com` (301).
