/**
 * school-messenger.js
 * Centralized Cross-User School Communication Engine
 * FLAWLESS GRAPHICS — LUCY™ Management System
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'school_messages_store';
  const UNREAD_KEY = 'school_messenger_unread';

  const CHANNELS = [
    { id: 'chan-all', name: '#all-staff', role: 'School Announcements', icon: 'fa-solid fa-bullhorn', isChannel: true },
    { id: 'chan-teachers', name: '#teachers-lounge', role: 'Faculty Room', icon: 'fa-solid fa-chalkboard-user', isChannel: true },
    { id: 'chan-admin', name: '#administration', role: 'HR & Operations', icon: 'fa-solid fa-building-shield', isChannel: true },
    { id: 'chan-finance', name: '#finance-desk', role: 'Bursar & Accounts', icon: 'fa-solid fa-wallet', isChannel: true }
  ];

  const CONTACTS = [
    { id: 'user-sarah', name: 'Sarah Jenkins', role: 'Teacher • Graphic Arts', email: 's.jenkins@flawless.org', status: 'online', avatar: 'SJ' },
    { id: 'user-james', name: 'James Ntiamoah', role: 'HR Admin & Lead', email: 'admin@flawlessgraphics.com', status: 'online', avatar: 'JN' },
    { id: 'user-kwame', name: 'Kwame Boateng', role: 'Teacher • Web Systems', email: 'k.boateng@flawless.org', status: 'online', avatar: 'KB' },
    { id: 'user-kofi', name: 'Kofi Owusu', role: 'Teacher • 3D Animation', email: 'k.owusu@flawless.org', status: 'busy', avatar: 'KO' },
    { id: 'user-akua', name: 'Akua Donkor', role: 'Finance Officer • Bursar', email: 'bursar@flawlessgraphics.com', status: 'online', avatar: 'AD' },
    { id: 'user-dean', name: 'Dr. Charles Arhin', role: 'Principal & Head of School', email: 'principal@flawless.org', status: 'online', avatar: 'CA' }
  ];

  const AUTO_REPLIES = {
    'user-sarah': [
      "Thank you for the update! The classroom syllabus and student roll call for this week are fully synchronized.",
      "Understood! I will review the lesson notes and update the student attendance records right away.",
      "Great news! The students in Graphic Design Mastery are making exceptional progress."
    ],
    'user-james': [
      "Noted. HR records and classroom assignments have been verified and updated in the system.",
      "Confirmed. Please let me know if any additional staffing or schedule changes are needed.",
      "Thank you. Active employee attendance and payroll calculations have been synced."
    ],
    'user-kwame': [
      "Received! The lab workstations for Web Architecture 101 are all prepared for the upcoming session.",
      "Thanks! I've uploaded the code exercise files to the classroom portal."
    ],
    'user-kofi': [
      "Thank you! The digital animation project submissions have been graded.",
      "Noted, I'll attend the staff briefing this Thursday."
    ],
    'user-akua': [
      "Received. The tuition fee allocation and ledger entry have been matched.",
      "Thank you. Staff payroll disbursements have been scheduled accordingly."
    ],
    'user-dean': [
      "Excellent work, team. Keep up the high standard of academic excellence across all departments.",
      "Approval granted. Proceed with the scheduled curriculum adjustments."
    ],
    'default': [
      "Message received. The department has noted this update.",
      "Thank you for reaching out. We will follow up during today's academic session."
    ]
  };

  function getStoredMessages() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }

    // Default Seed Messages
    const seed = [
      { id: 'm1', targetId: 'chan-all', senderName: 'Dr. Charles Arhin', senderRole: 'Principal', text: 'Welcome to Term 2 of the 2026/2027 Academic Session! All departments please ensure student records are finalized.', time: '08:30 AM', isMe: false },
      { id: 'm2', targetId: 'chan-teachers', senderName: 'Sarah Jenkins', senderRole: 'Teacher', text: 'Morning colleagues! Please remember to submit your mid-term lesson plans by Friday afternoon.', time: '09:15 AM', isMe: false },
      { id: 'm3', targetId: 'user-sarah', senderName: 'Sarah Jenkins', senderRole: 'Teacher', text: 'Hello! I have reviewed the class assignment for Graphic Design Mastery. All materials are ready.', time: '09:40 AM', isMe: false },
      { id: 'm4', targetId: 'user-akua', senderName: 'Akua Donkor', senderRole: 'Finance', text: 'Good day! All department cost centers for the new academic semester have been credited.', time: '10:05 AM', isMe: false }
    ];
    saveStoredMessages(seed);
    return seed;
  }

  function saveStoredMessages(msgs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (e) {
      console.warn(e);
    }
  }

  let activeTarget = CHANNELS[0];
  let overlayEl = null;
  let triggerEl = null;

  const SchoolMessenger = {
    init: function() {
      if (document.getElementById('schoolMessengerOverlay')) return;
      this.createUI();
      this.bindEvents();
      this.updateUnreadBadge();
    },

    createUI: function() {
      // Floating launcher trigger
      triggerEl = document.createElement('button');
      triggerEl.id = 'schoolMessengerTrigger';
      triggerEl.className = 'school-messenger-trigger';
      triggerEl.title = 'Open School Messenger (Staff & Faculty Chat)';
      triggerEl.setAttribute('aria-label', 'Open School Messenger');
      triggerEl.innerHTML = `
        <i class="fa-solid fa-comments"></i>
        <span class="school-messenger-badge" id="messengerBadge" style="display:none;">0</span>
      `;
      document.body.appendChild(triggerEl);

      // Modal window overlay
      overlayEl = document.createElement('div');
      overlayEl.id = 'schoolMessengerOverlay';
      overlayEl.className = 'messenger-overlay';
      overlayEl.innerHTML = `
        <div class="messenger-window" role="dialog" aria-modal="true">
          <!-- Sidebar -->
          <div class="messenger-sidebar" id="messengerSidebar">
            <div class="messenger-header">
              <h3><i class="fa-solid fa-comments-dollar" style="color:#38bdf8;"></i> School Messenger</h3>
              <span style="font-size:11px;font-weight:700;color:#10b981;background:rgba(16,185,129,0.15);padding:2px 8px;border-radius:12px;">Active</span>
            </div>
            <div class="messenger-search">
              <div class="messenger-search-wrap">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="messenger-search-input" id="messengerSearchInput" placeholder="Search staff or channel...">
              </div>
            </div>
            <div class="messenger-list" id="messengerList">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- Chat Pane -->
          <div class="messenger-chat">
            <div class="chat-topbar">
              <div class="chat-topbar-left">
                <div class="messenger-avatar" id="chatHeaderAvatar" style="width:36px;height:36px;border-radius:8px;">#</div>
                <div>
                  <div class="chat-title" id="chatHeaderTitle">Select a Contact</div>
                  <div class="chat-subtitle" id="chatHeaderSub">Department communications</div>
                </div>
              </div>
              <button class="chat-close-btn" id="closeMessengerBtn" title="Close Messenger">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="chat-messages" id="chatMessages">
              <!-- Message bubbles -->
            </div>

            <form class="chat-input-area" id="chatInputForm">
              <input type="text" class="chat-input-field" id="chatInputField" placeholder="Write a message to staff or channel..." autocomplete="off" required>
              <button type="submit" class="chat-send-btn" id="chatSendBtn">
                <span>Send</span>
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(overlayEl);

      this.renderSidebar();
      this.switchChat(activeTarget);
    },

    bindEvents: function() {
      const self = this;

      triggerEl.addEventListener('click', () => {
        self.open();
      });

      const closeBtn = document.getElementById('closeMessengerBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          self.close();
        });
      }

      overlayEl.addEventListener('click', (e) => {
        if (e.target === overlayEl) {
          self.close();
        }
      });

      // Escape key closes
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlayEl.classList.contains('active')) {
          self.close();
        }
      });

      // Send form
      const form = document.getElementById('chatInputForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        self.sendMessage();
      });

      // Search filter
      const searchInput = document.getElementById('messengerSearchInput');
      searchInput.addEventListener('input', (e) => {
        self.renderSidebar(e.target.value.trim().toLowerCase());
      });
    },

    renderSidebar: function(filter = '') {
      const listEl = document.getElementById('messengerList');
      if (!listEl) return;
      listEl.innerHTML = '';

      // Channels section
      const filteredChannels = CHANNELS.filter(c => c.name.toLowerCase().includes(filter) || c.role.toLowerCase().includes(filter));
      if (filteredChannels.length > 0) {
        const groupEl = document.createElement('div');
        groupEl.className = 'messenger-group-title';
        groupEl.textContent = 'Staff Channels';
        listEl.appendChild(groupEl);

        filteredChannels.forEach(c => {
          const item = document.createElement('div');
          item.className = `messenger-item ${activeTarget.id === c.id ? 'active' : ''}`;
          item.innerHTML = `
            <div class="messenger-avatar-wrap">
              <div class="messenger-avatar" style="background:rgba(37,99,235,0.25);color:#38bdf8;">
                <i class="${c.icon}"></i>
              </div>
            </div>
            <div class="messenger-item-info">
              <div class="messenger-item-name">${c.name}</div>
              <div class="messenger-item-role">${c.role}</div>
            </div>
          `;
          item.addEventListener('click', () => {
            this.switchChat(c);
          });
          listEl.appendChild(item);
        });
      }

      // Faculty and Staff Direct Contacts
      const filteredContacts = CONTACTS.filter(u => u.name.toLowerCase().includes(filter) || u.role.toLowerCase().includes(filter));
      if (filteredContacts.length > 0) {
        const groupEl = document.createElement('div');
        groupEl.className = 'messenger-group-title';
        groupEl.textContent = 'Faculty & Personnel';
        listEl.appendChild(groupEl);

        filteredContacts.forEach(u => {
          const item = document.createElement('div');
          item.className = `messenger-item ${activeTarget.id === u.id ? 'active' : ''}`;
          item.innerHTML = `
            <div class="messenger-avatar-wrap">
              <div class="messenger-avatar" style="background:linear-gradient(135deg, #4f46e5, #7c3aed);">
                ${u.avatar}
              </div>
              <span class="status-dot status-${u.status}"></span>
            </div>
            <div class="messenger-item-info">
              <div class="messenger-item-name">
                <span>${u.name}</span>
              </div>
              <div class="messenger-item-role">${u.role}</div>
            </div>
          `;
          item.addEventListener('click', () => {
            this.switchChat(u);
          });
          listEl.appendChild(item);
        });
      }
    },

    switchChat: function(target) {
      activeTarget = target;
      this.renderSidebar();

      const headerTitle = document.getElementById('chatHeaderTitle');
      const headerSub = document.getElementById('chatHeaderSub');
      const headerAvatar = document.getElementById('chatHeaderAvatar');

      if (target.isChannel) {
        headerTitle.textContent = target.name;
        headerSub.textContent = target.role;
        headerAvatar.innerHTML = `<i class="${target.icon}"></i>`;
        headerAvatar.style.background = 'rgba(37,99,235,0.25)';
      } else {
        headerTitle.textContent = target.name;
        headerSub.textContent = `${target.role} • ${target.status.toUpperCase()}`;
        headerAvatar.innerHTML = target.avatar;
        headerAvatar.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
      }

      this.renderMessages();
      const input = document.getElementById('chatInputField');
      if (input) input.focus();
    },

    renderMessages: function() {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;

      const msgs = getStoredMessages().filter(m => m.targetId === activeTarget.id);
      chatMessages.innerHTML = '';

      if (msgs.length === 0) {
        chatMessages.innerHTML = `
          <div style="text-align:center;padding:40px 20px;color:#94a3b8;">
            <i class="fa-regular fa-comment-dots" style="font-size:36px;margin-bottom:12px;opacity:0.6;"></i>
            <div style="font-weight:700;font-size:14px;">No messages in this chat yet</div>
            <div style="font-size:12px;margin-top:4px;">Start a conversation with ${escapeHtml(activeTarget.name)}</div>
          </div>
        `;
        return;
      }

      msgs.forEach(m => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${m.isMe ? 'sent' : 'received'}`;
        bubble.innerHTML = `
          ${!m.isMe ? `<div class="chat-bubble-author">${escapeHtml(m.senderName)} <span style="opacity:0.6;font-weight:normal;">(${escapeHtml(m.senderRole || '')})</span></div>` : ''}
          <div>${escapeHtml(m.text)}</div>
          <div class="chat-bubble-time">${m.time}</div>
        `;
        chatMessages.appendChild(bubble);
      });

      chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    sendMessage: function() {
      const input = document.getElementById('chatInputField');
      const text = input.value.trim();
      if (!text) return;

      const user = window.AuthSession ? window.AuthSession.getUser() : null;
      const myName = (user && user.name) || 'HR Admin';
      const myRole = (user && user.role) ? user.role.toUpperCase() : 'Staff';

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsg = {
        id: 'msg_' + Date.now(),
        targetId: activeTarget.id,
        senderName: myName,
        senderRole: myRole,
        text: text,
        time: timeStr,
        isMe: true
      };

      const msgs = getStoredMessages();
      msgs.push(newMsg);
      saveStoredMessages(msgs);

      input.value = '';
      this.renderMessages();

      // Trigger automatic staff response simulation for realistic peer engagement
      this.simulateReply(activeTarget, text);
    },

    simulateReply: function(target, userText) {
      const self = this;
      const targetId = target.id;

      setTimeout(() => {
        const replies = AUTO_REPLIES[targetId] || AUTO_REPLIES['default'];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const respondentName = target.isChannel ? 'Sarah Jenkins' : target.name;
        const respondentRole = target.isChannel ? 'Faculty Representative' : target.role;

        const replyMsg = {
          id: 'msg_' + Date.now(),
          targetId: targetId,
          senderName: respondentName,
          senderRole: respondentRole,
          text: randomReply,
          time: timeStr,
          isMe: false
        };

        const currentMsgs = getStoredMessages();
        currentMsgs.push(replyMsg);
        saveStoredMessages(currentMsgs);

        // If currently open and active, render immediately
        if (overlayEl && overlayEl.classList.contains('active') && activeTarget.id === targetId) {
          self.renderMessages();
        } else {
          // Increment unread count & notify via Toaster
          self.incrementUnread();
          if (window.Toaster) {
            window.Toaster.info(
              `New message from ${respondentName}`,
              randomReply.length > 50 ? randomReply.substring(0, 50) + '...' : randomReply,
              5000
            );
          }
        }
      }, 1600);
    },

    open: function(contactId = null) {
      this.init();
      overlayEl.classList.add('active');
      this.resetUnread();

      if (contactId) {
        const found = CONTACTS.find(c => c.id === contactId || c.name.toLowerCase() === contactId.toLowerCase()) 
                   || CHANNELS.find(c => c.id === contactId);
        if (found) {
          this.switchChat(found);
        }
      }
    },

    close: function() {
      if (overlayEl) {
        overlayEl.classList.remove('active');
      }
    },

    incrementUnread: function() {
      let count = parseInt(localStorage.getItem(UNREAD_KEY) || '0', 10) + 1;
      localStorage.setItem(UNREAD_KEY, count);
      this.updateUnreadBadge();
    },

    resetUnread: function() {
      localStorage.setItem(UNREAD_KEY, '0');
      this.updateUnreadBadge();
    },

    updateUnreadBadge: function() {
      const count = parseInt(localStorage.getItem(UNREAD_KEY) || '0', 10);
      const badge = document.getElementById('messengerBadge');
      if (badge) {
        if (count > 0) {
          badge.textContent = count > 99 ? '99+' : count;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }
    },

    /**
     * Dispatch an official system or HR broadcast to a teacher or channel
     */
    sendSystemNotification: function(targetContactId, text) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msg = {
        id: 'sys_' + Date.now(),
        targetId: targetContactId,
        senderName: 'HR Administration Desk',
        senderRole: 'Official Notice',
        text: text,
        time: timeStr,
        isMe: false
      };
      const msgs = getStoredMessages();
      msgs.push(msg);
      saveStoredMessages(msgs);
      this.incrementUnread();
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SchoolMessenger.init());
  } else {
    SchoolMessenger.init();
  }

  window.SchoolMessenger = SchoolMessenger;
})(window);
