# BUILDPRO CONSTRUCTIONS - Labour Recruitment Portal

> **"Building Projects. Connecting People."**

A professional, modern, responsive **Construction Labour Recruitment Website** built with pure HTML5, CSS3, Vanilla JavaScript, and LocalStorage.

---

## 🌟 Key Features

1. **Multi-Step Worker Registration Wizard (7 Steps)**:
   - Step 1: Personal Details (Name, Photo upload preview, Mobile, WhatsApp, Email, Age, Gender, Address, District, State, PIN)
   - Step 2: Professional Details (Main Category select -> dynamic Subcategory trade options, Experience Years, Skill level, multi-select additional skills)
   - Step 3: Work Info & Availability (Current location, Preferred work location, Relocation preference, Availability status, Employment preference)
   - Step 4: Wage Expectations (Expected Daily Wage ₹, Expected Monthly Salary ₹, Negotiable option)
   - Step 5: Previous Experience (Previous company, Project details, Work description)
   - Step 6: Documents Upload UI (Aadhaar/ID card, Skill certificate metadata preview)
   - Step 7: Confirmation & Full Summary Review before submission button.
   - Generates unique Worker ID: `WRK-2026-0001` with LocalStorage persistence.

2. **Advanced Worker Search & Filter Portal (`workers.html`)**:
   - Filter by Main Category & dynamic Subcategory trade dropdowns.
   - Filter by Experience (0–1 Yrs, 2–5 Yrs, 5–10 Yrs, 10+ Yrs).
   - Filter by Skill Level (Beginner, Semi-Skilled, Skilled, Highly Skilled).
   - Filter by Location (State / District / City).
   - Filter by Availability (Immediately Available, Within 7 Days, Within 15 Days).
   - Filter by Wage range and Employment type.
   - Real-time live count: `30 Workers Found`.
   - Contact options: Direct Call modal, WhatsApp message link with pre-populated greeting, and View Full Profile.

3. **Detailed Worker Profile Page (`worker-profile.html`)**:
   - Profile avatar, Worker ID, Trade badge, Verification status (`✓ Verified Worker` or `🟡 Pending`).
   - Detailed skills cloud, work history, previous company & project summary.
   - Attached documents metadata list.
   - Application history table.

4. **Job Posting & Requirement Portal (`post-job.html` & `jobs.html`)**:
   - Post Labour Requirement form for contractors & companies with Perks checkboxes (🏠 Accommodation, 🍲 Food, 🚌 Transport).
   - Auto-generates Job ID: `JOB-2026-0001`.
   - Available Jobs page with search box, perks tags, wage offer, vacancies count, and Quick Worker Application modal.

5. **Application & Hiring System**:
   - Workers can apply for jobs by selecting their profile or entering their Worker ID.
   - Prevents duplicate applications and tracks statuses (`Applied`, `Shortlisted`, `Interview`, `Selected`, `Rejected`).

6. **Comprehensive Admin Dashboard (`admin.html`)**:
   - Key Stat Cards: Total Workers, Available Workers, Skilled Workers, Total Jobs, Active Requirements, Workers Hired.
   - **Worker Management Table**: Search, filter, change verification status (`Verified` 🟢, `Pending` 🟡, `Rejected` 🔴), view profile, contact worker, delete worker.
   - **Jobs Management Table**: Change job status (`Active`, `Filled`, `Closed`), delete job.
   - **Applications Workflow Table**: Change applicant status inline to reflect hiring progress.
   - **Category Manager**: View trade tree, add new main categories, or add new subcategories live.
   - **Analytics & Reports**: Visual CSS/SVG charts for worker trade distribution and experience breakdown.
   - **Settings & Database Reset**: One-click button to reset LocalStorage back to initial 30 workers and 15 jobs seed data.

7. **Mobile-First Touch Design & Sticky Bottom Nav**:
   - Touch-friendly controls, large input fields, step indicators.
   - Sticky bottom mobile bar (`🏠 Home`, `🔎 Jobs`, `👷 Workers`, `➕ Register`, `👤 Admin`).

8. **i18n Multilingual Support & Theme Switcher**:
   - Language selector (English, Hindi हिन्दी, Telugu తెలుగు) ready with dictionary structure.
   - Light / Dark mode toggle saved to LocalStorage.

---

## 📁 File Structure

```text
construction-labour-portal/
│
├── index.html                # Main Home page with Hero, Stats, Categories Grid, Featured Workers & Jobs
├── workers.html              # Find Workers Portal with filters sidebar, search box, worker cards
├── worker-profile.html       # Detailed Worker View page with avatar, trade tags, history & contact
├── register-worker.html      # 7-Step Multi-step Worker Registration wizard
├── jobs.html                 # Available Jobs Page with search, filters, perks tags & apply modal
├── job-details.html          # Detailed Job Requirement View page
├── post-job.html             # Post Labour Requirement form for contractors & employers
├── employer-register.html    # Employer Company Registration form
├── admin.html                # Comprehensive Admin Dashboard with tables, verification toggle, charts & settings
│
├── css/
│   ├── style.css             # Base design system variables, resets, typography, header, footer, dark mode
│   ├── components.css        # Cards, wizard progress bar, badges, filter forms, data tables, modals, toasts
│   └── responsive.css        # Mobile & tablet responsive media queries & sticky bottom nav
│
├── js/
│   ├── data.js               # Initial seed dataset (30 workers, 15 jobs, categories tree, applications)
│   ├── storage.js            # LocalStorage CRUD service & auto-ID generator
│   ├── validation.js         # Form field & step validation utilities
│   ├── app.js                # Theme toggle, i18n dictionary, toasts, modals & counter animations
│   ├── workers.js            # Multi-step wizard, worker filters, card rendering & profile view
│   ├── jobs.js               # Job posting, job search/filters, job details & application workflow
│   └── admin.js              # Admin dashboard analytics, worker verification, tables & category manager
│
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md
```

---

## 🚀 How to Run Locally

Because this project is built using standard Vanilla HTML5, CSS3, and JavaScript:

1. **Direct Browser Launch**:
   - Open `index.html` (or `construction-labour-portal/index.html`) directly in any web browser (Chrome, Edge, Firefox, Safari).

2. **Using a Local HTTP Server (Optional)**:
   - **Node.js**: Run `npx serve construction-labour-portal`
   - **Python 3**: Run `python -m http.server 8000` inside `construction-labour-portal/` and visit `http://localhost:8000`.

---

## 🔒 Production Architecture Note

This frontend prototype uses **LocalStorage** for data persistence. For production deployment:
- **Backend**: Node.js + Express.js / Python FastAPI.
- **Database**: PostgreSQL / MySQL.
- **Authentication**: Mobile OTP verification & Password JWT.
- **Storage**: AWS S3 / Cloud Storage for uploaded document files and profile photos.
