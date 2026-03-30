// Gold Capital — Advisor Workstation
// app.js — Main Application

import { clients, advisor, TODAY } from './data.js';

// ─── STATE ────────────────────────────────────────────────
const state = {
  view: 'advisor',
  clientId: null,
  activeTab: 'overview',
  filter: { tier: 'all', health: 'all', search: '' },
  sort: 'health'
};

// ─── UTILITIES ────────────────────────────────────────────
function formatCurrency(n) {
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3)  return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + n.toFixed(0);
}

function formatCurrencyFull(n) {
  if (n < 0) return '-$' + Math.abs(n).toLocaleString();
  return '$' + n.toLocaleString();
}

function formatDate(s) {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(s) {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysSince(dateStr) {
  const a = new Date(TODAY), b = new Date(dateStr + 'T00:00:00');
  return Math.floor((a - b) / 86400000);
}

function daysUntil(dateStr) {
  const a = new Date(TODAY), b = new Date(dateStr + 'T00:00:00');
  return Math.floor((b - a) / 86400000);
}

function healthColor(score) {
  if (score >= 8) return 'green';
  if (score >= 6) return 'amber';
  return 'red';
}

function stripeClass(score) {
  if (score >= 8) return 'stripe-green';
  if (score >= 6) return 'stripe-amber';
  return 'stripe-red';
}

function tierClass(tier) {
  return { platinum: 'tier-platinum', gold: 'tier-gold', silver: 'tier-silver' }[tier] || '';
}

function tierLabel(tier) {
  return { platinum: 'Platinum', gold: 'Gold', silver: 'Silver' }[tier] || tier;
}

function healthClass(label) {
  return { 'Thriving': 'health-thriving', 'Nurture': 'health-nurture', 'At Risk': 'health-at-risk' }[label] || '';
}

function touchpointIcon(type) {
  return { meeting: 'M', phone_call: 'C', gift_sent: 'G', email: 'E', event: 'V', annual_review: 'R', video_call: 'V' }[type] || '·';
}

function touchpointClass(type) {
  return { meeting: 'tp-meeting', phone_call: 'tp-phone', gift_sent: 'tp-gift', email: 'tp-email', event: 'tp-event', annual_review: 'tp-review', video_call: 'tp-meeting' }[type] || 'tp-meeting';
}

function touchpointLabel(type) {
  return { meeting: 'Meeting', phone_call: 'Call', gift_sent: 'Gift', email: 'Email', event: 'Event', annual_review: 'Review', video_call: 'Video' }[type] || type;
}

function txTypeClass(type) {
  return { Buy: 'tx-buy', Sell: 'tx-sell', Dividend: 'tx-dividend', Contribution: 'tx-contribution', Fee: 'tx-fee', Interest: 'tx-interest', Rebalance: 'tx-rebalance', Withdrawal: 'tx-withdrawal' }[type] || 'tx-rebalance';
}

function statusClass(s) {
  return { open: 'status-open', in_progress: 'status-in-progress', awaiting_client: 'status-awaiting', completed: 'status-completed' }[s] || '';
}

function statusLabel(s) {
  return { open: 'Open', in_progress: 'In Progress', awaiting_client: 'Awaiting Client', completed: 'Completed' }[s] || s;
}

function assetTypeClass(t) {
  if (t === 'US Equity')    return 'type-equity';
  if (t === 'Fixed Income') return 'type-fixed';
  if (t === 'Real Estate')  return 'type-real-estate';
  if (t === 'Cash')         return 'type-cash';
  return 'type-alts';
}

function contactColor(days) {
  if (days > 60) return 'overdue';
  if (days > 30) return 'due-soon';
  return 'good';
}

function contactLabel(days) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days > 60)  return `${days} days ago — OVERDUE`;
  if (days > 30)  return `${days} days ago — follow up`;
  return `${days} days ago`;
}

function formatAmount(n) {
  if (n === 0) return '—';
  const abs = Math.abs(n);
  const sign = n > 0 ? '+' : '-';
  return sign + '$' + abs.toLocaleString();
}

// ─── NEXT BEST ACTIONS ────────────────────────────────────
function computeNextBestActions(client) {
  const actions = [];
  const dsc = daysSince(client.lastTouchpoint.date);

  // Urgent upcoming milestone (within 30 days)
  const urgent = client.upcomingMilestones.find(m => {
    const d = daysUntil(m.date);
    return d >= 0 && d <= 30;
  });
  if (urgent) {
    const d = daysUntil(urgent.date);
    actions.push({
      priority: 'high', icon: 'M',
      title: urgent.description,
      sub: d === 0 ? 'Today!' : `${d} day${d !== 1 ? 's' : ''} away · ${formatDate(urgent.date)}`
    });
  }

  // Overdue contact
  if (dsc > 60) {
    actions.push({ priority: 'high', icon: 'C', title: `Reach out immediately — ${dsc} days without contact`, sub: `Last: ${client.lastTouchpoint.summary}` });
  } else if (dsc > 30) {
    actions.push({ priority: 'medium', icon: 'C', title: `Schedule a check-in call`, sub: `${dsc} days since last contact — ${client.lastTouchpoint.summary}` });
  }

  // High priority open service request
  const highReq = client.serviceRequests.find(r => r.status !== 'completed' && r.priority === 'high');
  if (highReq) {
    const od = daysSince(highReq.createdDate);
    actions.push({ priority: 'high', icon: 'S', title: `Follow up: ${highReq.title}`, sub: `Open ${od} day${od !== 1 ? 's' : ''} · Due ${formatDate(highReq.dueDate)}` });
  }

  // Default fallback
  if (actions.length === 0) {
    actions.push({ priority: 'low', icon: 'R', title: 'Review Q2 portfolio positioning', sub: 'Relationship is in great shape — no urgent actions' });
  }

  return actions.slice(0, 3);
}

// ─── ROUTER ───────────────────────────────────────────────
function parseRoute() {
  const hash = window.location.hash || '#/';
  const parts = hash.replace('#/', '').split('/');
  if (parts[0] === 'client' && parts[1]) {
    state.view = 'client';
    state.clientId = parseInt(parts[1]);
    state.activeTab = 'overview';
  } else if (['calendar', 'tasks', 'reports'].includes(parts[0])) {
    state.view = parts[0];
    state.clientId = null;
  } else {
    state.view = 'advisor';
    state.clientId = null;
  }
}

function navigate(path) {
  window.location.hash = '#/' + path;
}

// ─── FILTER & SORT ────────────────────────────────────────
function getFilteredClients() {
  let list = [...clients];
  const { tier, health, search } = state.filter;

  if (tier !== 'all') list = list.filter(c => c.tier === tier);
  if (health !== 'all') {
    const map = { thriving: 'Thriving', nurture: 'Nurture', 'at-risk': 'At Risk' };
    list = list.filter(c => c.healthLabel === map[health]);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(c => c.displayName.toLowerCase().includes(q));
  }

  const sortMap = {
    health:  (a, b) => b.healthScore - a.healthScore,
    aum:     (a, b) => b.aum - a.aum,
    contact: (a, b) => daysSince(a.lastTouchpoint.date) - daysSince(b.lastTouchpoint.date),
    name:    (a, b) => a.displayName.localeCompare(b.displayName)
  };
  list.sort(sortMap[state.sort] || sortMap.health);
  return list;
}

// ─── SIDEBAR ──────────────────────────────────────────────
function renderSidebar() {
  const totalAUM = clients.reduce((s, c) => s + c.aum, 0);
  const openTasks = clients.reduce((s, c) => s + c.openTasks, 0);

  if (state.view !== 'client') {
    return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">GC</div>
        <div class="brand-text">
          <div class="brand-name">Gold Capital</div>
          <div class="brand-sub">Advisor Workstation</div>
        </div>
      </div>
      <div class="sidebar-advisor">
        <div class="advisor-avatar">${advisor.initials}</div>
        <div class="advisor-info">
          <div class="advisor-name">${advisor.name}</div>
          <div class="advisor-title">${advisor.title}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-label">Workspace</div>
        <button class="nav-item ${state.view==='advisor'?'active':''}" data-nav="advisor">Book of Business</button>
        <button class="nav-item ${state.view==='calendar'?'active':''}" data-nav="calendar">Calendar</button>
        <button class="nav-item ${state.view==='tasks'?'active':''}" data-nav="tasks">
          Tasks
          ${openTasks > 0 ? `<span class="nav-badge">${openTasks}</span>` : ''}
        </button>
        <button class="nav-item ${state.view==='reports'?'active':''}" data-nav="reports">Reports</button>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-stat-row">
          <span class="sidebar-stat-label">Total AUM</span>
          <span class="sidebar-stat-value">${formatCurrency(totalAUM)}</span>
        </div>
        <div class="sidebar-stat-row">
          <span class="sidebar-stat-label">Clients</span>
          <span class="sidebar-stat-value">${clients.length}</span>
        </div>
        <div class="sidebar-stat-row">
          <span class="sidebar-stat-label">Open Tasks</span>
          <span class="sidebar-stat-value">${openTasks}</span>
        </div>
      </div>
    </aside>`;
  }

  // Client view sidebar
  const client = clients.find(c => c.id === state.clientId);
  const tabs = [
    { id: 'overview',     label: 'Overview' },
    { id: 'touchpoints',  label: 'Touchpoints' },
    { id: 'service',      label: 'Service Requests' },
    { id: 'holdings',     label: 'Holdings' },
    { id: 'transactions', label: 'Transactions' }
  ];
  return `
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-mark">GC</div>
      <div class="brand-text">
        <div class="brand-name">Gold Capital</div>
        <div class="brand-sub">Advisor Workstation</div>
      </div>
    </div>
    <div class="sidebar-advisor">
      <div class="advisor-avatar">${advisor.initials}</div>
      <div class="advisor-info">
        <div class="advisor-name">${advisor.name}</div>
        <div class="advisor-title">${advisor.title}</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <button class="nav-back" data-back="true">← Book of Business</button>
      ${client ? `<div class="nav-client-name">${client.displayName}</div>` : ''}
      <div class="nav-label">Client View</div>
      ${tabs.map(t => `
        <button class="nav-item ${state.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
          ${t.label}
        </button>`).join('')}
    </nav>
    <div class="sidebar-footer">
      ${client ? `
        <div class="sidebar-stat-row">
          <span class="sidebar-stat-label">AUM</span>
          <span class="sidebar-stat-value">${formatCurrency(client.aum)}</span>
        </div>
        <div class="sidebar-stat-row">
          <span class="sidebar-stat-label">Health</span>
          <span class="sidebar-stat-value">${client.healthScore} · ${client.healthLabel}</span>
        </div>` : ''}
    </div>
  </aside>`;
}

// ─── CALENDAR VIEW ────────────────────────────────────────
function renderCalendarView() {
  const base = new Date(TODAY + 'T00:00:00');
  const year = base.getFullYear(), month = base.getMonth();
  const monthName = base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Collect all events for this month
  const events = {};
  clients.forEach(c => {
    c.upcomingMilestones.forEach(m => {
      const d = new Date(m.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!events[key]) events[key] = [];
        events[key].push({ type: 'milestone', label: m.description, client: c.displayName.split(' ')[0] });
      }
    });
    c.touchpoints.forEach(tp => {
      const d = new Date(tp.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!events[key]) events[key] = [];
        events[key].push({ type: 'touchpoint', label: tp.title, client: c.displayName.split(' ')[0] });
      }
    });
    c.serviceRequests.forEach(sr => {
      if (sr.status === 'completed') return;
      const d = new Date(sr.dueDate + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!events[key]) events[key] = [];
        events[key].push({ type: 'task', label: sr.title, client: c.displayName.split(' ')[0] });
      }
    });
  });

  const today = base.getDate();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell cal-empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today;
    const dayEvents = events[d] || [];
    const shown = dayEvents.slice(0, 2);
    const overflow = dayEvents.length - 2;
    cells += `
    <div class="cal-cell${isToday ? ' cal-today' : ''}">
      <div class="cal-day-num${isToday ? ' cal-today-num' : ''}">${d}</div>
      ${shown.map(ev => `<div class="cal-event cal-event-${ev.type}" title="${ev.client}: ${ev.label}">${ev.client}: ${ev.label}</div>`).join('')}
      ${overflow > 0 ? `<div class="cal-event-more">+${overflow} more</div>` : ''}
    </div>`;
  }

  // Upcoming list — next 14 days of milestones + due tasks
  const upcoming = [];
  clients.forEach(c => {
    c.upcomingMilestones.forEach(m => {
      const d = daysUntil(m.date);
      if (d >= 0 && d <= 14) upcoming.push({ d, date: m.date, label: m.description, client: c.displayName, type: 'milestone' });
    });
    c.serviceRequests.filter(r => r.status !== 'completed').forEach(r => {
      const d = daysUntil(r.dueDate);
      if (d >= 0 && d <= 14) upcoming.push({ d, date: r.dueDate, label: r.title, client: c.displayName, type: 'task' });
    });
  });
  upcoming.sort((a, b) => a.d - b.d);

  return `
  <div class="main-header">
    ${menuBtn}
    <div class="header-title">Calendar</div>
    <div class="header-spacer"></div>
    <div class="header-avatar">${advisor.initials}</div>
  </div>
  <div class="main-content">
    <div class="calendar-layout">
      <div class="cal-main">
        <div class="cal-month-header">${monthName}</div>
        <div class="cal-grid-head">
          ${days.map(d => `<div class="cal-grid-label">${d}</div>`).join('')}
        </div>
        <div class="cal-grid">${cells}</div>
        <div class="cal-legend">
          <span class="cal-legend-dot cal-event-milestone"></span>Milestone
          <span class="cal-legend-dot cal-event-touchpoint" style="margin-left:12px"></span>Touchpoint
          <span class="cal-legend-dot cal-event-task" style="margin-left:12px"></span>Task Due
        </div>
      </div>
      <div class="cal-sidebar">
        <div class="cal-sidebar-title">Next 14 Days</div>
        ${upcoming.length === 0
          ? `<div class="empty-sub" style="padding:12px 0">Nothing scheduled</div>`
          : upcoming.map(ev => `
            <div class="cal-upcoming-row">
              <div class="cal-upcoming-date">${ev.d === 0 ? 'Today' : ev.d + 'd'}</div>
              <div class="cal-upcoming-body">
                <div class="data-table-primary" style="font-size:12px">${ev.label}</div>
                <div class="data-table-sub">${ev.client}</div>
              </div>
              <span class="cal-event-dot cal-event-${ev.type}"></span>
            </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ─── TASKS VIEW ───────────────────────────────────────────
function renderTasksView() {
  const allTasks = [];
  clients.forEach(c => {
    c.serviceRequests.filter(r => r.status !== 'completed').forEach(r => {
      allTasks.push({ ...r, clientName: c.displayName, clientId: c.id });
    });
  });
  allTasks.sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const priorityColors = {
    high:   { bg: 'rgba(200,40,40,.08)',  color: 'var(--red)' },
    medium: { bg: 'rgba(184,100,20,.08)', color: 'var(--accent)' },
    low:    { bg: 'var(--blue-bg)',       color: 'var(--blue-text)' }
  };

  return `
  <div class="main-header">
    ${menuBtn}
    <div class="header-title">Tasks</div>
    <div class="header-spacer"></div>
    <div class="header-avatar">${advisor.initials}</div>
  </div>
  <div class="main-content">
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">Open Tasks</div>
        <div class="stat-value">${allTasks.length}</div>
        <div class="stat-sub">across ${clients.filter(c => c.serviceRequests.some(r=>r.status!=='completed')).length} clients</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">High Priority</div>
        <div class="stat-value">${allTasks.filter(t=>t.priority==='high').length}</div>
        <div class="stat-sub">require immediate attention</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Due This Week</div>
        <div class="stat-value">${allTasks.filter(t=>daysUntil(t.dueDate)<=7&&daysUntil(t.dueDate)>=0).length}</div>
        <div class="stat-sub">due within 7 days</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Awaiting Client</div>
        <div class="stat-value">${allTasks.filter(t=>t.status==='awaiting_client').length}</div>
        <div class="stat-sub">pending client response</div>
      </div>
    </div>

    ${allTasks.length === 0
      ? `<div class="empty-state"><div class="empty-title">All clear</div><div class="empty-sub">No open tasks</div></div>`
      : `<div class="panel-card" style="padding:0;overflow:hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:90px">Priority</th>
                <th>Task</th>
                <th>Client</th>
                <th>Type</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              ${allTasks.map(t => {
                const pc = priorityColors[t.priority] || priorityColors.low;
                const due = daysUntil(t.dueDate);
                const dueCls = due <= 3 ? 'loss' : due <= 7 ? '' : 'data-table-sub';
                return `
                <tr>
                  <td><span class="priority-dot-badge" style="background:${pc.bg};color:${pc.color}">${t.priority.toUpperCase()}</span></td>
                  <td>
                    <div class="data-table-primary">${t.title}</div>
                    <div class="data-table-note">${t.notes}</div>
                  </td>
                  <td>
                    <span class="tasks-client-link" data-client-id="${t.clientId}">${t.clientName}</span>
                  </td>
                  <td class="data-table-sub">${t.type}</td>
                  <td><span class="status-badge ${statusClass(t.status)}">${statusLabel(t.status)}</span></td>
                  <td class="${dueCls}" style="white-space:nowrap;font-size:13px;font-weight:600">${due === 0 ? 'Today' : due < 0 ? 'Overdue' : formatDate(t.dueDate)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`}
  </div>`;
}

// ─── REPORTS VIEW ─────────────────────────────────────────
function renderReportsView() {
  const totalAUM   = clients.reduce((s, c) => s + c.aum, 0);
  const totalRev   = clients.reduce((s, c) => s + c.ltvMetrics.estimatedAnnualRevenue, 0);
  const totalLTV   = clients.reduce((s, c) => s + c.ltvMetrics.projectedLTV, 0);
  const totalRefs  = clients.reduce((s, c) => s + c.ltvMetrics.referralsGiven, 0);
  const avgHealth  = (clients.reduce((s, c) => s + c.healthScore, 0) / clients.length).toFixed(1);

  const byTier = ['platinum', 'gold', 'silver'].map(tier => {
    const grp = clients.filter(c => c.tier === tier);
    return {
      tier,
      count: grp.length,
      aum: grp.reduce((s, c) => s + c.aum, 0),
      rev: grp.reduce((s, c) => s + c.ltvMetrics.estimatedAnnualRevenue, 0),
      avgHealth: grp.length ? (grp.reduce((s, c) => s + c.healthScore, 0) / grp.length).toFixed(1) : '—'
    };
  });

  const byHealth = [
    { label: 'Thriving', cls: 'health-thriving', count: clients.filter(c => c.healthLabel === 'Thriving').length },
    { label: 'Nurture',  cls: 'health-nurture',  count: clients.filter(c => c.healthLabel === 'Nurture').length },
    { label: 'At Risk',  cls: 'health-at-risk',  count: clients.filter(c => c.healthLabel === 'At Risk').length }
  ];

  const tpLast30 = clients.reduce((s, c) =>
    s + c.touchpoints.filter(tp => daysSince(tp.date) <= 30).length, 0);
  const avgContactDays = Math.round(
    clients.reduce((s, c) => s + daysSince(c.lastTouchpoint.date), 0) / clients.length);
  const overdueCount = clients.filter(c => daysSince(c.lastTouchpoint.date) > 60).length;

  return `
  <div class="main-header">
    ${menuBtn}
    <div class="header-title">Reports</div>
    <div class="header-spacer"></div>
    <div class="header-avatar">${advisor.initials}</div>
  </div>
  <div class="main-content">

    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">Total AUM</div>
        <div class="stat-value">${formatCurrency(totalAUM)}</div>
        <div class="stat-sub">${clients.length} client relationships</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Annual Revenue</div>
        <div class="stat-value">${formatCurrency(totalRev)}</div>
        <div class="stat-sub">${((totalRev/totalAUM)*100).toFixed(2)}% blended fee</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Projected LTV</div>
        <div class="stat-value">${formatCurrency(totalLTV)}</div>
        <div class="stat-sub">${totalRefs} referrals given</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Health Score</div>
        <div class="stat-value">${avgHealth}<span style="font-size:14px;font-weight:400;color:var(--text-muted)">/10</span></div>
        <div class="stat-sub">LTV-weighted</div>
      </div>
    </div>

    <div class="reports-grid">
      <div class="panel-card">
        <div class="panel-title">AUM by Tier</div>
        <table class="data-table">
          <thead><tr><th>Tier</th><th>Clients</th><th style="text-align:right">AUM</th><th style="text-align:right">Revenue</th><th style="text-align:right">Avg Health</th></tr></thead>
          <tbody>
            ${byTier.map(r => `
            <tr>
              <td><span class="tier-badge ${tierClass(r.tier)}">${tierLabel(r.tier)}</span></td>
              <td class="data-table-sub">${r.count}</td>
              <td class="data-table-num">${formatCurrency(r.aum)}</td>
              <td class="data-table-num">${formatCurrency(r.rev)}</td>
              <td class="data-table-num">${r.avgHealth}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="panel-card">
        <div class="panel-title">Health Distribution</div>
        ${byHealth.map(h => `
        <div class="report-health-row">
          <span class="health-label-badge ${h.cls}">${h.label}</span>
          <div class="report-bar-track">
            <div class="report-bar-fill ${h.cls}" style="width:${(h.count/clients.length*100).toFixed(0)}%"></div>
          </div>
          <span class="data-table-num" style="min-width:20px">${h.count}</span>
        </div>`).join('')}

        <div class="panel-title" style="margin-top:20px">Engagement Summary</div>
        <div class="report-stat-row"><span class="data-table-sub">Touchpoints (last 30 days)</span><span class="data-table-primary">${tpLast30}</span></div>
        <div class="report-stat-row"><span class="data-table-sub">Avg days since last contact</span><span class="data-table-primary">${avgContactDays}d</span></div>
        <div class="report-stat-row"><span class="data-table-sub">Clients overdue for contact</span><span class="data-table-primary ${overdueCount>0?'loss':''}">${overdueCount}</span></div>
      </div>
    </div>

    <div class="panel-card" style="margin-top:16px;padding:0;overflow:hidden">
      <div style="padding:16px 20px 8px"><div class="panel-title" style="margin:0">Client Summary</div></div>
      <table class="data-table">
        <thead><tr><th>Client</th><th>Tier</th><th style="text-align:right">AUM</th><th style="text-align:right">Revenue</th><th style="text-align:right">LTV</th><th>Health</th><th style="text-align:right">Last Contact</th></tr></thead>
        <tbody>
          ${[...clients].sort((a,b)=>b.aum-a.aum).map(c => `
          <tr>
            <td><div class="data-table-primary">${c.displayName}</div></td>
            <td><span class="tier-badge ${tierClass(c.tier)}">${tierLabel(c.tier)}</span></td>
            <td class="data-table-num">${formatCurrency(c.aum)}</td>
            <td class="data-table-num">${formatCurrency(c.ltvMetrics.estimatedAnnualRevenue)}</td>
            <td class="data-table-num">${formatCurrency(c.ltvMetrics.projectedLTV)}</td>
            <td><span class="health-score-inline ${healthColor(c.healthScore)}">${c.healthScore} <span style="font-weight:400">${c.healthLabel}</span></span></td>
            <td class="data-table-num data-table-sub">${daysSince(c.lastTouchpoint.date)}d ago</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

  </div>`;
}

// ─── ATTENTION STRIP ──────────────────────────────────────
function renderAttentionStrip() {
  const overdue = clients.filter(c => daysSince(c.lastTouchpoint.date) > 60);
  const highReqs = clients.filter(c => c.serviceRequests.some(r => r.status !== 'completed' && r.priority === 'high'));
  const upcoming7 = clients.filter(c => c.upcomingMilestones.some(m => { const d = daysUntil(m.date); return d >= 0 && d <= 7; }));

  if (overdue.length === 0 && highReqs.length === 0 && upcoming7.length === 0) return '';

  function names(arr) {
    if (arr.length === 0) return 'None';
    const shown = arr.slice(0, 2).map(c => c.displayName.split(' ')[0]);
    return shown.join(', ') + (arr.length > 2 ? ` +${arr.length - 2}` : '');
  }

  return `
  <div class="attention-strip">
    ${overdue.length > 0 ? `
    <div class="attention-tile red">
      <div class="attention-tile-count">${overdue.length}</div>
      <div class="attention-tile-body">
        <div class="attention-tile-label">Overdue Contact</div>
        <div class="attention-tile-names">${names(overdue)}</div>
      </div>
    </div>` : ''}
    ${highReqs.length > 0 ? `
    <div class="attention-tile amber">
      <div class="attention-tile-count">${highReqs.length}</div>
      <div class="attention-tile-body">
        <div class="attention-tile-label">High-Priority Requests</div>
        <div class="attention-tile-names">${names(highReqs)}</div>
      </div>
    </div>` : ''}
    ${upcoming7.length > 0 ? `
    <div class="attention-tile blue">
      <div class="attention-tile-count">${upcoming7.length}</div>
      <div class="attention-tile-body">
        <div class="attention-tile-label">Milestones This Week</div>
        <div class="attention-tile-names">${names(upcoming7)}</div>
      </div>
    </div>` : ''}
  </div>`;
}

// ─── ADVISOR VIEW ─────────────────────────────────────────
function renderAdvisorView() {
  const totalAUM   = clients.reduce((s, c) => s + c.aum, 0);
  const totalTasks = clients.reduce((s, c) => s + c.openTasks, 0);
  const avgHealth  = (clients.reduce((s, c) => s + c.healthScore, 0) / clients.length).toFixed(1);
  const upcoming   = clients.reduce((s, c) => s + c.upcomingMilestones.filter(m => daysUntil(m.date) >= 0 && daysUntil(m.date) <= 30).length, 0);

  const filtered = getFilteredClients();

  return `
  <div class="main-header">
    ${menuBtn}
    <div class="header-title">Book of Business</div>
    <div class="header-search">
      <span class="header-search-icon">◎</span>
      <input type="text" id="search-input" placeholder="Search clients…" value="${state.filter.search}">
    </div>
    <div class="header-spacer"></div>
    <div class="header-actions">
      <button class="header-btn primary">+ Log Touchpoint</button>
    </div>
    <div class="header-avatar" title="${advisor.name}">${advisor.initials}</div>
  </div>

  <div class="main-content">
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">Total AUM</div>
        <div class="stat-value">${formatCurrency(totalAUM)}</div>
        <div class="stat-sub">across ${clients.length} client relationships</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Open Tasks</div>
        <div class="stat-value">${totalTasks}</div>
        <div class="stat-sub">service requests & follow-ups</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Health Score</div>
        <div class="stat-value">${avgHealth}<span style="font-size:14px;font-weight:400;color:var(--text-2)">/10</span></div>
        <div class="stat-sub">LTV-weighted relationship health</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Upcoming Moments</div>
        <div class="stat-value">${upcoming}</div>
        <div class="stat-sub">milestones in next 30 days</div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <button class="filter-btn ${state.filter.tier === 'all' ? 'active' : ''}" data-tier="all">All Tiers</button>
        <button class="filter-btn ${state.filter.tier === 'platinum' ? 'active' : ''}" data-tier="platinum">Platinum</button>
        <button class="filter-btn ${state.filter.tier === 'gold' ? 'active' : ''}" data-tier="gold">Gold</button>
        <button class="filter-btn ${state.filter.tier === 'silver' ? 'active' : ''}" data-tier="silver">Silver</button>
      </div>
      <div class="filter-divider"></div>
      <div class="filter-group">
        <button class="filter-btn ${state.filter.health === 'all' ? 'active' : ''}" data-health="all">All</button>
        <button class="filter-btn ${state.filter.health === 'thriving' ? 'active' : ''}" data-health="thriving">Thriving</button>
        <button class="filter-btn ${state.filter.health === 'nurture' ? 'active' : ''}" data-health="nurture">Nurture</button>
        <button class="filter-btn ${state.filter.health === 'at-risk' ? 'active' : ''}" data-health="at-risk">At Risk</button>
      </div>
      <div class="filter-divider"></div>
      <div class="filter-sort">
        <span>Sort:</span>
        <select id="sort-select">
          <option value="health"  ${state.sort === 'health'  ? 'selected' : ''}>Health Score</option>
          <option value="aum"     ${state.sort === 'aum'     ? 'selected' : ''}>AUM</option>
          <option value="contact" ${state.sort === 'contact' ? 'selected' : ''}>Last Contact</option>
          <option value="name"    ${state.sort === 'name'    ? 'selected' : ''}>Name</option>
        </select>
      </div>
      <div class="filter-count">${filtered.length} of ${clients.length} clients</div>
    </div>

    ${renderAttentionStrip()}

    ${filtered.length === 0
      ? `<div class="no-results"><div class="no-results-icon"></div><div class="no-results-title">No clients match your filters</div><div class="text-muted">Try adjusting your search or filters</div></div>`
      : `<div class="clients-grid">${filtered.map(renderClientCard).join('')}</div>`
    }
  </div>`;
}

function renderClientCard(client) {
  const dsc = daysSince(client.lastTouchpoint.date);
  const nextMilestone = client.upcomingMilestones.find(m => daysUntil(m.date) >= 0);
  const openSR = client.serviceRequests.filter(r => r.status !== 'completed').length;
  const hc = healthColor(client.healthScore);
  const du = nextMilestone ? daysUntil(nextMilestone.date) : null;

  return `
  <div class="client-card" data-client-id="${client.id}">
    <div class="card-health-stripe ${hc}"></div>
    <div class="card-body">

      <div class="card-top-row">
        <div class="card-name">${client.displayName}</div>
        <span class="tier-badge ${tierClass(client.tier)}">${tierLabel(client.tier)}</span>
      </div>

      <div class="card-aum-row">
        <span class="card-aum">${formatCurrency(client.aum)}</span>
        <span class="card-aum-growth ${client.aumGrowthYTD >= 0 ? 'positive' : 'negative'}">
          ${client.aumGrowthYTD >= 0 ? '+' : ''}${(client.aumGrowthYTD * 100).toFixed(1)}%
        </span>
        <span class="card-health-pill ${hc}">
          <span class="health-dot ${hc}"></span>${client.healthScore}
        </span>
      </div>

      <div class="card-metrics-row">
        <div class="card-metric">
          <div class="metric-label">Last Contact</div>
          <div class="metric-value ${contactColor(dsc)}">${contactLabel(dsc)}</div>
        </div>
        <div class="card-metric-divider"></div>
        <div class="card-metric">
          <div class="metric-label">Open Tasks</div>
          <div class="metric-value ${client.openTasks > 2 ? 'overdue' : client.openTasks > 0 ? 'nudge' : 'good'}">${client.openTasks > 0 ? client.openTasks + ' pending' : 'Clear'}</div>
        </div>
        <div class="card-metric-divider"></div>
        <div class="card-metric">
          <div class="metric-label">Service Requests</div>
          <div class="metric-value ${openSR > 1 ? 'overdue' : openSR > 0 ? 'nudge' : ''}">${openSR > 0 ? openSR + ' open' : 'None'}</div>
        </div>
      </div>

      ${nextMilestone ? `
      <div class="card-milestone">
        <span class="milestone-dot"></span>
        ${nextMilestone.description}
        <span class="milestone-days">${du === 0 ? 'Today' : du + 'd'}</span>
      </div>` : '<div class="card-milestone-empty"></div>'}

    </div>
    <div class="card-footer">
      <span class="card-footer-meta">${touchpointLabel(client.lastTouchpoint.type)} · ${formatDateShort(client.lastTouchpoint.date)}</span>
      <button class="card-view-btn" data-client-id="${client.id}">View Profile</button>
    </div>
  </div>`;
}

// ─── CLIENT VIEW ──────────────────────────────────────────
function renderClientView() {
  const client = clients.find(c => c.id === state.clientId);
  if (!client) return `<div class="main-header"><div class="header-title">Client not found</div></div><div class="main-content"><div class="empty-state">Client not found</div></div>`;

  const hc = healthColor(client.healthScore);
  const tenure = Math.floor((new Date(TODAY) - new Date(client.joinDate + 'T00:00:00')) / (365.25 * 86400000));

  return `
  <div class="main-header">
    ${menuBtn}
    <div class="header-breadcrumb">
      <span class="breadcrumb-link" data-back="true">Book of Business</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${client.displayName}</span>
    </div>
    <div class="header-spacer"></div>
    <div class="header-actions">
      <button class="header-btn-text">Log Touchpoint</button>
      <button class="header-btn-text primary">+ Service Request</button>
    </div>
    <div class="header-avatar">${advisor.initials}</div>
  </div>

  <div class="main-content">
    <div class="client-banner">
      <div class="banner-stripe ${hc}"></div>
      <div class="banner-top">
        <div class="client-avatar-lg">${client.initials}</div>
        <div class="banner-info">
          <div class="banner-name">
            ${client.displayName}
            <span class="tier-badge ${tierClass(client.tier)}">${tierLabel(client.tier)}</span>
          </div>
          <div class="banner-meta">
            <div class="banner-meta-item">${client.location}</div>
            <span class="banner-meta-sep">·</span>
            <div class="banner-meta-item">Advisor: ${client.advisor}</div>
            <span class="banner-meta-sep">·</span>
            <div class="banner-meta-item">Client since ${new Date(client.joinDate+'T00:00:00').getFullYear()} &nbsp;·&nbsp; ${tenure} yrs</div>
          </div>
        </div>
        <div class="banner-right">
          <div class="banner-stat">
            <div class="banner-stat-label">Assets Under Management</div>
            <div class="banner-stat-value">${formatCurrency(client.aum)}</div>
            <div class="banner-stat-sub" style="color:var(--green)">+${(client.aumGrowthYTD*100).toFixed(1)}% YTD</div>
          </div>
          <div class="banner-vdivider"></div>
          <div class="health-score-block">
            <div class="health-score-num ${hc}">${client.healthScore}</div>
            <div class="health-score-label ${hc}">${client.healthLabel}</div>
            <div class="health-score-sub">Relationship Health</div>
          </div>
        </div>
      </div>
      ${client.tags && client.tags.length ? `
      <div class="banner-tags">
        ${client.tags.map(t => `<span class="tag">${t.replace(/-/g,' ')}</span>`).join('')}
      </div>` : ''}
    </div>

    <div class="client-tabs" id="tab-bar">
      ${[
        { id: 'overview',      label: 'Overview',           badge: null },
        { id: 'touchpoints',   label: 'Touchpoints',        badge: client.touchpoints.length },
        { id: 'service',       label: 'Service',   badge: client.serviceRequests.filter(r=>r.status!=='completed').length || null },
        { id: 'holdings',      label: 'Holdings',           badge: null },
        { id: 'transactions',  label: 'Transactions',       badge: null }
      ].map(t => `
        <button class="tab-btn ${state.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
          ${t.label}
          ${t.badge ? `<span class="tab-badge">${t.badge}</span>` : ''}
        </button>`).join('')}
    </div>

    <div id="tab-content">
      ${renderTabContent(client)}
    </div>
  </div>`;
}

function renderTabContent(client) {
  switch (state.activeTab) {
    case 'overview':      return renderOverviewTab(client);
    case 'touchpoints':   return renderTouchpointsTab(client);
    case 'service':       return renderServiceTab(client);
    case 'holdings':      return renderHoldingsTab(client);
    case 'transactions':  return renderTransactionsTab(client);
    default:              return renderOverviewTab(client);
  }
}

// ── Overview Tab ──────────────────────────────────────────
function renderOverviewTab(client) {
  const tenure = Math.floor((new Date(TODAY) - new Date(client.joinDate + 'T00:00:00')) / (365.25 * 86400000));
  const actions = computeNextBestActions(client);
  const ltv = client.ltvMetrics;
  const futureMilestones = client.upcomingMilestones.filter(m => daysUntil(m.date) >= 0).slice(0, 3);

  return `
  <div class="overview-grid">
    <div class="stat-card">
      <div class="stat-label">Assets Under Management</div>
      <div class="stat-value">${formatCurrency(client.aum)}</div>
      <div class="stat-sub"><span class="stat-change up">↑ ${(client.aumGrowthYTD*100).toFixed(1)}% YTD</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Est. Annual Revenue</div>
      <div class="stat-value">${formatCurrency(ltv.estimatedAnnualRevenue)}</div>
      <div class="stat-sub">${(ltv.feeRate * 100).toFixed(2)}% advisory fee</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Open Service Requests</div>
      <div class="stat-value">${client.serviceRequests.filter(r=>r.status!=='completed').length}</div>
      <div class="stat-sub">${client.openTasks} open tasks total</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Client Since</div>
      <div class="stat-value">${tenure}<span style="font-size:14px;font-weight:400"> yrs</span></div>
      <div class="stat-sub">${ltv.referralsGiven} referral${ltv.referralsGiven !== 1 ? 's' : ''} given</div>
    </div>
  </div>

  <div class="overview-grid">
    <div class="panel-card">
      <div class="panel-title">Recommended Actions</div>
      <div class="action-items">
        ${actions.map(a => `
          <div class="action-item ${a.priority}">
            <div class="action-icon-badge ${a.priority}">${a.icon}</div>
            <div class="action-text">
              <div class="action-title">${a.title}</div>
              <div class="action-sub">${a.sub}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-title">Upcoming Moments</div>
      ${futureMilestones.length === 0
        ? `<div class="empty-state" style="padding:20px"><div class="empty-sub">No upcoming milestones in next 90 days</div></div>`
        : `<div class="moments-list">${futureMilestones.map(m => {
            const d = daysUntil(m.date);
            const dateObj = new Date(m.date + 'T00:00:00');
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const day   = dateObj.getDate();
            return `
            <div class="moment-item">
              <div class="moment-date-block"><div class="moment-month">${month}</div><div class="moment-day">${day}</div></div>
              <div class="moment-info">
                <div class="moment-title">${m.description}</div>
                <div class="moment-sub">${formatDate(m.date)}</div>
              </div>
              <div class="moment-days-badge">${d === 0 ? 'Today!' : d + 'd'}</div>
            </div>`;
          }).join('')}</div>`}
    </div>
  </div>

  <div class="panel-card" style="margin-bottom:16px">
    <div class="panel-title">Relationship Value</div>
    <div class="rv-headline">
      <div class="rv-stat-tile">
        <div class="rv-stat-value">${formatCurrency(ltv.estimatedAnnualRevenue)}</div>
        <div class="rv-stat-label">Annual Revenue</div>
      </div>
      <div class="rv-stat-tile">
        <div class="rv-stat-value">${formatCurrency(ltv.projectedLTV)}</div>
        <div class="rv-stat-label">Projected LTV</div>
      </div>
      <div class="rv-stat-tile">
        <div class="rv-stat-value">${ltv.referralsGiven}</div>
        <div class="rv-stat-label">Referrals Given</div>
      </div>
    </div>
    <div class="rv-score-grid">
      ${[
        ['Revenue Potential',    ltv.revenueScore],
        ['Engagement Quality',   ltv.engagementScore],
        ['Growth Trajectory',    ltv.growthScore],
        ['Relationship Breadth', ltv.breadthScore],
        ['Tenure & Loyalty',     ltv.tenureScore]
      ].map(([label, score]) => {
        const sc = score >= 8 ? 'high' : score >= 6 ? 'mid' : 'low';
        return `
        <div class="rv-score-tile score-${sc}-tile">
          <div class="rv-score-num score-${sc}">${score}</div>
          <div class="rv-score-label">${label}</div>
          <div class="rv-score-bar"><div class="rv-score-bar-fill" style="width:${score * 10}%"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="panel-card">
    <div class="panel-title">Client Profile</div>
    <div class="profile-grid">
      <div class="profile-field">
        <div class="profile-field-label">Preferred Name</div>
        <div class="profile-field-value">${client.preferredName}</div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">Communication</div>
        <div class="profile-field-value">${client.preferences.communication}</div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">Interests</div>
        <div class="profile-field-value">${client.preferences.interests}</div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">Household</div>
        <div class="profile-field-value">
          ${client.household.map(h => `<div><strong>${h.name}</strong> · <span style="color:var(--text-secondary)">${h.relationship}</span></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="profile-notes">
      <div class="profile-field-label" style="margin-bottom:8px">Advisor Notes</div>
      <div class="profile-notes-body">"${client.preferences.notes}"</div>
    </div>
  </div>`;
}

// ── Touchpoints Tab ───────────────────────────────────────
function renderTouchpointsTab(client) {
  const typeColors = {
    meeting:      { bg: 'var(--primary-light)', color: 'var(--primary)' },
    phone_call:   { bg: 'var(--green-bg)',      color: 'var(--green-text)' },
    video_call:   { bg: 'var(--purple-bg)',     color: 'var(--purple-text)' },
    email:        { bg: 'var(--blue-bg)',       color: 'var(--blue-text)' },
    gift_sent:    { bg: 'var(--accent-light)',  color: 'var(--accent)' },
    event:        { bg: '#FCE7F3',              color: '#9D174D' },
    annual_review:{ bg: '#CFFAFE',              color: '#164E63' }
  };
  const sentimentColors = { positive: 'var(--green-text)', neutral: 'var(--text-muted)', negative: 'var(--red)' };

  return `
  <div class="tab-section-header">
    <div class="tab-section-title">${client.touchpoints.length} Touchpoints on Record</div>
    <button class="btn-outline-sm">+ Log Touchpoint</button>
  </div>
  <div class="panel-card" style="padding:0;overflow:hidden">
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:44px"></th>
          <th>Title</th>
          <th>Notes</th>
          <th>Sentiment</th>
          <th>Date</th>
          <th style="text-align:right">Days Ago</th>
        </tr>
      </thead>
      <tbody>
        ${client.touchpoints.map(tp => {
          const tc = typeColors[tp.type] || { bg: 'var(--primary-light)', color: 'var(--primary)' };
          const sc = sentimentColors[tp.sentiment] || 'var(--text-muted)';
          const excerpt = tp.notes.length > 80 ? tp.notes.slice(0, 80) + '…' : tp.notes;
          return `
          <tr>
            <td>
              <div class="tp-icon-cell" style="background:${tc.bg};color:${tc.color}">${touchpointIcon(tp.type)}</div>
            </td>
            <td>
              <div class="data-table-primary">${tp.title}</div>
              <div class="data-table-sub">${touchpointLabel(tp.type)}</div>
            </td>
            <td class="data-table-note">${excerpt}</td>
            <td>
              <span class="sentiment-chip" style="color:${sc}">
                <span class="sentiment-dot-sm" style="background:${sc}"></span>
                ${tp.sentiment}
              </span>
            </td>
            <td class="data-table-sub" style="white-space:nowrap">${formatDate(tp.date)}</td>
            <td class="data-table-num">${daysSince(tp.date)}d</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}

// ── Service Requests Tab ──────────────────────────────────
function renderServiceTab(client) {
  const open   = client.serviceRequests.filter(r => r.status !== 'completed');
  const closed = client.serviceRequests.filter(r => r.status === 'completed');

  const priorityColors = {
    high:   { dot: 'var(--red)',    bg: 'rgba(200,40,40,.08)',  text: 'var(--red)' },
    medium: { dot: 'var(--accent)', bg: 'rgba(184,100,20,.08)', text: 'var(--accent)' },
    low:    { dot: 'var(--blue)',   bg: 'var(--blue-bg)',       text: 'var(--blue-text)' }
  };

  function reqRow(r) {
    const od = daysSince(r.createdDate);
    const pc = priorityColors[r.priority] || priorityColors.low;
    return `
    <tr>
      <td>
        <span class="priority-dot-badge" style="background:${pc.bg};color:${pc.text}">${r.priority.toUpperCase()}</span>
      </td>
      <td>
        <div class="data-table-primary">${r.title}</div>
        <div class="data-table-note" style="margin-top:3px">${r.notes}</div>
      </td>
      <td class="data-table-sub">${r.type}</td>
      <td><span class="status-badge ${statusClass(r.status)}">${statusLabel(r.status)}</span></td>
      <td class="data-table-sub" style="white-space:nowrap">Opened ${od}d ago</td>
      <td class="data-table-sub" style="white-space:nowrap">Due ${formatDate(r.dueDate)}</td>
    </tr>`;
  }

  const allRequests = [...open, ...closed];

  return `
  <div class="tab-section-header">
    <div class="tab-section-title">${open.length} Open &nbsp;·&nbsp; ${closed.length} Completed</div>
    <button class="btn-outline-sm">+ New Request</button>
  </div>
  ${allRequests.length === 0
    ? `<div class="empty-state"><div class="empty-title">No service requests</div><div class="empty-sub">All clear — no open items</div></div>`
    : `<div class="panel-card" style="padding:0;overflow:hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:90px">Priority</th>
              <th>Request</th>
              <th>Type</th>
              <th>Status</th>
              <th>Opened</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>${allRequests.map(reqRow).join('')}</tbody>
        </table>
      </div>`}`;
}


// ── Holdings Tab ──────────────────────────────────────────
const ASSET_COLORS = {
  'US Equity':      '#0C2340',
  'Fixed Income':   '#B8923C',
  'Real Estate':    '#6B8FAF',
  'Private Equity': '#3D2B1F',
  'Hedge Fund':     '#5A6B7A',
  'Cash':           '#C8BFA8',
  'Alternatives':   '#8B7355',
  'Real Assets':    '#5A7A5A'
};
function assetColor(type) { return ASSET_COLORS[type] || '#9CA3AF'; }

function renderDonut(slices) {
  const r = 40, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;
  const paths = slices.map(s => {
    const dash   = (s.pct / 100) * circ;
    const gap    = circ - dash;
    const rotate = -90 + (cumPct / 100) * 360;
    cumPct += s.pct;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${s.color}" stroke-width="20"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      transform="rotate(${rotate.toFixed(2)}, ${cx}, ${cy})"/>`;
  });
  return `<svg viewBox="0 0 120 120" class="donut-svg" aria-hidden="true">${paths.join('')}</svg>`;
}

function renderHoldingsTab(client) {
  const totals = {};
  client.holdings.forEach(h => { totals[h.type] = (totals[h.type] || 0) + h.value; });
  const totalVal = client.holdings.reduce((s, h) => s + h.value, 0);

  const slices = Object.entries(totals).map(([type, val]) => ({
    type, val, pct: (val / totalVal) * 100, color: assetColor(type)
  })).sort((a, b) => b.pct - a.pct);

  return `
  <div class="tab-section-header">
    <div class="tab-section-title">${client.holdings.length} Positions &nbsp;·&nbsp; ${formatCurrency(totalVal)} Total</div>
  </div>

  <div class="holdings-overview">
    <div class="donut-wrap">
      ${renderDonut(slices)}
      <div class="donut-center">
        <div class="donut-center-val">${formatCurrency(totalVal)}</div>
        <div class="donut-center-label">Portfolio</div>
      </div>
    </div>
    <div class="donut-legend">
      ${slices.map(s => `
        <div class="donut-legend-row">
          <span class="donut-legend-dot" style="background:${s.color}"></span>
          <span class="donut-legend-label">${s.type}</span>
          <span class="donut-legend-pct">${s.pct.toFixed(1)}%</span>
          <span class="donut-legend-val">${formatCurrency(s.val)}</span>
        </div>`).join('')}
    </div>
  </div>

  <div class="panel-card" style="padding:0;overflow:hidden;margin-top:16px">
    <table class="data-table">
      <thead>
        <tr>
          <th>Asset</th>
          <th>Type</th>
          <th style="text-align:right">Value</th>
          <th>Allocation</th>
          <th style="text-align:right">Gain / Loss</th>
        </tr>
      </thead>
      <tbody>
        ${client.holdings.map(h => `
          <tr>
            <td>
              <div class="data-table-primary">${h.name}</div>
              ${h.ticker ? `<div class="data-table-sub">${h.ticker}</div>` : ''}
            </td>
            <td>
              <span class="asset-type-dot" style="background:${assetColor(h.type)}"></span>
              <span class="data-table-sub">${h.type}</span>
            </td>
            <td class="data-table-num">${formatCurrency(h.value)}</td>
            <td>
              <div class="alloc-bar-wrap">
                <div class="alloc-bar"><div class="alloc-fill" style="width:${Math.min(h.allocation, 100)}%;background:${assetColor(h.type)}"></div></div>
                <span class="data-table-sub">${h.allocation.toFixed(1)}%</span>
              </div>
            </td>
            <td class="data-table-num ${h.gainLossPct >= 0 ? 'gain' : 'loss'}">${h.gainLossPct >= 0 ? '+' : ''}${h.gainLossPct.toFixed(1)}%</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// ── Transactions Tab ──────────────────────────────────────
function renderTransactionsTab(client) {
  const txs = client.recentTransactions;
  const netFlow = txs.reduce((s, t) => s + (t.amount || 0), 0);

  return `
  <div class="tab-section-header">
    <div class="tab-section-title">${txs.length} Recent Transactions &nbsp;·&nbsp; Net <span class="${netFlow >= 0 ? 'gain' : 'loss'}">${formatAmount(netFlow)}</span></div>
  </div>
  <div class="panel-card" style="padding:0;overflow:hidden">
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Asset / Description</th>
          <th>Account</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${txs.map(tx => `
          <tr>
            <td class="data-table-sub" style="white-space:nowrap">${formatDate(tx.date)}</td>
            <td><span class="tx-badge ${txTypeClass(tx.type)}">${tx.type}</span></td>
            <td>
              <div class="data-table-primary">${tx.asset || '—'}</div>
              <div class="data-table-note">${tx.description}</div>
            </td>
            <td class="data-table-sub">${tx.account}</td>
            <td class="data-table-num ${tx.amount > 0 ? 'gain' : tx.amount < 0 ? 'loss' : ''}">${formatAmount(tx.amount)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// ─── MOBILE HELPERS ───────────────────────────────────────
const menuBtn = `<button class="mobile-menu-btn" data-sidebar-toggle aria-label="Menu"><span></span></button>`;

// ─── MAIN RENDER ──────────────────────────────────────────
function renderApp() {
  const sidebar = renderSidebar();
  const viewMap = {
    advisor:  renderAdvisorView,
    client:   renderClientView,
    calendar: renderCalendarView,
    tasks:    renderTasksView,
    reports:  renderReportsView
  };
  const main = (viewMap[state.view] || renderAdvisorView)();

  document.getElementById('app').innerHTML = `
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
    <div class="app-shell fade-in">
      ${sidebar}
      <div class="main-area">${main}</div>
    </div>`;

  attachEventListeners();
}

// ─── SIDEBAR TOGGLE (MOBILE) ──────────────────────────────
function setupSidebarToggle() {
  const backdrop = document.getElementById('sidebar-backdrop');
  const sidebar  = document.querySelector('.sidebar');
  if (!backdrop || !sidebar) return;

  function openSidebar()  { sidebar.classList.add('open');  backdrop.classList.add('open'); }
  function closeSidebar() { sidebar.classList.remove('open'); backdrop.classList.remove('open'); }

  document.querySelectorAll('[data-sidebar-toggle]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
  });
  backdrop.addEventListener('click', closeSidebar);

  // Close sidebar on nav item click (mobile)
  sidebar.querySelectorAll('.nav-item, .nav-back, [data-tab]').forEach(el => {
    el.addEventListener('click', () => { if (window.innerWidth <= 768) closeSidebar(); });
  });
}

// ─── EVENT LISTENERS ──────────────────────────────────────
function attachEventListeners() {
  setupSidebarToggle();
  const app = document.getElementById('app');

  app.addEventListener('click', e => {
    // Top-level nav
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn && !e.target.closest('[data-tab]')) { navigate(navBtn.getAttribute('data-nav') === 'advisor' ? '' : navBtn.getAttribute('data-nav')); return; }

    // Tasks view — click client name to open client
    if (e.target.closest('.tasks-client-link')) {
      const id = e.target.closest('.tasks-client-link').getAttribute('data-client-id');
      if (id) { navigate('client/' + id); return; }
    }

    // Back to advisor view
    if (e.target.closest('[data-back]')) { navigate(''); return; }

    // Navigate to client view (card click or View Profile button)
    const cardEl = e.target.closest('[data-client-id]');
    if (cardEl) {
      const id = cardEl.getAttribute('data-client-id');
      if (id) { navigate('client/' + id); return; }
    }

    // Tab switching
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      const tab = tabBtn.getAttribute('data-tab');
      if (tab && state.activeTab !== tab) {
        state.activeTab = tab;
        if (state.view === 'client') {
          // Re-render just the tab content and tab bar
          const tc = document.getElementById('tab-content');
          const tb = document.getElementById('tab-bar');
          const client = clients.find(c => c.id === state.clientId);
          if (tc && client) tc.innerHTML = renderTabContent(client);
          if (tb) tb.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tab);
          });
          // Also update sidebar active state
          app.querySelectorAll('.nav-item[data-tab]').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tab);
          });
        }
      }
      return;
    }

    // Tier filter
    const tierBtn = e.target.closest('[data-tier]');
    if (tierBtn) {
      state.filter.tier = tierBtn.getAttribute('data-tier');
      renderApp(); return;
    }

    // Health filter
    const healthBtn = e.target.closest('[data-health]');
    if (healthBtn) {
      state.filter.health = healthBtn.getAttribute('data-health');
      renderApp(); return;
    }
  });

  // Sort
  const sortSel = document.getElementById('sort-select');
  if (sortSel) sortSel.addEventListener('change', e => { state.sort = e.target.value; renderApp(); });

  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      state.filter.search = e.target.value;
      const filtered = getFilteredClients();
      const grid = document.querySelector('.clients-grid, .no-results');
      const countEl = document.querySelector('.filter-count');
      if (grid) grid.outerHTML = filtered.length === 0
        ? `<div class="no-results"><div class="no-results-icon"></div><div class="no-results-title">No clients match</div></div>`
        : `<div class="clients-grid">${filtered.map(renderClientCard).join('')}</div>`;
      if (countEl) countEl.textContent = filtered.length + ' of ' + clients.length + ' clients';
    });
  }
}

// ─── INIT ─────────────────────────────────────────────────
function init() {
  parseRoute();
  renderApp();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('hashchange', () => { parseRoute(); renderApp(); });
