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
      priority: 'high', icon: '🎁',
      title: urgent.description,
      sub: d === 0 ? 'Today!' : `${d} day${d !== 1 ? 's' : ''} away · ${formatDate(urgent.date)}`
    });
  }

  // Overdue contact
  if (dsc > 60) {
    actions.push({ priority: 'high', icon: '📞', title: `Reach out immediately — ${dsc} days without contact`, sub: `Last: ${client.lastTouchpoint.summary}` });
  } else if (dsc > 30) {
    actions.push({ priority: 'medium', icon: '📞', title: `Schedule a check-in call`, sub: `${dsc} days since last contact — ${client.lastTouchpoint.summary}` });
  }

  // High priority open service request
  const highReq = client.serviceRequests.find(r => r.status !== 'completed' && r.priority === 'high');
  if (highReq) {
    const od = daysSince(highReq.createdDate);
    actions.push({ priority: 'high', icon: '⚡', title: `Follow up: ${highReq.title}`, sub: `Open ${od} day${od !== 1 ? 's' : ''} · Due ${formatDate(highReq.dueDate)}` });
  }

  // Default fallback
  if (actions.length === 0) {
    actions.push({ priority: 'low', icon: '📊', title: 'Review Q2 portfolio positioning', sub: 'Relationship is in great shape — no urgent actions' });
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

  if (state.view === 'advisor') {
    return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">
          <div class="brand-logo">GC</div>
          <div class="brand-name">Gold Capital</div>
        </div>
        <div class="brand-sub">Advisor Workstation</div>
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
        <button class="nav-item active" data-nav="advisor">
          Book of Business
        </button>
        <button class="nav-item" disabled style="opacity:0.35;cursor:default">
          Calendar
        </button>
        <button class="nav-item" disabled style="opacity:0.35;cursor:default">
          Tasks
          ${openTasks > 0 ? `<span class="nav-badge">${openTasks}</span>` : ''}
        </button>
        <button class="nav-item" disabled style="opacity:0.35;cursor:default">
          Reports
        </button>
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
      <div class="brand-mark">
        <div class="brand-logo">GC</div>
        <div class="brand-name">Gold Capital</div>
      </div>
      <div class="brand-sub">Advisor Workstation</div>
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

// ─── ADVISOR VIEW ─────────────────────────────────────────
function renderAdvisorView() {
  const totalAUM   = clients.reduce((s, c) => s + c.aum, 0);
  const totalTasks = clients.reduce((s, c) => s + c.openTasks, 0);
  const avgHealth  = (clients.reduce((s, c) => s + c.healthScore, 0) / clients.length).toFixed(1);
  const upcoming   = clients.reduce((s, c) => s + c.upcomingMilestones.filter(m => daysUntil(m.date) >= 0 && daysUntil(m.date) <= 30).length, 0);

  const filtered = getFilteredClients();

  return `
  <div class="main-header">
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
            <div class="banner-meta-item">📍 ${client.location}</div>
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
            <div class="action-priority-dot ${a.priority}"></div>
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
    <div class="panel-title">Relationship Value <span style="font-weight:400;text-transform:none;font-size:11px;color:var(--text-2)">— Projected LTV: ${formatCurrency(ltv.projectedLTV)}</span></div>
    <div class="ltv-grid">
      <div class="ltv-metric"><div class="ltv-metric-value">${formatCurrency(ltv.estimatedAnnualRevenue)}</div><div class="ltv-metric-label">Annual Revenue</div></div>
      <div class="ltv-metric"><div class="ltv-metric-value">${formatCurrency(ltv.projectedLTV)}</div><div class="ltv-metric-label">Projected LTV</div></div>
      <div class="ltv-metric"><div class="ltv-metric-value">${ltv.referralsGiven}</div><div class="ltv-metric-label">Referrals Given</div></div>
    </div>
    <div class="ltv-score-bars">
      ${[
        ['Revenue Potential', ltv.revenueScore],
        ['Engagement Quality', ltv.engagementScore],
        ['Growth Trajectory', ltv.growthScore],
        ['Relationship Breadth', ltv.breadthScore],
        ['Tenure & Loyalty', ltv.tenureScore]
      ].map(([label, score]) => `
        <div class="score-bar-row">
          <span class="score-bar-label">${label}</span>
          <div class="score-bar-track"><div class="score-bar-fill" style="width:${score * 10}%"></div></div>
          <span class="score-bar-val">${score}</span>
        </div>`).join('')}
    </div>
  </div>

  <div class="panel-card">
    <div class="panel-title">Client Profile</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div class="meta-label" style="margin-bottom:4px">Preferred Name</div>
        <div style="font-size:13px;margin-bottom:12px">${client.preferredName}</div>
        <div class="meta-label" style="margin-bottom:4px">Communication</div>
        <div style="font-size:13px;margin-bottom:12px;color:var(--text-2)">${client.preferences.communication}</div>
        <div class="meta-label" style="margin-bottom:4px">Interests</div>
        <div style="font-size:13px;color:var(--text-2)">${client.preferences.interests}</div>
      </div>
      <div>
        <div class="meta-label" style="margin-bottom:4px">Household</div>
        ${client.household.map(h => `
          <div style="font-size:13px;margin-bottom:4px"><strong>${h.name}</strong> · ${h.relationship}</div>`).join('')}
        <div class="meta-label" style="margin-top:12px;margin-bottom:4px">Advisor Notes</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.5;font-style:italic">"${client.preferences.notes}"</div>
      </div>
    </div>
  </div>`;
}

// ── Touchpoints Tab ───────────────────────────────────────
function renderTouchpointsTab(client) {
  return `
  <div class="touchpoints-header">
    <div class="panel-title" style="margin:0">${client.touchpoints.length} Touchpoints on Record</div>
    <button class="btn btn-primary btn-sm">+ Log Touchpoint</button>
  </div>
  <div class="timeline">
    ${client.touchpoints.map(tp => {
      const sentimentColor = { positive: 'var(--green)', neutral: 'var(--text-2)', negative: 'var(--red)' }[tp.sentiment] || 'var(--text-2)';
      return `
      <div class="timeline-item">
        <div class="timeline-icon ${touchpointClass(tp.type)}">${touchpointIcon(tp.type)}</div>
        <div class="timeline-body">
          <div class="timeline-header">
            <div class="timeline-title">${tp.title}</div>
            <div class="timeline-date">${formatDate(tp.date)}</div>
          </div>
          <div class="timeline-notes">${tp.notes}</div>
          <div class="timeline-meta">
            <span class="tp-badge ${touchpointClass(tp.type)}">${touchpointLabel(tp.type)}</span>
            <span style="font-size:11px;color:${sentimentColor};font-weight:600">● ${tp.sentiment}</span>
            <span style="font-size:11px;color:var(--text-3)">${daysSince(tp.date)} days ago</span>
          </div>
        </div>
      </div>`; }).join('')}
  </div>`;
}

// ── Service Requests Tab ──────────────────────────────────
function renderServiceTab(client) {
  const open   = client.serviceRequests.filter(r => r.status !== 'completed');
  const closed = client.serviceRequests.filter(r => r.status === 'completed');

  function reqCard(r) {
    const od = daysSince(r.createdDate);
    return `
    <div class="request-card">
      <div class="request-priority-bar priority-${r.priority}"></div>
      <div class="request-body">
        <div class="request-top">
          <div class="request-title">${r.title}</div>
          <span class="status-badge ${statusClass(r.status)}">${statusLabel(r.status)}</span>
        </div>
        <div class="request-meta">
          <span class="request-type">${r.type}</span>
          <span class="tier-badge" style="background:var(--${r.priority==='high'?'red':r.priority==='medium'?'amber':'blue'}-bg);color:var(--${r.priority==='high'?'red':r.priority==='medium'?'amber':'blue'}-text)">${r.priority.toUpperCase()} PRIORITY</span>
        </div>
        <div class="request-notes">${r.notes}</div>
        <div class="request-footer">
          <span>Opened ${od} day${od!==1?'s':''} ago</span>
          <span>·</span>
          <span>Due ${formatDate(r.dueDate)}</span>
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="service-header">
    <div class="panel-title" style="margin:0">${open.length} Open · ${closed.length} Completed</div>
    <button class="btn btn-primary btn-sm">+ New Request</button>
  </div>
  <div class="requests-list">
    ${open.length === 0 && closed.length === 0
      ? `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">No service requests</div><div class="empty-sub">All clear — no open items</div></div>`
      : [...open, ...closed].map(reqCard).join('')}
  </div>`;
}

// ── Holdings Tab ──────────────────────────────────────────
function renderHoldingsTab(client) {
  const totals = {};
  client.holdings.forEach(h => { totals[h.type] = (totals[h.type] || 0) + h.value; });
  const totalVal = client.holdings.reduce((s, h) => s + h.value, 0);

  return `
  <div class="holdings-summary">
    ${Object.entries(totals).map(([type, val]) => `
      <div class="holding-summary-card">
        <div class="holding-type-label">${type}</div>
        <div class="holding-type-value">${formatCurrency(val)}</div>
        <div class="holding-type-pct">${((val/totalVal)*100).toFixed(1)}% of portfolio</div>
      </div>`).join('')}
  </div>
  <div class="holdings-table-wrap">
    <table>
      <thead class="table-header">
        <tr>
          <th>Asset</th>
          <th>Type</th>
          <th>Value</th>
          <th>Allocation</th>
          <th>Gain / Loss</th>
        </tr>
      </thead>
      <tbody>
        ${client.holdings.map(h => `
          <tr>
            <td>
              <div class="asset-name">${h.name}</div>
              ${h.ticker ? `<div class="asset-ticker">${h.ticker}</div>` : ''}
            </td>
            <td><span class="asset-type-badge ${assetTypeClass(h.type)}">${h.type}</span></td>
            <td><strong>${formatCurrency(h.value)}</strong></td>
            <td>
              <div class="alloc-bar-wrap">
                <div class="alloc-bar"><div class="alloc-fill" style="width:${Math.min(h.allocation, 100)}%"></div></div>
                <span>${h.allocation.toFixed(1)}%</span>
              </div>
            </td>
            <td class="${h.gainLossPct >= 0 ? 'gain' : 'loss'}">${h.gainLossPct >= 0 ? '+' : ''}${h.gainLossPct.toFixed(1)}%</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// ── Transactions Tab ──────────────────────────────────────
function renderTransactionsTab(client) {
  return `
  <div class="transactions-wrap">
    <table>
      <thead class="table-header">
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Asset / Description</th>
          <th>Account</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${client.recentTransactions.map(tx => `
          <tr>
            <td style="white-space:nowrap;color:var(--text-2)">${formatDate(tx.date)}</td>
            <td><span class="tx-type ${txTypeClass(tx.type)}">${tx.type}</span></td>
            <td>
              <div style="font-weight:600">${tx.asset || '—'}</div>
              <div style="font-size:12px;color:var(--text-2)">${tx.description}</div>
            </td>
            <td style="font-size:12px;color:var(--text-2)">${tx.account}</td>
            <td style="font-weight:600;text-align:right" class="${tx.amount > 0 ? 'gain' : tx.amount < 0 ? 'loss' : 'neutral'}">${formatAmount(tx.amount)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// ─── MAIN RENDER ──────────────────────────────────────────
function renderApp() {
  const sidebar = renderSidebar();
  const main    = state.view === 'advisor' ? renderAdvisorView() : renderClientView();

  document.getElementById('app').innerHTML = `
    <div class="app-shell fade-in">
      ${sidebar}
      <div class="main-area">${main}</div>
    </div>`;

  attachEventListeners();
}

// ─── EVENT LISTENERS ──────────────────────────────────────
function attachEventListeners() {
  const app = document.getElementById('app');

  app.addEventListener('click', e => {
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
