const fs = require('fs');
const path = 'assets/js/slide-over.js';

let content = fs.readFileSync(path, 'utf8');
const isCrlf = content.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

const target = `      this.open(panel);${nl}    },${nl}${nl}    filterNotifications(cat, btn) {`;

const replacement = `      this.renderNotificationsList(panel);${nl}      this.open(panel);${nl}    },${nl}${nl}    renderNotificationsList(panel) {${nl}      const listEl = panel ? panel.querySelector('#soNotifList') : document.getElementById('soNotifList');${nl}      if (!listEl) return;${nl}      const liveNotifs = (window.LucyBus && typeof window.LucyBus.getLiveNotifications === 'function')${nl}        ? window.LucyBus.getLiveNotifications()${nl}        : [];${nl}      if (!liveNotifs || liveNotifs.length === 0) return;${nl}${nl}      const itemsHtml = liveNotifs.slice(0, 15).map(n => {${nl}        const timeAgo = n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';${nl}        const type = (n.type || '').toLowerCase();${nl}        let cat = 'system';${nl}        let bulletBg = 'rgba(99, 102, 241, 0.15)';${nl}        let bulletColor = '#6366f1';${nl}        let icon = 'fa-solid fa-bell';${nl}${nl}        if (type.includes('user') || type.includes('staff') || type.includes('teacher') || type.includes('finance')) {${nl}          cat = 'security';${nl}          bulletBg = 'rgba(245, 158, 11, 0.15)';${nl}          bulletColor = '#f59e0b';${nl}          icon = 'fa-solid fa-user-clock';${nl}        } else if (type.includes('grade') || type.includes('academic') || type.includes('student')) {${nl}          cat = 'academic';${nl}          bulletBg = 'rgba(16, 185, 129, 0.15)';${nl}          bulletColor = '#10b981';${nl}          icon = 'fa-solid fa-graduation-cap';${nl}        }${nl}${nl}        const safeTitle = String(n.title || 'Notification').replace(/</g, '&lt;').replace(/>/g, '&gt;');${nl}        const safeMsg = String(n.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');${nl}${nl}        return \`${nl}          <div class="so-list-item" data-cat="\${cat}">${nl}            <div class="so-list-bullet" style="background:\${bulletBg}; color:\${bulletColor};"><i class="\${icon}"></i></div>${nl}            <div class="so-list-content">${nl}              <div class="so-list-title" style="display:flex; justify-content:space-between;">${nl}                <span>\${safeTitle}</span>${nl}                <span style="font-size:11px; color:var(--so-text-light);">\${timeAgo}</span>${nl}              </div>${nl}              <div class="so-list-desc">\${safeMsg}</div>${nl}            </div>${nl}          </div>${nl}        \`;${nl}      }).join('');${nl}${nl}      listEl.innerHTML = itemsHtml;${nl}    },${nl}${nl}    filterNotifications(cat, btn) {`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  
  // Also add realtime listener for slideover notifications drawer
  const listenerSnippet = `${nl}// Live Realtime updater for SlideOver notifications${nl}if (typeof window !== 'undefined') {${nl}  window.addEventListener('fg:realtime-change', () => {${nl}    const panel = document.getElementById('dashboardNotificationsDrawer');${nl}    if (panel && panel.classList.contains('active') && window.SlideOver) {${nl}      window.SlideOver.renderNotificationsList(panel);${nl}    }${nl}  });${nl}}${nl}`;
  
  content += listenerSnippet;
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated assets/js/slide-over.js');
} else {
  console.warn('Target pattern not found in slide-over.js!');
}
