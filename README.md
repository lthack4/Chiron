# Chiron
Compliance management software for CMMC

## Overview
Chiron is a CMMC compliance manager focused on tracking the 110 practices. Each control can be opened, assigned a status (Not Implemented, Partially Implemented, Fully Implemented), include objective checklists, attach evidence, and capture comments/answers.

This repo includes:
- docs describing requirements and data model
- a React + Firebase web app skeleton (TypeScript, Vite)
- Firebase Hosting configuration, Firestore and Storage security rules
- sample control data and initial UI stubs

## Quick Start
1) Install Node 18+ and pnpm or npm
2) In `web/`, install deps and run dev server:
   - `cd web && pnpm i` (or `npm i`)
   - `pnpm dev` (or `npm run dev`)
3) Create a Firebase project. Enable Authentication (Google), Firestore, Storage, and Hosting.
4) Copy `.env.example` to `.env` in `web/` and fill with your Firebase config.
5) Deploy Hosting when ready:
   - `firebase login`
   - `firebase init` (use existing `firebase.json`, select Hosting, Firestore, Storage)
   - `pnpm build` then `firebase deploy`

## Populate Official Controls (One-time)
- Preferred: Use the official CMMC L2 Assessment Guide (2024) for verbatim content
  1) Download the PDF to `docs/sources/CMMC_Assessment_Guide_L2_v2.pdf` (if not already present)
  2) Extract text locally (Windows example using pdftotext):
     - Install Poppler for Windows (adds `pdftotext`), or use WSL
     - Run: `pdftotext -layout -enc UTF-8 docs/sources/CMMC_Assessment_Guide_L2_v2.pdf docs/sources/cmmc-l2.txt`
  3) Update the dataset from the extracted text:
     - `node tools/update-from-guide.js --in docs/sources/cmmc-l2.txt --data web/public/data/cmmc-l2.controls.json`
  This will update titles, descriptions, and objectives (a–f) where found.

  Notes:
  - The parser looks for lines like `AC.L2-3.1.1 – ...` and objectives `[a] ...` below the header.
  - It keeps existing checkbox completion states where objective IDs match.

## Alternative Import (OSCAL)
- `node tools/import-800171.js` (build from NIST OSCAL Rev. 3) or `--in` a local Rev. 2 JSON/CSV after conversion.

## Milestones (Suggestive)
- Week 3–4: MVP UI for Controls List + Control Detail, local sample data
- Week 4–5: Integrate Firebase Auth, Firestore read, Storage upload (dev only)
- Week 6–7: Firestore writes, comments, objectives checklists, status changes
- Week 8–9: Roles/permissions, audit trail, polish UX
- Week 10+: Reporting/export, filters/search, team workflow refinements

See `docs/requirements.md` and `docs/data-model.md` for details.
