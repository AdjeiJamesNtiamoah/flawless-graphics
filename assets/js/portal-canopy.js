/**
 * FLAWLESS GRAPHYX — PORTAL CANOPY ENGINE
 * Powers dynamic time-of-day greetings, live calendar dates, and live chronometer clocks across all user portals.
 */

(function() {
    function getTimeGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        return 'Good evening';
    }

    function getFormattedDate() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    function getFormattedTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s} GMT`;
    }

    function updateCanopies() {
        const greeting = getTimeGreeting();
        const dateStr = getFormattedDate();
        const timeStr = getFormattedTime();

        // Update all elements with portal classes
        document.querySelectorAll('.portal-live-clock-text').forEach(el => {
            el.textContent = timeStr;
        });

        document.querySelectorAll('.portal-live-date-text').forEach(el => {
            el.textContent = dateStr;
        });

        document.querySelectorAll('.portal-greeting-highlight').forEach(el => {
            const role = el.getAttribute('data-portal-role') || 'Educator';
            el.textContent = `${greeting}, ${role}`;
        });
    }

    // Expose Global Helper
    window.PortalCanopy = {
        getHtml: function(role, brand) {
            const greeting = getTimeGreeting();
            const dateStr = getFormattedDate();
            const timeStr = getFormattedTime();
            const roleName = role || 'Educator';
            const brandName = brand || 'Flawless Graphyx';

            return `
                <div class="portal-canopy-bar">
                    <div class="portal-greeting-badge">
                        <i class="fa-solid fa-heart portal-heart-icon"></i>
                        <span class="portal-greeting-highlight" data-portal-role="${roleName}">${greeting}, ${roleName}</span>
                        <span class="portal-badge-dot">&bull;</span>
                        <span class="portal-greeting-brand">${brandName}</span>
                    </div>
                    <div class="portal-datetime-group">
                        <div class="portal-date-chip">
                            <i class="fa-regular fa-calendar-days"></i>
                            <span class="portal-live-date-text">${dateStr}</span>
                        </div>
                        <div class="portal-clock-chip">
                            <span class="portal-clock-pulse"></span>
                            <i class="fa-regular fa-clock"></i>
                            <span class="portal-live-clock-text">${timeStr}</span>
                        </div>
                    </div>
                </div>
            `;
        },
        update: updateCanopies
    };

    // Auto initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateCanopies();
            setInterval(updateCanopies, 1000);
        });
    } else {
        updateCanopies();
        setInterval(updateCanopies, 1000);
    }
})();
