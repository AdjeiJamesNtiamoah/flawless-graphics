/**
 * cascading-nav.js
 * Universal Cascading & Flyout Sub-Navigation Engine
 * FLAWLESS GRAPHICS ERP Platform
 */

(function(window) {
    'use strict';

    const CascadingNav = {
        /**
         * Navigation Configurations per Portal
         */
        configs: {
            admin: {
                overview: {
                    title: "Executive Overview",
                    badge: "Live",
                    items: [
                        { label: "Executive Telemetry", icon: "fa-chart-pie", action: "switchSection('overview')" },
                        { label: "Institutional Metrics", icon: "fa-gauge-high", action: "switchSection('overview')" },
                        { label: "Campus Directives", icon: "fa-bullhorn", action: "switchSection('broadcasts')" }
                    ]
                },
                tenants: {
                    title: "Tenants & Partitions",
                    badge: "Multi-Org",
                    items: [
                        { label: "All Active Campuses", icon: "fa-building-columns", action: "switchSection('tenants')" },
                        { label: "Pending Approvals Queue", icon: "fa-hourglass-half", action: "switchSection('tenants')" },
                        { label: "Provision New Campus", icon: "fa-plus-circle", action: "window.open('../../register.html', '_blank')" },
                        { label: "Storage & DB Quota", icon: "fa-database", action: "switchSection('health')" }
                    ]
                },
                users: {
                    title: "Global RBAC Users",
                    badge: "Security",
                    items: [
                        { label: "Super Admin Governance", icon: "fa-crown", action: "switchSection('users')" },
                        { label: "Faculty & Teachers", icon: "fa-chalkboard-user", action: "switchSection('users')" },
                        { label: "Student Registries", icon: "fa-user-graduate", action: "switchSection('users')" },
                        { label: "Finance & HR Officers", icon: "fa-users-gear", action: "switchSection('users')" }
                    ]
                },
                portals: {
                    title: "Portal Hub & Jump",
                    badge: "5 Workstations",
                    items: [
                        { label: "Main Public Site", icon: "fa-house", action: "window.location.href='../public/home.html'" },
                        { label: "HR & Payroll Console", icon: "fa-shield-halved", action: "window.location.href='../hr/hr-dashboard.html'" },
                        { label: "Bursary & Treasury Desk", icon: "fa-wallet", action: "window.location.href='../finance/finance-dashboard.html'" },
                        { label: "Teacher Portal", icon: "fa-chalkboard", action: "window.location.href='../teacher/teacher-dashboard.html'" },
                        { label: "Student Academy", icon: "fa-graduation-cap", action: "window.location.href='../student/student-dashboard.html'" }
                    ]
                },
                broadcasts: {
                    title: "Directives & Broadcasts",
                    badge: "Global",
                    items: [
                        { label: "Dispatch Campus Memo", icon: "fa-paper-plane", action: "switchSection('broadcasts')" },
                        { label: "SMS & Push Notifications", icon: "fa-comment-sms", action: "switchSection('broadcasts')" },
                        { label: "Directive Bulletin Archive", icon: "fa-newspaper", action: "switchSection('broadcasts')" }
                    ]
                },
                health: {
                    title: "System Health & Cloud",
                    badge: "99.99%",
                    items: [
                        { label: "Supabase Live Matrix", icon: "fa-cloud-arrow-up", action: "switchSection('health')" },
                        { label: "Realtime WebSocket Hub", icon: "fa-network-wired", action: "switchSection('health')" },
                        { label: "AES-256 Partition Guard", icon: "fa-shield-halved", action: "switchSection('health')" }
                    ]
                },
                audit: {
                    title: "Audit Trail & Logs",
                    badge: "Security",
                    items: [
                        { label: "Live System Activity", icon: "fa-clock-rotate-left", action: "switchSection('audit')" },
                        { label: "Access & Auth History", icon: "fa-key", action: "switchSection('audit')" },
                        { label: "Critical Governance Logs", icon: "fa-triangle-exclamation", action: "switchSection('audit')" }
                    ]
                },
                backup: {
                    title: "Backup & Recovery",
                    badge: "Snapshots",
                    items: [
                        { label: "Export JSON Snapshot", icon: "fa-download", action: "if(typeof openBackupExportModal==='function')openBackupExportModal(); else switchSection('backup');" },
                        { label: "Disaster Recovery Desk", icon: "fa-rotate-left", action: "switchSection('backup')" }
                    ]
                },
                settings: {
                    title: "Master Configuration",
                    badge: "System",
                    items: [
                        { label: "Global Platform Settings", icon: "fa-sliders", action: "switchSection('settings')" },
                        { label: "Cloud DB Credentials", icon: "fa-key", action: "if(window.SupabaseConfig)window.SupabaseConfig.openConfigModal();" },
                        { label: "Institutional Branding", icon: "fa-image", action: "switchSection('settings')" }
                    ]
                }
            },
            teacher: {
                overview: {
                    title: "Educator Hub",
                    badge: "Active",
                    items: [
                        { label: "Daily Schedule & Hub", icon: "fa-chart-pie", action: "document.querySelector('[data-section=\\'overview\\']')?.click()" },
                        { label: "Faculty Directives", icon: "fa-bullhorn", action: "document.querySelector('[data-section=\\'broadcasts\\']')?.click()" }
                    ]
                },
                classes: {
                    title: "Assigned Classes",
                    badge: "Roster",
                    items: [
                        { label: "My Classes Roster", icon: "fa-chalkboard", action: "document.querySelector('[data-section=\\'classes\\']')?.click()" },
                        { label: "Subject Allotments", icon: "fa-book-bookmark", action: "document.querySelector('[data-section=\\'classes\\']')?.click()" },
                        { label: "Extended Class View", icon: "fa-table-cells-large", action: "window.location.href='teacher-classes-extended.html'" }
                    ]
                },
                students: {
                    title: "Student Management",
                    badge: "Scholars",
                    items: [
                        { label: "Scholars Directory", icon: "fa-user-graduate", action: "document.querySelector('[data-section=\\'students\\']')?.click()" },
                        { label: "Smart RFID Badges", icon: "fa-id-card", action: "document.querySelector('[data-section=\\'students\\']')?.click()" },
                        { label: "Performance Reports", icon: "fa-star", action: "document.querySelector('[data-section=\\'assessments\\']')?.click()" }
                    ]
                },
                attendance: {
                    title: "Roll Call & Logs",
                    badge: "Daily",
                    items: [
                        { label: "Classroom Roll Call", icon: "fa-clipboard-user", action: "document.querySelector('[data-section=\\'attendance\\']')?.click()" },
                        { label: "Biometric Scanner Sync", icon: "fa-fingerprint", action: "document.querySelector('[data-section=\\'attendance\\']')?.click()" },
                        { label: "Term Attendance Summary", icon: "fa-calendar-check", action: "document.querySelector('[data-section=\\'attendance\\']')?.click()" }
                    ]
                },
                assignments: {
                    title: "Assignments & Homework",
                    badge: "Tasks",
                    items: [
                        { label: "Active Assignments", icon: "fa-book-open", action: "document.querySelector('[data-section=\\'assignments\\']')?.click()" },
                        { label: "+ Create New Assignment", icon: "fa-plus", action: "if(typeof openAssignmentCreateModal==='function')openAssignmentCreateModal(); else document.querySelector('[data-section=\\'assignments\\']')?.click();" },
                        { label: "Submissions & Grading", icon: "fa-pen-ruler", action: "document.querySelector('[data-section=\\'assignments\\']')?.click()" }
                    ]
                },
                assessments: {
                    title: "Continuous Assessment",
                    badge: "WAEC / GPA",
                    items: [
                        { label: "Gradebook & SBA Scores", icon: "fa-stamp", action: "document.querySelector('[data-section=\\'assessments\\']')?.click()" },
                        { label: "Record New Assessment", icon: "fa-circle-plus", action: "if(typeof openNewAssessmentModal==='function')openNewAssessmentModal(); else document.querySelector('[data-section=\\'assessments\\']')?.click();" },
                        { label: "Terminal Grade Reports", icon: "fa-file-lines", action: "document.querySelector('[data-section=\\'assessments\\']')?.click()" }
                    ]
                },
                messages: {
                    title: "Communications Desk",
                    badge: "Inbox",
                    items: [
                        { label: "Parent & Student Messages", icon: "fa-paper-plane", action: "document.querySelector('[data-section=\\'messages\\']')?.click()" },
                        { label: "Duty Leave Application", icon: "fa-calendar-plus", action: "document.querySelector('[data-section=\\'messages\\']')?.click()" }
                    ]
                },
                lessons: {
                    title: "Curriculum & Notes",
                    badge: "Syllabus",
                    items: [
                        { label: "Lesson Notes Repository", icon: "fa-note-sticky", action: "document.querySelector('[data-section=\\'lessons\\']')?.click()" },
                        { label: "Syllabus Progress", icon: "fa-list-check", action: "document.querySelector('[data-section=\\'lessons\\']')?.click()" }
                    ]
                }
            },
            hr: {
                overview: {
                    title: "Staff Governance",
                    badge: "HR Hub",
                    items: [
                        { label: "Workforce Telemetry", icon: "fa-gauge-high", action: "switchTab('dashboard')" },
                        { label: "Department Summary", icon: "fa-building", action: "switchTab('departments')" }
                    ]
                },
                teachers: {
                    title: "Staff & Faculty",
                    badge: "Directory",
                    items: [
                        { label: "Faculty Directory", icon: "fa-chalkboard-user", action: "switchTab('teachers')" },
                        { label: "Non-Academic Personnel", icon: "fa-users", action: "switchTab('teachers')" },
                        { label: "+ Onboard New Staff", icon: "fa-user-plus", action: "openAddTeacherModal()" }
                    ]
                },
                payroll: {
                    title: "Compensation & Payroll",
                    badge: "SSNIT/PAYE",
                    items: [
                        { label: "Monthly Payroll Run", icon: "fa-money-bill-wave", action: "switchTab('payroll')" },
                        { label: "Generate Payslips", icon: "fa-file-invoice", action: "switchTab('payroll')" },
                        { label: "Bank Salary Schedule", icon: "fa-building-columns", action: "switchTab('payroll')" }
                    ]
                },
                attendance: {
                    title: "Leaves & Roll Call",
                    badge: "Duty",
                    items: [
                        { label: "Staff Daily Attendance", icon: "fa-clipboard-user", action: "switchTab('attendance')" },
                        { label: "Leave Requests & Approvals", icon: "fa-calendar-check", action: "switchTab('attendance')" }
                    ]
                }
            },
            finance: {
                dashboard: {
                    title: "Treasury Hub",
                    badge: "Ledger",
                    items: [
                        { label: "Revenue & Cashflow", icon: "fa-chart-pie", action: "switchTab('dashboard')" },
                        { label: "Bank Reconciliations", icon: "fa-building-columns", action: "switchTab('dashboard')" }
                    ]
                },
                studentBilling: {
                    title: "Student Fees & Billing",
                    badge: "Invoicing",
                    items: [
                        { label: "Fee Billing Ledger", icon: "fa-receipt", action: "switchTab('studentBilling')" },
                        { label: "Collect Student Fee", icon: "fa-cash-register", action: "openModal('studentFeeModal')" },
                        { label: "Fee Tariff Schedule", icon: "fa-table-list", action: "switchTab('feeTariff')" }
                    ]
                },
                clearanceDesk: {
                    title: "Exam Clearance Desk",
                    badge: "Passes",
                    items: [
                        { label: "Verify Student Clearance", icon: "fa-id-card-clip", action: "switchTab('clearanceDesk')" },
                        { label: "Print Exam Hall Passes", icon: "fa-print", action: "switchTab('clearanceDesk')" }
                    ]
                },
                approval: {
                    title: "Payroll & Disbursements",
                    badge: "Approval",
                    items: [
                        { label: "Faculty Payroll Approval", icon: "fa-file-invoice-dollar", action: "switchTab('approval')" },
                        { label: "Institutional Expenses", icon: "fa-wallet", action: "switchTab('approval')" }
                    ]
                }
            },
            student: {
                overview: {
                    title: "Student Portal",
                    badge: "Scholar",
                    items: [
                        { label: "My Academic Hub", icon: "fa-gauge-high", action: "switchStudentTab('dashboard')" },
                        { label: "Daily Schedule", icon: "fa-calendar-day", action: "switchStudentTab('timetable')" }
                    ]
                },
                academics: {
                    title: "Courses & Lessons",
                    badge: "Enrolled",
                    items: [
                        { label: "My Enrolled Subjects", icon: "fa-book-open", action: "switchStudentTab('courses')" },
                        { label: "Timetable & Routine", icon: "fa-calendar-days", action: "switchStudentTab('timetable')" },
                        { label: "My Attendance Log", icon: "fa-clipboard-check", action: "switchStudentTab('attendance')" }
                    ]
                },
                results: {
                    title: "Grades & Assessment",
                    badge: "GPA",
                    items: [
                        { label: "Terminal Report Card", icon: "fa-file-lines", action: "switchStudentTab('results')" },
                        { label: "Continuous Assessment", icon: "fa-stamp", action: "switchStudentTab('results')" },
                        { label: "GPA Simulator", icon: "fa-calculator", action: "switchStudentTab('results')" }
                    ]
                },
                bursary: {
                    title: "Fees & Clearance",
                    badge: "Bursary",
                    items: [
                        { label: "Tuition Balance & History", icon: "fa-receipt", action: "switchStudentTab('fees')" },
                        { label: "Print Exam Pass", icon: "fa-id-card", action: "switchStudentTab('fees')" }
                    ]
                }
            }
        },

        /**
         * Initialize Cascading Sub-Menus on the active page
         */
        init: function() {
            if (typeof document === 'undefined') return;

            const path = (window.location.pathname || '').toLowerCase();
            let portalType = null;

            if (path.includes('/admin/')) portalType = 'admin';
            else if (path.includes('/teacher/')) portalType = 'teacher';
            else if (path.includes('/hr/')) portalType = 'hr';
            else if (path.includes('/finance/')) portalType = 'finance';
            else if (path.includes('/student/')) portalType = 'student';

            if (!portalType || !this.configs[portalType]) return;

            const portalConfig = this.configs[portalType];

            // Attach to navigation elements
            const navElements = document.querySelectorAll(
                '.sidebar .nav-btn, .sidebar .tab, aside .tab, header nav ul li a, .app-sidebar .nav-item'
            );

            navElements.forEach(btn => {
                const sec = btn.getAttribute('data-sec') || 
                            btn.getAttribute('data-section') || 
                            btn.id?.replace(/^nav/, '')?.toLowerCase() ||
                            btn.getAttribute('onclick')?.match(/switch(?:Section|Tab|StudentTab)\('([^']+)'\)/)?.[1]?.toLowerCase();

                // Find matching key in config
                let matchedKey = null;
                if (sec) {
                    const cleanSec = sec.toLowerCase();
                    for (const k in portalConfig) {
                        if (k.toLowerCase() === cleanSec || cleanSec.includes(k.toLowerCase()) || k.toLowerCase().includes(cleanSec)) {
                            matchedKey = k;
                            break;
                        }
                    }
                }

                if (!matchedKey) return;
                const menuData = portalConfig[matchedKey];
                if (!menuData || !menuData.items || !menuData.items.length) return;

                // Mark parent as has-flyout
                btn.classList.add('has-flyout');

                // Wrap if not already wrapped
                let wrapper = btn.parentElement;
                if (!wrapper.classList.contains('nav-item-wrapper')) {
                    const newWrap = document.createElement('div');
                    newWrap.className = 'nav-item-wrapper';
                    btn.parentNode.insertBefore(newWrap, btn);
                    newWrap.appendChild(btn);
                    wrapper = newWrap;
                }

                // Add chevron if not present
                if (!btn.querySelector('.flyout-chevron')) {
                    const chevron = document.createElement('i');
                    chevron.className = 'fa-solid fa-chevron-right flyout-chevron';
                    btn.appendChild(chevron);
                }

                // Create Flyout Submenu Panel
                let flyoutMenu = wrapper.querySelector('.nav-flyout-menu');
                if (!flyoutMenu) {
                    flyoutMenu = document.createElement('div');
                    flyoutMenu.className = 'nav-flyout-menu';
                    
                    // Header
                    let html = `
                        <div class="flyout-header">
                            <div class="flyout-title">
                                <i class="fa-solid fa-layer-group" style="color:#38bdf8;"></i> ${menuData.title}
                            </div>
                            <span class="flyout-badge">${menuData.badge || 'Portal'}</span>
                        </div>
                    `;

                    // Items
                    menuData.items.forEach(item => {
                        html += `
                            <button type="button" class="flyout-item" onclick="${item.action}">
                                <div class="flyout-item-left">
                                    <div class="flyout-item-icon"><i class="fa-solid ${item.icon}"></i></div>
                                    <span>${item.label}</span>
                                </div>
                                <i class="fa-solid fa-arrow-right" style="font-size:10px; opacity:0.5;"></i>
                            </button>
                        `;
                    });

                    flyoutMenu.innerHTML = html;
                    wrapper.appendChild(flyoutMenu);

                    // Dynamic positioning on hover
                    wrapper.addEventListener('mouseenter', () => {
                        const rect = btn.getBoundingClientRect();
                        flyoutMenu.style.top = Math.max(12, Math.min(window.innerHeight - 320, rect.top)) + 'px';
                        flyoutMenu.style.left = (rect.right + 12) + 'px';
                    });
                }
            });
        }
    };

    window.CascadingNav = CascadingNav;

    // Auto-boot on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CascadingNav.init());
    } else {
        CascadingNav.init();
    }
})(window);
