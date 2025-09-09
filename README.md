# Chiron
Compliance management software for CMMC

## Overview
Chiron is a CMMC compliance manager focused on tracking the CMMC controls. Each control can be opened, assigned a status (Not Implemented, Partially Implemented, Fully Implemented), include objective checklists, attach evidence, and capture comments/answers. Once all controls are answered we can generate POAMs that the user can address.

This repo includes:
- docs describing requirements and data model
- a React + Firebase web app skeleton (TypeScript, Vite)
- Firebase Hosting configuration, Firestore and Storage security rules
- sample control data and initial UI stubs

## Quick Start
1) Install Node 18+ and pnpm or npm
2) In `web/`, install deps and run dev server:
   - `install npm`
   - `npm run dev`
3) Go to local host
   
(Not configured yet: Will get Firebase configured next)
5) Deploy Hosting when ready:
   - `firebase login`
   - `firebase init` (use existing `firebase.json`, select Hosting, Firestore, Storage)
   - `pnpm build` then `firebase deploy`

## Milestones
- Week 3–4: Chrion UI for Controls List + Control Detail, local sample data
- Week 4–5: Integrate Firebase Auth, Firestore read, Storage upload (dev only)
- Week 6–7: Firestore writes, comments, objectives checklists, status changes, generate POAM, generate Polices
- Week 8–9: Roles/permissions, audit trail, polish UX
- Week 10+: Reporting/export, filters/search, team workflow refinements

See `docs/requirements.md` and `docs/data-model.md` for details.
