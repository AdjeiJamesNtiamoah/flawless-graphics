# FLAWLESS GRAPHICS — LUCY™ Enterprise Management System

An integrated, modular web-based organizational management platform featuring multi-tenant registration, human resources administration, teacher and classroom management, and financial control.

---

## 📁 Project Architecture & Directory Structure

```
flawless-graphics/
├── assets/                          # Static resources
│   ├── css/                         # Global and modular stylesheets
│   │   ├── style.css                # Primary brand stylesheet
│   │   ├── teacher-dashboard.css    # Teacher portal dashboard theme
│   │   └── teacher-extended.css     # Extended classroom UI styles
│   ├── js/                          # Client-side scripts
│   │   ├── login.js                 # Unified authentication logic
│   │   ├── site-register.js         # Organization onboarding script
│   │   ├── teacher-classes.js       # Classroom & timetable UI logic
│   │   ├── teacher-dashboard.js     # Teacher dashboard handlers
│   │   ├── teacher-extended.js      # Student & attendance management
│   │   └── theme.js                 # Dark/light theme observer
│   └── images/                      # Media, logos, gifs, and illustration assets
│       ├── logo.gif
│       ├── log.gif
│       ├── icons8-rhombus-loader.gif
│       ├── icons8-laptop-closing.gif
│       ├── payroll-automation.jpeg
│       └── employee-attendance-tracking.jpg
├── api/                             # PHP Backend REST Endpoints & Database
│   ├── config/
│   │   └── db.php                   # Centralized MySQLi & PDO Database connection
│   ├── add_student.php              # Student registration API
│   ├── delete_employee.php          # Employee removal API
│   ├── get_employees.php            # Employee query endpoint
│   ├── get_students.php             # Live classroom student listing API
│   ├── login.php                    # Server-side authentication
│   ├── organizations.php            # Registered organization ledger view
│   └── save_employee.php            # Employee create & update endpoint
├── pages/                           # Modular Application Portals
│   ├── public/                      # Public Facing Website
│   │   ├── home.html                # Enterprise landing & KPI preview
│   │   ├── services.html            # Key services overview
│   │   └── contact.html             # Contact & inquiry form
│   ├── hr/                          # Human Resources Management Portal
│   │   ├── hr-dashboard.html        # Enterprise HR dashboard & analytics
│   │   ├── hr-login.html            # HR administration authentication
│   │   ├── employee.html            # Employee directory & CRUD portal
│   │   ├── employee-reports.html    # Headcount & department reports
│   │   ├── attendance-summary.html  # Daily attendance & check-in analytics
│   │   ├── payroll.html             # Payroll distribution & summaries
│   │   ├── payslip.html             # Downloadable employee payslips
│   │   ├── performance.html         # Staff appraisals & KPI ratings
│   │   └── hr.html                  # HR module overview & hub
│   ├── teacher/                     # Teacher & Classroom Portal
│   │   ├── teacher-dashboard.html   # Primary teacher workspace
│   │   ├── teacher-login.html       # Teacher authentication
│   │   ├── teacher.html             # Teacher registration & onboarding
│   │   ├── teacher-profile.html     # Teacher profile settings & timetable
│   │   ├── teacher-classes.html     # Class & subject scheduler
│   │   ├── teacher-classes-extended.html # Extended student roster & roll call
│   │   └── teacher-messaging-leave.html  # HR messaging & leave requests
│   └── finance/                     # Finance & Accounting Portal
│       ├── finance-dashboard.html   # Financial ledger, payroll & budgeting
│       └── finance-login.html       # Finance administration login
├── index.html                       # Master Organization Onboarding & Registration
├── site-login.html                  # Master Organization Sign In
├── welcome.html                     # Central Workspace Selector & Navigation Hub
├── manifest.json                    # PWA Web Application Manifest
└── README.md                        # Documentation & Architecture Overview
```

---

## 🚀 Key Modules & Capabilities

### 1. Master Onboarding & Authentication
- **Organization Registration (`index.html`)**: Interactive Mac-inspired window UI for registering company details, uploading brand logos, and creating master admin credentials.
- **Organization Sign In (`site-login.html`)**: SHA-256 encrypted authentication with session persistence.
- **Central Workspace Hub (`welcome.html`)**: Dynamic workspace switcher granting access to Public Site, HR Portal, Teacher Portal, and Finance Portal.

### 2. Public Facing Website (`pages/public/`)
- Modern, animated responsive website showcasing company services, live KPI counters, department payroll summaries, and contact channels.

### 3. HR Management System (`pages/hr/`)
- Comprehensive dashboard with Chart.js analytics, employee directory management, live MySQL sync, attendance tracking, and performance evaluations.

### 4. Teacher & Classroom System (`pages/teacher/`)
- Classroom timetable management, student enrollment with instant HR database sync, leave request submission, and internal messaging.

### 5. Finance & Payroll System (`pages/finance/`)
- Enterprise financial ledger, payroll batch processing, expenditure breakdowns, and budget approvals.

---

## 🛠 Technology Stack

- **Frontend Core**: Semantic HTML5, Vanilla JavaScript (ES6+), Modern Vanilla CSS3 with CSS Custom Properties (CSS variables)
- **UI & Typography**: Plus Jakarta Sans, Poppins, Font Awesome 6.5, AOS Animation library
- **Data Visualization**: Chart.js 4.4
- **Backend & Storage**: PHP 8.x with PDO & MySQLi, MySQL database, Client-side LocalStorage fallback sync

---

## 💻 Running the Project Locally

1. **Static / Client-side Mode**:
   - Open `index.html` directly in any modern web browser or serve via VS Code Live Server / static web server.
   
2. **With PHP & MySQL Backend**:
   - Place the project directory inside your local web server root (e.g. `htdocs` in XAMPP or `www` in WAMP).
   - Configure database credentials in [`api/config/db.php`](api/config/db.php) (Default: `host=localhost`, `user=root`, `password=`, `database=flawless_graphics`).
   - Access `http://localhost/flawless-graphics/index.html`.

---

## 📄 License

&copy; 2026 FLAWLESS GRAPHICS. All rights reserved.