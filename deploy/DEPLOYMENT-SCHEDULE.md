# Servicelink — Deployment Schedule

Last updated: 24 July 2026  
VPS: `187.77.143.132` (`srv1850412.hstgr.cloud`)  
App path: `/var/www/servicelink`

---

## Status snapshot

| Item | Status |
|------|--------|
| Web app (PM2 `sl-web` :3000) | Live |
| Admin (PM2 `sl-admin` :3001) | Live |
| Postgres + seeds | Done |
| Image metadata sync | Done |
| SEO Phase 1 publish (270 pages) | **Done** (local + VPS) |
| DNS → VPS | Pending |
| HTTPS (Certbot) | Pending (after DNS) |
| Gemini location seed | ~41% (quota-limited) |

---

## SEO publish schedule

### Phase 1 — live now (~270 pages)

**Publish & index**

| Block | Count |
|------|------:|
| City hubs (20 cities) | 20 |
| City × service (20 × 8) | 160 |
| Sydney top metro hubs | 10 |
| Sydney metro × service (10 × 8) | 80 |
| **Total** | **270** |

**Cities**

1. Sydney  
2. Melbourne  
3. Brisbane  
4. Perth  
5. Adelaide  
6. Canberra  
7. Gold Coast  
8. Newcastle  
9. Geelong  
10. Wollongong  
11. Sunshine Coast  
12. Hobart  
13. Darwin  
14. Townsville  
15. Cairns  
16. Toowoomba  
17. Ballarat  
18. Bendigo  
19. Launceston  
20. Central Coast  

**Sydney metros only**

1. Sydney CBD  
2. Parramatta  
3. North Sydney  
4. Macquarie Park  
5. Liverpool  
6. Penrith  
7. Blacktown  
8. Bondi Junction  
9. Alexandria  
10. Surry Hills  

**Services (every city / selected metro)**

- asset-management  
- facilities-management  
- cleaning  
- ground-maintenance  
- tree-services  
- maintenance  
- roof-gutter-solar-cleaning  
- support-services  

**Not published:** all other cities, other Sydney metros, all non-Sydney metro pages (~3,510 unpublished + `noindex`).

**Re-apply Phase 1 rules**

```bash
cd web
npm run db:publish-seo-phase1
```

Script: `web/scripts/publish-seo-phase1.mjs`

---

### Phase 2 — live (~360 pages)

**Melbourne / Brisbane / Perth / Adelaide** — top 10 metros each + metro × service.

```bash
cd /var/www/servicelink/web
npm run db:publish-seo-phase2
```

Script: `web/scripts/publish-seo-phase2.mjs` (additive). Phase 1 script also re-applies Phase 2 after its allowlist wipe.

**Approx total after Phase 1+2:** ~630 indexed location pages.

---

### Phase 3 — later (long-tail)

**When:** Gemini content complete + Phase 2 performing.

**Add**

- Remaining Phase 1 city metros selectively  
- Additional NSW / commercial cities beyond Phase 1  
- Only Gemini pages (keep template pages unpublished)

**Hard stop:** avoid dumping all ~3,780 pages at once.

---

## Infrastructure schedule

### Step 1 — DNS (do first)

Point to `187.77.143.132`:

| Host | Type | Value |
|------|------|-------|
| `servicelink.net.au` | A | `187.77.143.132` |
| `www.servicelink.net.au` | A | `187.77.143.132` |
| `admin.servicelink.net.au` | A | `187.77.143.132` |

Wait for propagation (often 15 min–24 h).

### Step 2 — HTTPS

On VPS after DNS resolves:

```bash
certbot --nginx -d servicelink.net.au -d www.servicelink.net.au -d admin.servicelink.net.au
```

### Step 3 — Verify

- https://servicelink.net.au/  
- https://servicelink.net.au/about  
- https://servicelink.net.au/locations  
- https://servicelink.net.au/sitemap.xml  
- https://admin.servicelink.net.au/  

Confirm sitemap lists **~270** location URLs (plus static/service routes), not thousands.

### Step 4 — Search Console

1. Add property for `servicelink.net.au`  
2. Submit sitemap  
3. Inspect a sample of Phase 1 city + Sydney metro URLs  
4. Monitor coverage / soft 404 / duplicate issues for 2–4 weeks before Phase 2  

---

## App deploy checklist (ongoing)

When shipping code changes to VPS:

```bash
cd /var/www/servicelink
git pull
cd web && npm ci && npm run build
cd ../admin && npm ci && npm run build
pm2 restart sl-web sl-admin --update-env
```

If DB schema/seeds change:

```bash
cd /var/www/servicelink/web
npx drizzle-kit push
# then only the needed seed scripts
```

If image paths drift again:

1. Local: export image metadata  
2. Upload JSON to VPS  
3. Run `deploy/fix-images.sh` (or import script)

---

## Content / seed schedule

| Task | Notes |
|------|--------|
| Gemini location seed | Resume when API quota resets: `npm run db:seed-gemini-locations` |
| Progress check | `npm run db:check-gemini-progress` |
| After new Gemini batches | Re-run Phase 1 publish **only if** you want new paths live; otherwise keep unpublished until Phase 2/3 |

---

## Decision log

| Date | Decision |
|------|----------|
| 24 Jul 2026 | Company established year = **2018** |
| 24 Jul 2026 | Homepage: **Your buildings. Our responsibility.** |
| 24 Jul 2026 | Sites count = live Service360 (not fake 1,100+) |
| 24 Jul 2026 | SEO Phase 1 = **270** pages (20 cities + Sydney top 10 metros) |
| 24 Jul 2026 | All other location SEO pages unpublished + noindex |

---

## Quick reference — Phase 1 URL patterns

```
/locations/{city}
/locations/{city}/{service}

/locations/sydney/{metro}
/locations/sydney/{metro}/{service}
```

Only the 20 cities and 10 Sydney metros listed above are live.
