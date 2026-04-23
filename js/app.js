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

// Holdings drilldown state (persists within a client session)
let holdingsDrill = null;    // null | 'Equity' | 'Fixed Income' | 'Alternatives' | 'Cash'
let holdingsLevel = 'class'; // 'class' | 'strategy'
let holdingsView  = 'product'; // 'product' | 'exposure'

// ─── HOLDINGS CLASSIFICATION DATA ─────────────────────────

const L1_COLORS = {
  'Equity':       '#0C2340',
  'Fixed Income': '#B8923C',
  'Alternatives': '#6B8FAF',
  'Cash':         '#C8BFA8'
};

const L2_COLORS = {
  // Equity
  'US Large Cap Growth':            '#0C2340',
  'US Large Cap Value':             '#1E4A78',
  'US Large Cap Core':              '#2B6CB0',
  'US Broad Market':                '#3A7DBD',
  'US Dividend / Income':           '#4A90C4',
  'Concentrated / Single Stock':    '#7B1C1C',
  'International Developed Equity': '#6B8FAF',
  'Emerging Market Equity':         '#4A7A9B',
  'Global Equity':                  '#5A8FAF',
  // Fixed Income
  'Core / Aggregate Bond':          '#B8923C',
  'Investment Grade Credit':        '#C9A455',
  'Government / Agency':            '#D4B870',
  'Municipal / Tax-Exempt':         '#A07828',
  'Short Duration':                 '#DACC8A',
  'Inflation-Linked':               '#C4A050',
  'Global Fixed Income':            '#9A7830',
  // Alternatives
  'Private Equity Buyout':          '#3D2B1F',
  'Core Real Estate':               '#7A6A5A',
  'Listed Real Estate':             '#8CAFC4',
  'Macro / Hedge Fund':             '#5A6B7A',
  'Co-Investment / Family LLC':     '#4A5570',
  'Real Assets / Commodities':      '#8B7355',
  // Cash
  'Money Market':                   '#B0A898',
  'Cash & Equivalents':             '#C0B8A8',
  'Short-Term Government':          '#A8A090',
  'CDs / Bank Deposits':            '#B8B0A0',
};

// Per-holding metadata: L1 class, L2 strategy, and exposure label
const HOLDING_META = {
  // ── Client 1 — Harrington
  '1:Apple Inc.':                  { assetClass:'Equity',       strategy:'US Large Cap Growth',        exposure:'US Technology (Mega Cap)' },
  '1:Microsoft Corp.':             { assetClass:'Equity',       strategy:'US Large Cap Growth',        exposure:'US Technology (Mega Cap)' },
  '1:KKR Private Equity Fund VI':  { assetClass:'Alternatives', strategy:'Private Equity Buyout',      exposure:'Private Equity' },
  '1:Blackstone Real Estate Trust':{ assetClass:'Alternatives', strategy:'Core Real Estate',           exposure:'Private Real Estate' },
  '1:US Treasury 10Y':             { assetClass:'Fixed Income', strategy:'Government / Agency',        exposure:'US Government' },
  '1:Goldman Sachs MMF':           { assetClass:'Cash',         strategy:'Money Market',               exposure:'Liquid Cash' },
  // ── Client 2 — Whitfield
  '2:Vanguard Total Market ETF':   { assetClass:'Equity',       strategy:'US Broad Market',            exposure:'US Total Market Equity' },
  '2:Pimco Total Return Fund':     { assetClass:'Fixed Income', strategy:'Core / Aggregate Bond',      exposure:'Core Investment Grade' },
  '2:Blackstone Real Estate Trust':{ assetClass:'Alternatives', strategy:'Core Real Estate',           exposure:'Private Real Estate' },
  '2:Municipal Bond Fund':         { assetClass:'Fixed Income', strategy:'Municipal / Tax-Exempt',     exposure:'Tax-Exempt Income' },
  '2:Goldman Sachs MMF':           { assetClass:'Cash',         strategy:'Money Market',               exposure:'Liquid Cash' },
  // ── Client 3 — Morrison
  '3:Vanguard S&P 500 ETF':        { assetClass:'Equity',       strategy:'US Large Cap Core',          exposure:'US Large Cap Core' },
  '3:International Equity Fund':   { assetClass:'Equity',       strategy:'International Developed Equity', exposure:'International Developed Equity' },
  '3:Bridgewater All Weather':     { assetClass:'Alternatives', strategy:'Macro / Hedge Fund',         exposure:'Diversifying Strategy' },
  '3:Investment Grade Corp Bonds': { assetClass:'Fixed Income', strategy:'Investment Grade Credit',    exposure:'Investment Grade Credit' },
  '3:Money Market Fund':           { assetClass:'Cash',         strategy:'Money Market',               exposure:'Liquid Cash' },
  // ── Client 4 — Bancroft
  '4:BlackRock Multi-Asset Fund':  { assetClass:'Equity',       strategy:'US Large Cap Core',          exposure:'US Multi-Asset Equity' },
  '4:Vanguard Bond Index':         { assetClass:'Fixed Income', strategy:'Core / Aggregate Bond',      exposure:'Core Investment Grade' },
  '4:Cohen & Steers Real Estate':  { assetClass:'Alternatives', strategy:'Listed Real Estate',         exposure:'Public Real Estate (REITs)' },
  '4:Treasury Bills 6M':           { assetClass:'Fixed Income', strategy:'Short Duration',             exposure:'Short-Term Government' },
  '4:Cash & Equivalents':          { assetClass:'Cash',         strategy:'Cash & Equivalents',         exposure:'Liquid Cash' },
  // ── Client 5 — Augustine
  '5:Berkshire Hathaway B':        { assetClass:'Equity',       strategy:'US Large Cap Value',         exposure:'US Large Cap Value' },
  '5:Johnson & Johnson':           { assetClass:'Equity',       strategy:'US Large Cap Value',         exposure:'US Healthcare / Dividend' },
  '5:Vanguard Total Bond':         { assetClass:'Fixed Income', strategy:'Core / Aggregate Bond',      exposure:'Core Investment Grade' },
  '5:Augustine Family LLC':        { assetClass:'Alternatives', strategy:'Co-Investment / Family LLC', exposure:'Private Equity (Co-Invest)' },
  '5:Cash & T-Bills':              { assetClass:'Cash',         strategy:'Short-Term Government',      exposure:'Short-Term Government' },
  // ── Client 6 — Petrov
  '6:iShares MSCI World ETF':      { assetClass:'Equity',       strategy:'Global Equity',              exposure:'Global Developed Equity' },
  '6:Emerging Markets Fund':       { assetClass:'Equity',       strategy:'Emerging Market Equity',     exposure:'Emerging Market Equity' },
  '6:PIMCO Global Bond Fund':      { assetClass:'Fixed Income', strategy:'Global Fixed Income',        exposure:'Global Core Fixed Income' },
  '6:Gold ETF':                    { assetClass:'Alternatives', strategy:'Real Assets / Commodities',  exposure:'Gold / Real Assets' },
  '6:Cash (Multi-currency)':       { assetClass:'Cash',         strategy:'Cash & Equivalents',         exposure:'Multi-Currency Cash' },
  // ── Client 7 — Chen
  '7:Vertex Technologies Stock':   { assetClass:'Equity',       strategy:'Concentrated / Single Stock',exposure:'Employer Equity (Vertex Tech)' },
  '7:Vanguard Total Market':       { assetClass:'Equity',       strategy:'US Broad Market',            exposure:'US Total Market Equity' },
  '7:Short-Term Bond Fund':        { assetClass:'Fixed Income', strategy:'Short Duration',             exposure:'Short Duration Credit' },
  '7:California Muni Bonds':       { assetClass:'Fixed Income', strategy:'Municipal / Tax-Exempt',     exposure:'Tax-Exempt Income' },
  '7:Cash & Money Market':         { assetClass:'Cash',         strategy:'Cash & Equivalents',         exposure:'Liquid Cash' },
  // ── Client 8 — Sullivan
  '8:Vanguard Dividend Appreciation':{ assetClass:'Equity',     strategy:'US Dividend / Income',       exposure:'US Dividend Equity' },
  '8:iShares Core US Aggregate':   { assetClass:'Fixed Income', strategy:'Core / Aggregate Bond',      exposure:'Core Investment Grade' },
  '8:Vanguard REIT Index':         { assetClass:'Alternatives', strategy:'Listed Real Estate',         exposure:'Public Real Estate (REITs)' },
  '8:TIPS Fund':                   { assetClass:'Fixed Income', strategy:'Inflation-Linked',           exposure:'Inflation Protection (TIPS)' },
  '8:Cash & CDs':                  { assetClass:'Cash',         strategy:'CDs / Bank Deposits',        exposure:'CDs & Bank Deposits' },
};

function enrichHolding(clientId, h) {
  const meta = HOLDING_META[`${clientId}:${h.name}`];
  if (meta) return { ...h, ...meta };
  // Fallback: map legacy `type` to L1
  const fallbackClass = {
    'US Equity':'Equity','Fixed Income':'Fixed Income',
    'Real Estate':'Alternatives','Private Equity':'Alternatives',
    'Hedge Fund':'Alternatives','Cash':'Cash'
  }[h.type] || 'Equity';
  return { ...h, assetClass: fallbackClass, strategy: h.type, exposure: h.name };
}

// Per-client per-asset-class KPIs
const PORTFOLIO_KPIS = {
  1: {
    equity: {
      geographic:  [{ label:'US', pct:100 }],
      sectors:     [{ label:'Technology', pct:100 }],
      marketCap:   [{ label:'Mega Cap', pct:100 }],
      ytdReturn: 22.4, beta: 1.25
    },
    fixedIncome: {
      creditQuality: [{ label:'AAA — US Govt', pct:100 }],
      geographic:    [{ label:'US', pct:100 }],
      duration: 8.7, yieldToMaturity: 4.3
    },
    alternatives: {
      subTypes: [{ label:'Private Equity Buyout', pct:56 }, { label:'Core Real Estate', pct:44 }],
      netIRR: 18.4, vintageRange: '2019–2023'
    },
    cash: { yield: 5.1, instruments: [{ label:'Money Market', pct:100 }] }
  },
  2: {
    equity: {
      geographic:  [{ label:'US', pct:100 }],
      sectors:     [{ label:'Technology', pct:28 }, { label:'Healthcare', pct:14 }, { label:'Financials', pct:13 }, { label:'Industrials', pct:12 }, { label:'Other', pct:33 }],
      marketCap:   [{ label:'Large Cap', pct:72 }, { label:'Mid Cap', pct:18 }, { label:'Small Cap', pct:10 }],
      ytdReturn: 14.3, beta: 1.0
    },
    fixedIncome: {
      creditQuality: [{ label:'AAA/AA', pct:35 }, { label:'A', pct:28 }, { label:'BBB', pct:22 }, { label:'Municipal', pct:15 }],
      geographic:    [{ label:'US', pct:85 }, { label:'International', pct:15 }],
      duration: 6.2, yieldToMaturity: 3.8
    },
    alternatives: {
      subTypes: [{ label:'Core Real Estate', pct:100 }],
      netIRR: 9.4
    },
    cash: { yield: 5.1, instruments: [{ label:'Money Market', pct:100 }] }
  },
  3: {
    equity: {
      geographic:  [{ label:'US', pct:73 }, { label:'International Developed', pct:24 }, { label:'Emerging Markets', pct:3 }],
      sectors:     [{ label:'Technology', pct:29 }, { label:'Financials', pct:14 }, { label:'Healthcare', pct:13 }, { label:'Consumer Disc.', pct:11 }, { label:'Other', pct:33 }],
      marketCap:   [{ label:'Large Cap', pct:75 }, { label:'Mid Cap', pct:16 }, { label:'Small Cap', pct:9 }],
      ytdReturn: 14.8, beta: 1.05
    },
    fixedIncome: {
      creditQuality: [{ label:'A', pct:42 }, { label:'BBB', pct:58 }],
      geographic:    [{ label:'US', pct:80 }, { label:'International', pct:20 }],
      duration: 7.1, yieldToMaturity: 5.2
    },
    alternatives: {
      subTypes: [{ label:'Macro / Risk Parity', pct:100 }],
      ytdReturn: 7.8, sharpe: 1.2
    },
    cash: { yield: 5.2, instruments: [{ label:'Money Market', pct:100 }] }
  },
  4: {
    equity: {
      geographic:  [{ label:'US', pct:68 }, { label:'International', pct:32 }],
      sectors:     [{ label:'Technology', pct:22 }, { label:'Financials', pct:16 }, { label:'Healthcare', pct:15 }, { label:'Consumer Disc.', pct:14 }, { label:'Other', pct:33 }],
      marketCap:   [{ label:'Large Cap', pct:78 }, { label:'Mid Cap', pct:16 }, { label:'Small Cap', pct:6 }],
      ytdReturn: 11.2, beta: 0.95
    },
    fixedIncome: {
      creditQuality: [{ label:'AAA/AA', pct:38 }, { label:'A', pct:28 }, { label:'BBB', pct:28 }, { label:'Short Govt', pct:6 }],
      geographic:    [{ label:'US', pct:100 }],
      duration: 4.8, yieldToMaturity: 4.7
    },
    alternatives: {
      subTypes: [{ label:'Listed Real Estate (REITs)', pct:100 }],
      dividendYield: 3.8, ytdReturn: 6.8
    },
    cash: { yield: 4.9, instruments: [{ label:'Cash & Equivalents', pct:100 }] }
  },
  5: {
    equity: {
      geographic:  [{ label:'US', pct:100 }],
      sectors:     [{ label:'Financials / Conglomerate', pct:60 }, { label:'Healthcare', pct:40 }],
      marketCap:   [{ label:'Mega Cap', pct:100 }],
      ytdReturn: 15.9, dividendYield: 1.8
    },
    fixedIncome: {
      creditQuality: [{ label:'AAA/AA', pct:38 }, { label:'A', pct:28 }, { label:'BBB', pct:34 }],
      geographic:    [{ label:'US', pct:100 }],
      duration: 6.4, yieldToMaturity: 4.6
    },
    alternatives: {
      subTypes: [{ label:'Private Co-Investment', pct:100 }],
      netIRR: 12.0
    },
    cash: { yield: 5.1, instruments: [{ label:'T-Bills / Short Govt', pct:100 }] }
  },
  6: {
    equity: {
      geographic:  [{ label:'International Developed', pct:64 }, { label:'Emerging Markets', pct:36 }],
      sectors:     [{ label:'Technology', pct:24 }, { label:'Financials', pct:19 }, { label:'Consumer Disc.', pct:12 }, { label:'Healthcare', pct:10 }, { label:'Other', pct:35 }],
      marketCap:   [{ label:'Large Cap', pct:70 }, { label:'Mid Cap', pct:22 }, { label:'Small Cap', pct:8 }],
      ytdReturn: 5.8
    },
    fixedIncome: {
      creditQuality: [{ label:'AAA/AA', pct:48 }, { label:'A', pct:22 }, { label:'BBB', pct:22 }, { label:'High Yield', pct:8 }],
      geographic:    [{ label:'US', pct:42 }, { label:'Europe', pct:32 }, { label:'Asia/Pacific', pct:18 }, { label:'EM', pct:8 }],
      duration: 5.6, yieldToMaturity: 4.1
    },
    alternatives: {
      subTypes: [{ label:'Gold / Precious Metals', pct:100 }],
      ytdReturn: 18.7
    },
    cash: { yield: 4.2, instruments: [{ label:'Multi-Currency Cash', pct:100 }] }
  },
  7: {
    equity: {
      geographic:  [{ label:'US', pct:100 }],
      sectors:     [{ label:'Technology / Biotech', pct:67 }, { label:'Diversified Market', pct:33 }],
      marketCap:   [{ label:'Mega Cap', pct:67 }, { label:'Mixed Cap', pct:33 }],
      ytdReturn: 32.1, concentrationNote: 'VRTX represents 67% of equity sleeve — concentration risk'
    },
    fixedIncome: {
      creditQuality: [{ label:'AA/A Short-Dur', pct:70 }, { label:'AA Muni', pct:30 }],
      geographic:    [{ label:'US', pct:100 }],
      duration: 2.8, yieldToMaturity: 3.6
    },
    alternatives: null,
    cash: { yield: 5.0, instruments: [{ label:'Money Market', pct:100 }] }
  },
  8: {
    equity: {
      geographic:  [{ label:'US', pct:100 }],
      sectors:     [{ label:'Healthcare', pct:18 }, { label:'Financials', pct:16 }, { label:'Technology', pct:15 }, { label:'Consumer Staples', pct:14 }, { label:'Industrials', pct:12 }, { label:'Other', pct:25 }],
      marketCap:   [{ label:'Large Cap', pct:88 }, { label:'Mid Cap', pct:12 }],
      ytdReturn: 14.2, dividendYield: 1.85
    },
    fixedIncome: {
      creditQuality: [{ label:'AAA/AA (Govt/Agency)', pct:68 }, { label:'A', pct:18 }, { label:'BBB', pct:14 }],
      geographic:    [{ label:'US', pct:100 }],
      duration: 5.2, yieldToMaturity: 4.4
    },
    alternatives: {
      subTypes: [{ label:'Listed Real Estate (REITs)', pct:100 }],
      dividendYield: 3.8, ytdReturn: 8.6
    },
    cash: { yield: 5.1, instruments: [{ label:'CDs', pct:60 }, { label:'Money Market', pct:40 }] }
  }
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

// ─── CA TASK DASHBOARD DATA ───────────────────────────────

const CA_STAFF = [
  { id: 'jpark',   name: 'Jessica Park',   role: 'ACA', initials: 'JP' },
  { id: 'mtorres', name: 'Michael Torres', role: 'ACA', initials: 'MT' },
  { id: 'awells',  name: 'Amanda Wells',   role: 'CA',  initials: 'AW' },
  { id: 'lkim',    name: 'Lauren Kim',     role: 'ACA', initials: 'LK' },
  { id: 'rchen',   name: 'Robert Chen',    role: 'SCA', initials: 'RC' },
];

const CA_TASK_TYPES = {
  cash:       { label: 'Cash / Payments',        color: '#0C2340', subTypes: ['Wire Transfer','ACH','Check Request','Internal Transfer','RMD Distribution','Tax Payment','Bill Pay','Cash Raise','Cash Deployment'] },
  transfer:   { label: 'Asset Transfer',          color: '#B8923C', subTypes: ['ACAT In','ACAT Out','DTC Transfer','In-Kind Transfer','Cost Basis Transfer','Physical Certificate'] },
  account:    { label: 'Account Opening',         color: '#6B8FAF', subTypes: ['New Individual','Trust Account','IRA / Retirement','Joint Account','Sub-Account','529 Plan','Entity Account'] },
  documents:  { label: 'Document / Reporting',    color: '#5A6B7A', subTypes: ['Meeting Book','Performance Report','Tax Documents','K-1 Package','Account Statement','Capital Gains Report','Custom Report'] },
  compliance: { label: 'Compliance / Legal',      color: '#8B7355', subTypes: ['Annual Review','KYC Update','FBAR Filing','Suitability Update','Beneficiary Change','POA Update','AML Review'] },
  estate:     { label: 'Estate / Planning',       color: '#3D2B1F', subTypes: ['Trust Update','Beneficiary Change','TOD Registration','Power of Attorney','Will Coordination'] },
  general:    { label: 'General Request',         color: '#5A7A5A', subTypes: ['Client Inquiry','Research Request','Internal Coordination','Referral Processing','Other'] },
};

// Mutable task array — supports add/status-update in-session
function d(n) { const x = new Date('2026-03-27'); x.setDate(x.getDate() + n); return x.toISOString().split('T')[0]; }

let caTasks = [
  // ── Harrington (id:1) — jpark
  { id:'cat001', clientId:1, type:'documents', subType:'K-1 Package',        title:'K-1 Package — KKR & Blackstone',           assignedTo:'jpark',   priority:'high',   status:'in_progress',      createdDate:d(-8),  dueDate:d(14),  completedDate:null, estHours:3.0, actHours:null,  recurring:false, notes:'CPA deadline April 15. KKR Fund VI + Blackstone RE Trust.' },
  { id:'cat002', clientId:1, type:'transfer',  subType:'In-Kind Transfer',    title:'PE Allocation Increase — $10M',             assignedTo:'jpark',   priority:'high',   status:'pending',          createdDate:d(-3),  dueDate:d(25),  completedDate:null, estHours:4.5, actHours:null,  recurring:false, notes:'Evaluate Apollo Fund VIII and Carlyle Partners VII capital call schedule.' },
  { id:'cat003', clientId:1, type:'cash',      subType:'Wire Transfer',       title:'Quarterly Fee Debit — Q1 2026',             assignedTo:'jpark',   priority:'medium', status:'completed',        createdDate:d(-40), dueDate:d(-35), completedDate:d(-35),estHours:0.5, actHours:0.5,  recurring:true,  notes:'Auto-recurring Q1 fee. All accounts processed.' },

  // ── Whitfield (id:2) — mtorres
  { id:'cat004', clientId:2, type:'compliance',subType:'POA Update',          title:'Account Re-registration to Surviving Spouse',assignedTo:'mtorres', priority:'high',   status:'awaiting_client',  createdDate:d(-60), dueDate:d(7),   completedDate:null, estHours:2.0, actHours:1.5,  recurring:false, notes:'DocuSign sent twice. Follow up by phone — Margaret needs encouragement.' },
  { id:'cat005', clientId:2, type:'estate',    subType:'Trust Update',        title:'Trust Restructuring — Post Harold Whitfield', assignedTo:'mtorres',priority:'high',   status:'in_progress',      createdDate:d(-90), dueDate:d(14),  completedDate:null, estHours:8.0, actHours:5.0,  recurring:false, notes:'Coordinating with estate attorney Jennifer Walsh. 3 beneficiary branches.' },
  { id:'cat006', clientId:2, type:'documents', subType:'Tax Documents',       title:'2025 Annual Tax Package — Whitfield',        assignedTo:'mtorres', priority:'medium', status:'pending',          createdDate:d(-20), dueDate:d(19),  completedDate:null, estHours:1.5, actHours:null,  recurring:true,  notes:'Coordinate with CPA Patricia Moore. 1099s and K-1 included.' },
  { id:'cat007', clientId:2, type:'cash',      subType:'Internal Transfer',   'title':'Trust Distribution Reinvestment',          assignedTo:'mtorres', priority:'low',    status:'completed',        createdDate:d(-65), dueDate:d(-62), completedDate:d(-62),estHours:0.5, actHours:0.5,  recurring:false, notes:'$250K reinvestment from trust distribution proceeds.' },

  // ── Morrison (id:3) — jpark
  { id:'cat008', clientId:3, type:'account',   subType:'529 Plan',            title:"Increase 529 Contribution — Connor Morrison",assignedTo:'jpark',   priority:'medium', status:'in_progress',      createdDate:d(-10), dueDate:d(30),  completedDate:null, estHours:1.5, actHours:0.5,  recurring:false, notes:'Max contribution 2026 before Connor graduates Yale May 2026. Confirm gift tax exclusion.' },
  { id:'cat009', clientId:3, type:'documents', subType:'Meeting Book',        title:'Q1 2026 Review Book — Morrison',            assignedTo:'jpark',   priority:'medium', status:'completed',        createdDate:d(-25), dueDate:d(-18), completedDate:d(-19),estHours:2.0, actHours:1.8,  recurring:true,  notes:'Quarterly portfolio review book. Performance + positioning.' },
  { id:'cat010', clientId:3, type:'cash',      subType:'Cash Deployment',     title:'Year-End Bonus Deployment — $1M',           assignedTo:'jpark',   priority:'medium', status:'completed',        createdDate:d(-73), dueDate:d(-68), completedDate:d(-70),estHours:1.0, actHours:1.0,  recurring:false, notes:'Allocated to VOO per client instruction.' },

  // ── Bancroft (id:4) — mtorres
  { id:'cat011', clientId:4, type:'compliance',subType:'Beneficiary Change',  title:'Update Beneficiaries — Bancroft Post-Divorce', assignedTo:'mtorres',priority:'high',   status:'in_progress',      createdDate:d(-60), dueDate:d(14),  completedDate:null, estHours:2.0, actHours:0.5,  recurring:false, notes:'Forms sent twice with no response. Call Liz before birthday April 7.' },
  { id:'cat012', clientId:4, type:'documents', subType:'Tax Documents',       title:'2025 Split-Year Tax Docs — Post-Divorce',    assignedTo:'mtorres', priority:'high',   status:'awaiting_client',  createdDate:d(-25), dueDate:d(19),  completedDate:null, estHours:2.5, actHours:1.0,  recurring:false, notes:'Need documents from divorce attorney. CPA needs split-year treatment.' },
  { id:'cat013', clientId:4, type:'account',   subType:'New Individual',      title:'Transfer Joint Brokerage to Individual',     assignedTo:'mtorres', priority:'medium', status:'in_progress',      createdDate:d(-40), dueDate:d(21),  completedDate:null, estHours:3.0, actHours:1.5,  recurring:false, notes:'Remaining joint accounts from divorce settlement. DTCC transfer in process.' },
  { id:'cat014', clientId:4, type:'estate',    subType:'Will Coordination',   title:'Draft New Will & POA — Bancroft',            assignedTo:'lkim',    priority:'high',   status:'pending',          createdDate:d(-30), dueDate:d(30),  completedDate:null, estHours:1.0, actHours:null,  recurring:false, notes:'Existing will names William. Urgent — refer to estate attorney.' },

  // ── Augustine (id:5) — awells
  { id:'cat015', clientId:5, type:'estate',    subType:'Beneficiary Change',  title:'Add Grandson Henry to Family Trust',         assignedTo:'awells',  priority:'low',    status:'in_progress',      createdDate:d(-20), dueDate:d(45),  completedDate:null, estHours:1.5, actHours:0.5,  recurring:false, notes:'Henry Augustine, newborn. Adding as trust beneficiary.' },
  { id:'cat016', clientId:5, type:'documents', subType:'Meeting Book',        title:'Annual Review Book — Augustine 2026',        assignedTo:'awells',  priority:'medium', status:'completed',        createdDate:d(-45), dueDate:d(-40), completedDate:d(-41),estHours:2.5, actHours:2.0,  recurring:true,  notes:'Full annual review package. Performance + estate update.' },
  { id:'cat017', clientId:5, type:'cash',      subType:'RMD Distribution',    title:'Annual Contribution — Augustine Trust',      assignedTo:'awells',  priority:'low',    status:'completed',        createdDate:d(-115),dueDate:d(-112),completedDate:d(-113),estHours:0.5,actHours:0.5, recurring:true,  notes:'$500K annual contribution per trust instructions.' },

  // ── Petrov (id:6) — mtorres
  { id:'cat018', clientId:6, type:'compliance',subType:'FBAR Filing',         title:'FBAR Annual Filing — Petrov 2025',           assignedTo:'mtorres', priority:'high',   status:'awaiting_client',  createdDate:d(-45), dueDate:d(14),  completedDate:null, estHours:2.0, actHours:0.5,  recurring:true,  notes:'Foreign account reporting. Client unresponsive. Deadline approaching.' },
  { id:'cat019', clientId:6, type:'compliance',subType:'Annual Review',       title:'Annual Review — Petrov OVERDUE',             assignedTo:'mtorres', priority:'high',   status:'pending',          createdDate:d(-30), dueDate:d(-1),  completedDate:null, estHours:2.0, actHours:null,  recurring:false, notes:'Last proper review March 2025. Multiple attempts unanswered.' },
  { id:'cat020', clientId:6, type:'documents', subType:'Tax Documents',       title:'2025 Tax Package — Petrov',                  assignedTo:'lkim',    priority:'medium', status:'pending',          createdDate:d(-25), dueDate:d(19),  completedDate:null, estHours:1.0, actHours:null,  recurring:true,  notes:'Client unresponsive. Send via email and certified mail.' },

  // ── Chen (id:7) — awells
  { id:'cat021', clientId:7, type:'transfer',  subType:'In-Kind Transfer',    title:'RSU Vest Diversification — $2.1M Proceeds',  assignedTo:'awells',  priority:'high',   status:'in_progress',      createdDate:d(-5),  dueDate:d(22),  completedDate:null, estHours:4.0, actHours:1.5,  recurring:false, notes:'Reduce VRTX concentration to <40%. Present allocation options by April 10.' },
  { id:'cat022', clientId:7, type:'cash',      subType:'Tax Payment',         title:'CA Estimated Tax Payment Q1 — Chen',        assignedTo:'awells',  priority:'high',   status:'completed',        createdDate:d(-35), dueDate:d(-31), completedDate:d(-31),estHours:0.5, actHours:0.5,  recurring:true,  notes:'Q1 2026 CA state estimated tax payment. Filed on time.' },
  { id:'cat023', clientId:7, type:'documents', subType:'Custom Report',       title:'Equity Compensation Planning Guide — Chen',  assignedTo:'awells',  priority:'low',    status:'completed',        createdDate:d(-85), dueDate:d(-80), completedDate:d(-81),estHours:3.0, actHours:2.5,  recurring:false, notes:'ISO vs RSU tax treatment custom report. Forwarded to CPA.' },

  // ── Sullivan (id:8) — awells
  { id:'cat024', clientId:8, type:'cash',      subType:'RMD Distribution',    title:'2026 RMD Strategy — Sullivan IRA',           assignedTo:'awells',  priority:'medium', status:'completed',        createdDate:d(-110),dueDate:d(-105),completedDate:d(-106),estHours:1.0,actHours:1.0, recurring:true,  notes:'QCD to Scottsdale Food Bank included. $12K/mo distribution setup.' },
  { id:'cat025', clientId:8, type:'documents', subType:'Meeting Book',        title:'Annual Review Book — Sullivan 2026',         assignedTo:'awells',  priority:'medium', status:'completed',        createdDate:d(-50), dueDate:d(-45), completedDate:d(-46),estHours:2.0, actHours:1.5,  recurring:true,  notes:'In-person Scottsdale meeting. Income goals met.' },
  { id:'cat026', clientId:8, type:'cash',      subType:'ACH',                 title:'Monthly Income Distribution — Sullivan',     assignedTo:'awells',  priority:'medium', status:'in_progress',      createdDate:d(-2),  dueDate:d(3),   completedDate:null, estHours:0.5, actHours:null,  recurring:true,  notes:'$12,000/month to Sullivan Joint checking. Recurring monthly.' },

  // ── Cross-client / general
  { id:'cat027', clientId:1, type:'documents', subType:'Performance Report',  title:'Q1 2026 Performance Attribution — Harrington',assignedTo:'jpark',  priority:'medium', status:'pending',          createdDate:d(-3),  dueDate:d(10),  completedDate:null, estHours:2.0, actHours:null,  recurring:true,  notes:'Detailed attribution vs benchmark. Include tech commentary.' },
  { id:'cat028', clientId:2, type:'cash',      subType:'Cash Raise',          title:'Raise Cash for Estate Legal Fees — Whitfield',assignedTo:'mtorres',priority:'high',   status:'pending',          createdDate:d(-1),  dueDate:d(7),   completedDate:null, estHours:1.0, actHours:null,  recurring:false, notes:'~$50K needed for estate attorney retainer. Source from MMF.' },
  { id:'cat029', clientId:3, type:'general',   subType:'Client Inquiry',      title:"Connor Graduation Gift Research",            assignedTo:'jpark',   priority:'low',    status:'pending',          createdDate:d(-5),  dueDate:d(30),  completedDate:null, estHours:1.0, actHours:null,  recurring:false, notes:'Research premium Yale-themed gift options. Sarah asked for ideas.' },
  { id:'cat030', clientId:5, type:'cash',      subType:'Wire Transfer',       title:'Christening Gift Wire — Henry Augustine',    assignedTo:'awells',  priority:'medium', status:'pending',          createdDate:d(-1),  dueDate:d(20),  completedDate:null, estHours:0.5, actHours:null,  recurring:false, notes:'Tom requested a gift wire for newborn Henry. Confirm amount and destination.' },
];

let caTasksNextId = 31;

// ─── CLIENT MESSAGES (Inbox / Doc Intake) ─────────────────
const clientMessages = [
  { id:'msg001', clientId:1, type:'message',  subject:'Q1 Performance — Tech Allocation Question',
    body:'Hi Jonathan,\n\nI reviewed the Q1 statement and had a few questions about our tech weighting. The Apple and Microsoft positions seem to have lagged the index — are we still comfortable with the concentration? Should we be thinking about trimming into strength before summer?\n\nAlso, Sarah and I will be in NYC next month and would love to schedule a sit-down if your calendar allows.',
    date:'2026-04-20', read:false, priority:'normal', status:'unread', attachments:[], tags:['portfolio','review'] },

  { id:'msg002', clientId:4, type:'document', subject:'Uploaded: Divorce Settlement Agreement (Final)',
    body:'Jonathan —\n\nMy attorney finally sent over the finalized settlement documents. Uploading here for your records. We really need to talk through the account restructuring implications as soon as possible. Elizabeth is being difficult about the joint brokerage timeline and my attorney says we need to move faster.\n\nPlease review and call me when you can.',
    date:'2026-04-19', read:false, priority:'urgent', status:'unread',
    attachments:[{ name:'Settlement_Agreement_Final.pdf', size:'3.2 MB', category:'Legal' },{ name:'Asset_Division_Schedule.pdf', size:'1.1 MB', category:'Legal' }], tags:['legal','divorce','urgent'] },

  { id:'msg003', clientId:6, type:'document', subject:'FBAR Supporting Documents — UBS + CS Accounts',
    body:'Uploading the foreign account statements you requested for the FBAR filing. Both accounts are included. Please note the Credit Suisse account was closed in November per our earlier conversation.\n\nI will be in Geneva through May 5th — please email if you need anything further.',
    date:'2026-04-18', read:false, priority:'urgent', status:'unread',
    attachments:[{ name:'UBS_Account_Statement_2025.pdf', size:'2.8 MB', category:'Tax' },{ name:'Credit_Suisse_Closure_Confirmation.pdf', size:'0.9 MB', category:'Tax' }], tags:['compliance','FBAR','urgent'] },

  { id:'msg004', clientId:7, type:'message',  subject:'RSU Vest — Tax Strategy Before I Sell',
    body:'Jonathan,\n\nThe April 15th vest hit — 3,200 shares of VRTX at $412/share. My broker is saying I should sell immediately for tax simplicity but I want your view before doing anything.\n\nWhat was the 60-day hold strategy you mentioned last quarter? And can you send an updated portfolio summary over to my CPA? He has been asking for it for two weeks.',
    date:'2026-04-17', read:true, priority:'normal', status:'read', attachments:[], tags:['RSU','tax','equity'] },

  { id:'msg005', clientId:3, type:'message',  subject:"Connor's Graduation — 529 and New Account Questions",
    body:"Hi Jonathan, Sarah Morrison here.\n\nConnor's Yale graduation is May 18th and we are finalizing everything. Two quick questions:\n\n1) Is it too late to increase the 529 contribution for 2026 before the deadline? You mentioned the annual gift tax exclusion last time and I want to make sure we max it out.\n\n2) Connor is asking about opening his own investment account — he is very interested in tech stocks. Is that something Gold Capital handles for young adults just starting out?",
    date:'2026-04-16', read:true, priority:'normal', status:'replied', attachments:[], tags:['529','family','new-account'] },

  { id:'msg006', clientId:5, type:'document', subject:'Henry Augustine — Birth Certificate & SSN Letter',
    body:"Tom here.\n\nFinally got Henry's official documents sorted — attaching the birth certificate and the Social Security Administration letter. Per our last call, please begin the process to add him to the family trust as a beneficiary.\n\nMargaret and I are absolutely over the moon. Thank you for your continued help navigating all of this!",
    date:'2026-04-15', read:true, priority:'normal', status:'task_created',
    attachments:[{ name:'Henry_Augustine_Birth_Certificate.pdf', size:'0.4 MB', category:'Estate' },{ name:'SSA_Letter_Henry_Augustine.pdf', size:'0.2 MB', category:'Estate' }], tags:['estate','trust','beneficiary'] },

  { id:'msg007', clientId:2, type:'message',  subject:"Estate Planning — Attorney Referral Needed Urgently",
    body:"Jonathan,\n\nFollowing up on our last call. Eleanor's health situation has made the estate restructuring quite urgent — we need to move faster than originally planned. Do you have a referral for a good estate attorney, preferably one who knows both Arizona and California implications?\n\nWe would like to get documents updated within the next 60 days if at all possible.",
    date:'2026-04-14', read:true, priority:'normal', status:'read', attachments:[], tags:['estate','referral'] },

  { id:'msg008', clientId:8, type:'message',  subject:'April Income Distribution — Confirm Receipt',
    body:'Jonathan,\n\nJust making sure you received my note last week about the April distribution. The $12,000 should hit our joint checking by the 5th per the usual schedule.\n\nSeparately, Dorothy has been asking about a gifting strategy for the grandchildren — specifically whether we should be using 529s or direct gifts. Can we add that to our next call agenda?',
    date:'2026-04-13', read:true, priority:'normal', status:'archived', attachments:[], tags:['distribution','income','gifting'] },
];
let msgNextId = 9;

function updateMessage(id, changes) {
  const m = clientMessages.find(x => x.id === id);
  if (m) Object.assign(m, changes);
}

let opsView = 'action';
let reportsTab = 'overview';
let opsFilters = { assignee: 'all', status: 'all' };
let opsSelectedTask = null;
let showNewTaskModal = false;
let newTaskDraft = { clientId: '', type: 'cash', subType: '', title: '', assignedTo: '', priority: 'medium', dueDate: '', estHours: '', recurring: false, notes: '' };
let inboxFilter = 'all'; // 'all' | 'unread' | 'documents' | 'urgent'
let inboxSelectedId = null;
let notifPanelOpen = false;

// ─── ANNOUNCEMENTS ────────────────────────────────────────
// type: 'info' | 'warning' | 'success' | 'alert'
// expires: ISO date string — banner auto-hides after this date
const ANNOUNCEMENTS = [
  {
    id: 'mkt-good-friday-2026',
    type: 'warning',
    message: 'Markets are closed Friday, April 18 for Good Friday observance. Plan client orders accordingly.',
    cta: null,
    expires: '2026-04-19'
  },
  {
    id: 'feature-inbox-v1',
    type: 'info',
    message: 'New: Client Inbox & Document Intake is now live — clients can send messages and upload documents directly.',
    cta: { label: 'Open Inbox', route: 'inbox' },
    expires: null
  },
  {
    id: 'q1-reviews-due',
    type: 'success',
    message: 'Q1 portfolio review season is underway. 3 clients have not yet had their annual review.',
    cta: { label: 'View Tasks', route: 'tasks' },
    expires: '2026-05-01'
  }
];

function getDismissedBanners() {
  try { return JSON.parse(localStorage.getItem('gc_dismissed_banners') || '[]'); }
  catch { return []; }
}

function dismissBanner(id) {
  const list = getDismissedBanners();
  if (!list.includes(id)) list.push(id);
  localStorage.setItem('gc_dismissed_banners', JSON.stringify(list));
}

function getActiveBanner() {
  const dismissed = getDismissedBanners();
  return ANNOUNCEMENTS.find(a =>
    !dismissed.includes(a.id) &&
    (!a.expires || TODAY <= a.expires)
  ) || null;
}

// ─── ROUTER ───────────────────────────────────────────────
function parseRoute() {
  const hash = window.location.hash || '#/';
  const parts = hash.replace('#/', '').split('/');
  if (parts[0] === 'client' && parts[1]) {
    state.view = 'client';
    state.clientId = parseInt(parts[1]);
    state.activeTab = 'overview';
  } else if (['calendar', 'tasks', 'reports', 'operations', 'inbox'].includes(parts[0])) {
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
// ─── HEADER END (bell + avatar — shared across all views) ─
function headerEnd() {
  const unread = clientMessages.filter(m => !m.read).length;
  const BELL = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.5 2a4.5 4.5 0 0 1 4.5 4.5V9l1.5 2.5h-12L4 9V6.5A4.5 4.5 0 0 1 8.5 2z"/>
    <path d="M6.5 11.5a2 2 0 0 0 4 0"/>
  </svg>`;
  return `<button class="notif-bell${unread > 0 ? ' has-unread' : ''}" data-notif-toggle title="Inbox (${unread} unread)">
    ${BELL}
    ${unread > 0 ? `<span class="notif-bell-badge">${unread}</span>` : ''}
  </button>
  <div class="header-avatar" title="${advisor.name}">${advisor.initials}</div>`;
}

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
        <button class="nav-item ${state.view==='advisor'?'active':''}" data-nav="advisor">
          <span class="nav-icon">${NAV_ICONS.advisor}</span>Book of Business
        </button>
        <button class="nav-item ${state.view==='calendar'?'active':''}" data-nav="calendar">
          <span class="nav-icon">${NAV_ICONS.calendar}</span>Calendar
        </button>
        <button class="nav-item ${state.view==='tasks'?'active':''}" data-nav="tasks">
          <span class="nav-icon">${NAV_ICONS.tasks}</span>Tasks
          ${openTasks > 0 ? `<span class="nav-badge">${openTasks}</span>` : ''}
        </button>
        <button class="nav-item ${state.view==='inbox'?'active':''}" data-nav="inbox">
          <span class="nav-icon">${NAV_ICONS.inbox}</span>Inbox
          ${clientMessages.filter(m=>!m.read).length > 0 ? `<span class="nav-badge nav-badge--gold">${clientMessages.filter(m=>!m.read).length}</span>` : ''}
        </button>
        <button class="nav-item ${state.view==='reports'?'active':''}" data-nav="reports">
          <span class="nav-icon">${NAV_ICONS.reports}</span>Reports
        </button>
        <div class="nav-label" style="margin-top:12px">Operations</div>
        <button class="nav-item ${state.view==='operations'?'active':''}" data-nav="operations">
          <span class="nav-icon">${NAV_ICONS.operations}</span>CA Task Dashboard
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
        <button class="sidebar-ann-reset" data-reset-banners title="Reset dismissed announcements">↺ Announcements</button>
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
    ${headerEnd()}
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
    ${headerEnd()}
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

// ── Report helpers ────────────────────────────────────────
function rScoreColor(s) { return s >= 8 ? '#2D7A2D' : s >= 6.5 ? '#B8923C' : '#C0392B'; }
function rScoreBg(s)    { return s >= 8 ? '#EDF7ED' : s >= 6.5 ? '#FDF6EC' : '#FDF0EE'; }
function rScoreChip(s, title='') {
  return `<span class="r-score-chip" style="background:${rScoreBg(s)};color:${rScoreColor(s)}" title="${title}">${(+s).toFixed(1)}</span>`;
}
function rBar(pct, color='var(--primary)') {
  return `<div class="r-bar-track"><div class="r-bar-fill" style="width:${Math.min(pct,100).toFixed(1)}%;background:${color}"></div></div>`;
}
function rInsight(label, value, sub='', color='var(--primary)') {
  return `<div class="r-insight-card">
    <div class="r-ic-label">${label}</div>
    <div class="r-ic-value" style="color:${color}">${value}</div>
    ${sub ? `<div class="r-ic-sub">${sub}</div>` : ''}
  </div>`;
}

// ── SVG visualization helpers ─────────────────────────────

function miniRing(score, size = 44) {
  const r = (size / 2) - 4.5;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (score / 10);
  const color = score >= 7.5 ? '#1E7A52' : score >= 5.5 ? '#A87020' : '#A83228';
  const track = score >= 7.5 ? '#C0E8D2' : score >= 5.5 ? '#F0DDBA' : '#F0C8C4';
  return `<svg class="mini-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-label="Health ${score}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${track}" stroke-width="3.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="3.5"
      stroke-dasharray="${filled.toFixed(1)} ${circ.toFixed(1)}" stroke-linecap="round"
      transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy + 0.5}" dominant-baseline="middle" text-anchor="middle"
      font-size="11" font-weight="700" fill="${color}" font-family="-apple-system,BlinkMacSystemFont,sans-serif">${score.toFixed(1)}</text>
  </svg>`;
}

function svgBarH(pct, color = '#0C2340', w = 100, h = 5) {
  const filled = Math.max(2, Math.min(pct, 100) * w / 100);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;flex-shrink:0">
    <rect width="${w}" height="${h}" rx="${h / 2}" fill="#E0D8CC"/>
    <rect width="${filled.toFixed(1)}" height="${h}" rx="${h / 2}" fill="${color}"/>
  </svg>`;
}

function svgDonutSegments(slices, size = 80, strokeW = 10) {
  const r = (size / 2) - strokeW;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return '';
  let offset = 0;
  const paths = slices.map(sl => {
    const pct = sl.value / total;
    const dash = circ * pct - 1.5;
    const path = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${sl.color}" stroke-width="${strokeW}"
      stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}" stroke-dashoffset="${(-offset * circ + circ * 0.25).toFixed(1)}"
      stroke-linecap="butt"/>`;
    offset += pct;
    return path;
  });
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="svg-donut-mini">${paths.join('')}</svg>`;
}

// NAV ICONS
const NAV_ICONS = {
  advisor: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="1" width="5" height="5" rx=".8"/><rect x="8" y="1" width="5" height="5" rx=".8"/>
    <rect x="1" y="8" width="5" height="5" rx=".8"/><rect x="8" y="8" width="5" height="5" rx=".8"/>
  </svg>`,
  calendar: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5"/>
    <line x1="1.5" y1="5.5" x2="12.5" y2="5.5"/>
    <line x1="4.5" y1="1" x2="4.5" y2="4"/><line x1="9.5" y1="1" x2="9.5" y2="4"/>
    <circle cx="4.5" cy="8.5" r=".6" fill="currentColor"/><circle cx="7" cy="8.5" r=".6" fill="currentColor"/>
    <circle cx="9.5" cy="8.5" r=".6" fill="currentColor"/><circle cx="4.5" cy="11" r=".6" fill="currentColor"/>
    <circle cx="7" cy="11" r=".6" fill="currentColor"/>
  </svg>`,
  tasks: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="1.5,3.5 3.5,5.5 6.5,2"/><line x1="8.5" y1="3.5" x2="12.5" y2="3.5"/>
    <polyline points="1.5,7.5 3.5,9.5 6.5,6"/><line x1="8.5" y1="7.5" x2="12.5" y2="7.5"/>
    <polyline points="1.5,11.5 3.5,13.5 6.5,10"/><line x1="8.5" y1="11.5" x2="12.5" y2="11.5"/>
  </svg>`,
  reports: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="1.5" y1="12.5" x2="12.5" y2="12.5"/>
    <rect x="1.5" y="7.5" width="2.5" height="5" rx=".4"/><rect x="5.75" y="4.5" width="2.5" height="8" rx=".4"/>
    <rect x="10" y="1.5" width="2.5" height="11" rx=".4"/>
  </svg>`,
  operations: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="7" cy="7" r="2.2"/>
    <line x1="7" y1="1.5" x2="7" y2="3.3"/><line x1="7" y1="10.7" x2="7" y2="12.5"/>
    <line x1="1.5" y1="7" x2="3.3" y2="7"/><line x1="10.7" y1="7" x2="12.5" y2="7"/>
    <line x1="3" y1="3" x2="4.3" y2="4.3"/><line x1="9.7" y1="9.7" x2="11" y2="11"/>
    <line x1="11" y1="3" x2="9.7" y2="4.3"/><line x1="4.3" y1="9.7" x2="3" y2="11"/>
  </svg>`,
  inbox: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="1.5" width="11" height="11" rx="1.5"/>
    <polyline points="1.5,8.5 4.5,8.5 5.5,10.5 8.5,10.5 9.5,8.5 12.5,8.5"/>
    <line x1="4" y1="4.5" x2="10" y2="4.5"/><line x1="4" y1="6.5" x2="8" y2="6.5"/>
  </svg>`
};

function renderReportsView() {
  const subNav = `
  <div class="reports-sub-nav">
    <button class="rsn-btn${reportsTab==='overview'?' active':''}"      data-report-tab="overview">Overview</button>
    <button class="rsn-btn${reportsTab==='relationship'?' active':''}"  data-report-tab="relationship">Relationship Value</button>
    <button class="rsn-btn${reportsTab==='engagement'?' active':''}"    data-report-tab="engagement">Engagement</button>
    <button class="rsn-btn${reportsTab==='profitability'?' active':''}" data-report-tab="profitability">Profitability</button>
    <button class="rsn-btn${reportsTab==='staffing'?' active':''}"      data-report-tab="staffing">Staffing &amp; Capacity</button>
  </div>`;

  const tabFns = {
    overview:      renderRptOverview,
    relationship:  renderRptRelationship,
    engagement:    renderRptEngagement,
    profitability: renderRptProfitability,
    staffing:      renderRptStaffing
  };
  const content = (tabFns[reportsTab] || renderRptOverview)();

  return `
  <div class="main-header">
    ${menuBtn}
    <div class="header-title">Reports</div>
    <div class="header-spacer"></div>
    ${headerEnd()}
  </div>
  <div class="main-content">
    ${subNav}
    ${content}
  </div>`;
}

// ── Tab 1: Overview ───────────────────────────────────────
function renderRptOverview() {
  const totalAUM  = clients.reduce((s, c) => s + c.aum, 0);
  const totalRev  = clients.reduce((s, c) => s + c.ltvMetrics.estimatedAnnualRevenue, 0);
  const totalLTV  = clients.reduce((s, c) => s + c.ltvMetrics.projectedLTV, 0);
  const totalRefs = clients.reduce((s, c) => s + c.ltvMetrics.referralsGiven, 0);
  const avgHealth = (clients.reduce((s, c) => s + c.healthScore, 0) / clients.length).toFixed(1);

  // Revenue concentration
  const sorted = [...clients].sort((a,b) => b.ltvMetrics.estimatedAnnualRevenue - a.ltvMetrics.estimatedAnnualRevenue);
  const top2Rev = sorted.slice(0,2).reduce((s,c) => s + c.ltvMetrics.estimatedAnnualRevenue, 0);
  const concPct = ((top2Rev / totalRev) * 100).toFixed(0);

  // LTV at-risk (at-risk clients)
  const atRisk = clients.filter(c => c.healthLabel === 'At Risk');
  const ltvAtRisk = atRisk.reduce((s,c) => s + c.ltvMetrics.projectedLTV, 0);

  const byTier = ['platinum','gold','silver'].map(tier => {
    const grp = clients.filter(c => c.tier === tier);
    return { tier, count: grp.length,
      aum: grp.reduce((s,c) => s+c.aum, 0),
      rev: grp.reduce((s,c) => s+c.ltvMetrics.estimatedAnnualRevenue, 0),
      avgHealth: grp.length ? (grp.reduce((s,c) => s+c.healthScore,0)/grp.length).toFixed(1) : '—' };
  });

  const byHealth = ['Thriving','Nurture','At Risk'].map(l => ({
    label: l, cls: l==='Thriving'?'health-thriving':l==='Nurture'?'health-nurture':'health-at-risk',
    count: clients.filter(c => c.healthLabel === l).length
  }));

  const tpLast30 = clients.reduce((s,c) => s + c.touchpoints.filter(tp => daysSince(tp.date) <= 30).length, 0);
  const avgContact = Math.round(clients.reduce((s,c) => s+daysSince(c.lastTouchpoint.date),0)/clients.length);
  const overdueContact = clients.filter(c => daysSince(c.lastTouchpoint.date) > 60).length;

  return `
  <div class="r-alert-row">
    <div class="r-alert-chip r-alert-warn">⚠ Revenue concentration: top 2 clients = ${concPct}% of annual revenue</div>
    ${ltvAtRisk > 0 ? `<div class="r-alert-chip r-alert-risk">⚠ ${formatCurrency(ltvAtRisk)} projected LTV at-risk (${atRisk.length} client${atRisk.length!==1?'s':''})</div>` : ''}
    ${overdueContact > 0 ? `<div class="r-alert-chip r-alert-info">${overdueContact} client${overdueContact!==1?'s':''} overdue for contact (&gt;60 days)</div>` : ''}
  </div>

  <div class="stats-bar">
    <div class="stat-card"><div class="stat-label">Total AUM</div><div class="stat-value">${formatCurrency(totalAUM)}</div><div class="stat-sub">${clients.length} relationships</div></div>
    <div class="stat-card"><div class="stat-label">Annual Revenue</div><div class="stat-value">${formatCurrency(totalRev)}</div><div class="stat-sub">${((totalRev/totalAUM)*100).toFixed(2)}% blended fee</div></div>
    <div class="stat-card"><div class="stat-label">Projected LTV</div><div class="stat-value">${formatCurrency(totalLTV)}</div><div class="stat-sub">${totalRefs} referrals given</div></div>
    <div class="stat-card"><div class="stat-label">Avg Health Score</div><div class="stat-value">${avgHealth}<span style="font-size:14px;font-weight:400;color:var(--text-muted)">/10</span></div><div class="stat-sub">across ${clients.length} clients</div></div>
  </div>

  <div class="reports-grid">
    <div class="panel-card">
      <div class="panel-title">AUM &amp; Revenue by Tier</div>
      <table class="data-table">
        <thead><tr><th>Tier</th><th>Clients</th><th style="text-align:right">AUM</th><th style="text-align:right">Revenue</th><th style="text-align:right">Avg Health</th></tr></thead>
        <tbody>${byTier.map(r => `
          <tr>
            <td><span class="tier-badge ${tierClass(r.tier)}">${tierLabel(r.tier)}</span></td>
            <td class="data-table-sub">${r.count}</td>
            <td class="data-table-num">${formatCurrency(r.aum)}</td>
            <td class="data-table-num">${formatCurrency(r.rev)}</td>
            <td class="data-table-num">${rScoreChip(r.avgHealth)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="panel-card">
      <div class="panel-title">Health Distribution</div>
      ${byHealth.map(h => `
      <div class="report-health-row">
        <span class="health-label-badge ${h.cls}">${h.label}</span>
        <div class="report-bar-track"><div class="report-bar-fill ${h.cls}" style="width:${(h.count/clients.length*100).toFixed(0)}%"></div></div>
        <span class="data-table-num" style="min-width:20px">${h.count}</span>
      </div>`).join('')}
      <div class="panel-title" style="margin-top:20px">Engagement</div>
      <div class="report-stat-row"><span class="data-table-sub">Touchpoints (last 30 days)</span><span class="data-table-primary">${tpLast30}</span></div>
      <div class="report-stat-row"><span class="data-table-sub">Avg days since last contact</span><span class="data-table-primary">${avgContact}d</span></div>
      <div class="report-stat-row"><span class="data-table-sub">Overdue for contact (&gt;60d)</span><span class="data-table-primary ${overdueContact>0?'loss':''}">${overdueContact}</span></div>
    </div>
  </div>

  <div class="panel-card" style="margin-top:16px;padding:0;overflow:hidden">
    <div style="padding:16px 20px 8px"><div class="panel-title" style="margin:0">Client Summary</div></div>
    <table class="data-table">
      <thead><tr><th>Client</th><th>Tier</th><th style="text-align:right">AUM</th><th style="text-align:right">Revenue</th><th style="text-align:right">LTV</th><th>Health</th><th style="text-align:right">Last Contact</th></tr></thead>
      <tbody>${sorted.map(c => `
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
  </div>`;
}

// ── Tab 2: Relationship Value ─────────────────────────────
function renderRptRelationship() {
  const dims = [
    { key: 'revenueScore',    label: 'Revenue',    tip: 'Fee rate × AUM productivity vs. potential' },
    { key: 'engagementScore', label: 'Engagement', tip: 'Touchpoint frequency, recency, and quality' },
    { key: 'growthScore',     label: 'Growth',     tip: 'AUM growth rate and upsell trajectory' },
    { key: 'breadthScore',    label: 'Breadth',    tip: 'Share of wallet — services used vs. available' },
    { key: 'tenureScore',     label: 'Tenure',     tip: 'Loyalty and relationship longevity' },
  ];

  // Book averages
  const bookAvg = {};
  dims.forEach(d => {
    bookAvg[d.key] = (clients.reduce((s,c) => s + c.ltvMetrics[d.key], 0) / clients.length);
  });

  // Composite per client (simple average of 5 dims)
  const withComposite = clients.map(c => ({
    ...c,
    composite: dims.reduce((s,d) => s + c.ltvMetrics[d.key], 0) / dims.length
  })).sort((a,b) => b.composite - a.composite);

  // Wallet share gap: clients with breadth < 6.5
  const walletGaps = clients.filter(c => c.ltvMetrics.breadthScore < 6.5)
    .sort((a,b) => a.ltvMetrics.breadthScore - b.ltvMetrics.breadthScore);

  // Growth leaders
  const growthLeaders = [...clients].sort((a,b) => b.ltvMetrics.growthScore - a.ltvMetrics.growthScore).slice(0,3);

  // Risk flags: any dim < 5
  const riskClients = clients.filter(c => dims.some(d => c.ltvMetrics[d.key] < 5));

  return `
  <div class="r-insights-row">
    ${dims.map(d => {
      const avg = bookAvg[d.key];
      const best = clients.reduce((a,b) => a.ltvMetrics[d.key] > b.ltvMetrics[d.key] ? a : b);
      return rInsight(`Avg ${d.label}`, avg.toFixed(1)+'/10',
        `Best: ${best.displayName.split(' ')[1]} (${best.ltvMetrics[d.key]})`,
        rScoreColor(avg));
    }).join('')}
  </div>

  <div class="panel-card" style="margin-top:16px;padding:0;overflow:hidden">
    <div style="padding:14px 20px 8px"><div class="panel-title" style="margin:0">Relationship Score Matrix</div></div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Client</th>
          ${dims.map(d => `<th style="text-align:center" title="${d.tip}">${d.label}</th>`).join('')}
          <th style="text-align:center">Composite</th>
          <th>Services Used</th>
        </tr>
      </thead>
      <tbody>
        ${withComposite.map(c => `
        <tr>
          <td>
            <div class="data-table-primary">${c.displayName}</div>
            <div class="data-table-sub">${c.tier} · ${c.ltvMetrics.tenureYears}yr tenure</div>
          </td>
          ${dims.map(d => `<td style="text-align:center">${rScoreChip(c.ltvMetrics[d.key], d.label)}</td>`).join('')}
          <td style="text-align:center">${miniRing(c.composite, 38)}</td>
          <td><div class="r-services-list">${c.ltvMetrics.servicesUsed.map(s => `<span class="r-service-tag">${s}</span>`).join('')}</div></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="reports-grid" style="margin-top:16px">
    <div class="panel-card">
      <div class="panel-title">Wallet Share Gaps <span class="panel-title-sub">Breadth &lt; 6.5 — upsell opportunity</span></div>
      ${walletGaps.length === 0 ? '<div class="r-empty">All clients scoring well on breadth.</div>' : walletGaps.map(c => `
      <div class="r-opp-row">
        <div>
          <div class="data-table-primary">${c.displayName}</div>
          <div class="data-table-sub">${c.ltvMetrics.servicesUsed.join(', ')}</div>
        </div>
        <div style="text-align:right">
          ${rScoreChip(c.ltvMetrics.breadthScore, 'Breadth Score')}
          <div class="data-table-sub" style="margin-top:4px">${c.ltvMetrics.servicesUsed.length} of 7 services</div>
        </div>
      </div>`).join('')}
    </div>

    <div class="panel-card">
      <div class="panel-title">Growth Leaders <span class="panel-title-sub">Highest AUM growth trajectory</span></div>
      ${growthLeaders.map((c, i) => `
      <div class="r-opp-row">
        <div>
          <div class="data-table-primary">${c.displayName}</div>
          <div class="data-table-sub">YTD: +${(c.aumGrowthYTD*100).toFixed(1)}% · ${formatCurrency(c.aum)} AUM</div>
        </div>
        ${rScoreChip(c.ltvMetrics.growthScore, 'Growth Score')}
      </div>`).join('')}

      <div class="panel-title" style="margin-top:20px">Risk Flags <span class="panel-title-sub">Any dimension &lt; 5.0</span></div>
      ${riskClients.length === 0 ? '<div class="r-empty">No critical dimension scores below 5.0.</div>' :
        riskClients.map(c => {
          const weakDims = dims.filter(d => c.ltvMetrics[d.key] < 5);
          return `<div class="r-risk-row">
            <div class="data-table-primary">${c.displayName}</div>
            <div class="r-risk-dims">${weakDims.map(d =>
              `<span class="r-risk-chip">${d.label}: ${c.ltvMetrics[d.key]}</span>`).join('')}
            </div>
          </div>`;
        }).join('')}
    </div>
  </div>`;
}

// ── Tab 4: Profitability ──────────────────────────────────
function renderRptProfitability() {
  const totalRev = clients.reduce((s,c) => s + c.ltvMetrics.estimatedAnnualRevenue, 0);
  const totalLTV = clients.reduce((s,c) => s + c.ltvMetrics.projectedLTV, 0);
  const totalAUM = clients.reduce((s,c) => s + c.aum, 0);

  // Sorted by revenue
  const byRev = [...clients].sort((a,b) => b.ltvMetrics.estimatedAnnualRevenue - a.ltvMetrics.estimatedAnnualRevenue);
  const maxRev = byRev[0].ltvMetrics.estimatedAnnualRevenue;

  // Revenue concentration (cumulative)
  let cumRev = 0;
  const cumulative = byRev.map(c => {
    cumRev += c.ltvMetrics.estimatedAnnualRevenue;
    return { client: c, cumPct: (cumRev/totalRev*100).toFixed(0) };
  });

  // At-risk LTV: clients with health < 7 or engagement score < 5
  const ltvAtRisk = clients.filter(c => c.healthLabel === 'At Risk' || c.ltvMetrics.engagementScore < 5);
  const ltvAtRiskTotal = ltvAtRisk.reduce((s,c) => s+c.ltvMetrics.projectedLTV, 0);

  // Service cost estimate from caTasks
  const BLENDED_RATE = 85; // $/hr blended CA/ACA rate
  const clientCosts = clients.map(c => {
    const taskHrs = caTasks.filter(t => t.clientId === c.id).reduce((s,t) => s+(t.estHours||0), 0);
    const annualCostEst = taskHrs * 12 * BLENDED_RATE; // monthly snapshot × 12
    const grossMargin = c.ltvMetrics.estimatedAnnualRevenue - annualCostEst;
    const marginPct = (grossMargin / c.ltvMetrics.estimatedAnnualRevenue * 100);
    return { client: c, taskHrs, annualCostEst, grossMargin, marginPct };
  }).sort((a,b) => b.client.ltvMetrics.estimatedAnnualRevenue - a.client.ltvMetrics.estimatedAnnualRevenue);

  const totalEstCost = clientCosts.reduce((s,r) => s+r.annualCostEst, 0);
  const overallMargin = ((totalRev - totalEstCost)/totalRev*100).toFixed(0);

  // Fee rate comparison
  const feeRates = [...clients].sort((a,b) => b.ltvMetrics.feeRate - a.ltvMetrics.feeRate);

  return `
  <div class="r-insights-row">
    ${rInsight('Annual Revenue', formatCurrency(totalRev), ((totalRev/totalAUM)*100).toFixed(2)+'% blended fee')}
    ${rInsight('Projected LTV', formatCurrency(totalLTV), 'Across all relationships')}
    ${rInsight('LTV at Risk', formatCurrency(ltvAtRiskTotal), ltvAtRisk.map(c=>c.displayName.split(' ')[1]).join(', '), '#C0392B')}
    ${rInsight('Est. Gross Margin', overallMargin+'%', 'After estimated CA service cost', overallMargin >= 70 ? '#2D7A2D' : '#B8923C')}
    ${rInsight('Revenue / AUM', ((totalRev/totalAUM)*100).toFixed(3)+'%', 'Effective fee rate on book', 'var(--primary)')}
  </div>

  <div class="panel-card" style="margin-top:16px;padding:0;overflow:hidden">
    <div style="padding:14px 20px 8px"><div class="panel-title" style="margin:0">Revenue Waterfall &amp; Concentration</div></div>
    <table class="data-table">
      <thead><tr><th>Client</th><th>Tier</th><th style="text-align:right">Annual Revenue</th><th>Share of Book</th><th style="text-align:right">Cumulative</th><th style="text-align:right">Projected LTV</th><th style="text-align:right">Fee Rate</th></tr></thead>
      <tbody>${cumulative.map(({client: c, cumPct}) => {
        const revPct = (c.ltvMetrics.estimatedAnnualRevenue/totalRev*100);
        const isConc = +cumPct <= 75;
        return `<tr>
          <td><div class="data-table-primary">${c.displayName}</div></td>
          <td><span class="tier-badge ${tierClass(c.tier)}">${tierLabel(c.tier)}</span></td>
          <td class="data-table-num">${formatCurrency(c.ltvMetrics.estimatedAnnualRevenue)}</td>
          <td style="min-width:140px">
            <div class="r-bar-with-label">
              ${svgBarH(revPct, isConc ? '#0C2340' : '#6B8FAF', 110, 7)}
              <span class="r-bar-pct">${revPct.toFixed(1)}%</span>
            </div>
          </td>
          <td class="data-table-num"><span style="color:${+cumPct<=50?'#C0392B':+cumPct<=75?'#B8923C':'inherit'}">${cumPct}%</span></td>
          <td class="data-table-num">${formatCurrency(c.ltvMetrics.projectedLTV)}</td>
          <td class="data-table-num">${(c.ltvMetrics.feeRate*100).toFixed(2)}%</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
  </div>

  <div class="reports-grid" style="margin-top:16px">
    <div class="panel-card">
      <div class="panel-title">Est. Profitability by Client <span class="panel-title-sub">Revenue minus CA service cost (${BLENDED_RATE}/hr est.)</span></div>
      <table class="data-table">
        <thead><tr><th>Client</th><th style="text-align:right">Revenue</th><th style="text-align:right">Est. Cost</th><th style="text-align:right">Gross Margin</th></tr></thead>
        <tbody>${clientCosts.map(r => `
          <tr>
            <td class="data-table-primary">${r.client.displayName.split(' ')[1]}</td>
            <td class="data-table-num">${formatCurrency(r.client.ltvMetrics.estimatedAnnualRevenue)}</td>
            <td class="data-table-num data-table-sub">${r.annualCostEst > 0 ? formatCurrency(r.annualCostEst) : '—'}</td>
            <td class="data-table-num">
              <span style="color:${r.marginPct>=70?'#2D7A2D':r.marginPct>=50?'#B8923C':'#C0392B'}">
                ${r.annualCostEst > 0 ? r.marginPct.toFixed(0)+'%' : 'N/A'}
              </span>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="r-note">* Cost estimate based on tracked task hours × $${BLENDED_RATE}/hr blended rate. Does not include advisor time.</div>
    </div>

    <div class="panel-card">
      <div class="panel-title">LTV at Risk</div>
      ${ltvAtRisk.length === 0 ? '<div class="r-empty">No clients flagged as at-risk.</div>' :
        ltvAtRisk.map(c => `
        <div class="r-risk-ltv-row">
          <div>
            <div class="data-table-primary">${c.displayName}</div>
            <div class="data-table-sub">${c.healthLabel} · Engagement: ${c.ltvMetrics.engagementScore}/10</div>
          </div>
          <div style="text-align:right">
            <div class="data-table-primary" style="color:#C0392B">${formatCurrency(c.ltvMetrics.projectedLTV)}</div>
            <div class="data-table-sub">at risk</div>
          </div>
        </div>`).join('')}
      <div class="r-ltv-total" style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
        <span class="data-table-sub">Total projected LTV at risk</span>
        <span class="data-table-primary" style="color:#C0392B">${formatCurrency(ltvAtRiskTotal)}</span>
      </div>
    </div>
  </div>`;
}

// ── Tab 5: Staffing & Capacity ────────────────────────────
function renderRptStaffing() {
  const totalAUM = clients.reduce((s,c) => s + c.aum, 0);
  const HOURS_PER_WEEK = 35;
  const WEEKS_PER_YEAR = 48;
  const CAPACITY_PER_PERSON = HOURS_PER_WEEK * WEEKS_PER_YEAR; // 1,680 hrs/yr
  const COMPLEXITY_MULT = 3.5; // UHNW complexity premium over standard
  const STD_HOURS_PER_10M = 50; // industry benchmark: 50 hrs per $10M AUM per yr
  const BLENDED_RATE = 85; // $/hr blended
  const AVG_AUM_GROWTH = (clients.reduce((s,c)=>s+c.aumGrowthYTD,0)/clients.length);

  // Staff workload from caTasks
  const staffLoad = CA_STAFF.map(s => {
    const tasks = caTasks.filter(t => t.assignedTo === s.id);
    const estHrs = tasks.reduce((sum,t) => sum+(t.estHours||0), 0);
    const openTasks = tasks.filter(t => t.status !== 'completed').length;
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate < TODAY).length;
    return { staff: s, taskCount: tasks.length, estHrs, openTasks, overdueTasks,
      annualHrsEst: estHrs * 12 };  // monthly snapshot × 12
  });

  const totalStaff = CA_STAFF.length;
  const totalCapacity = totalStaff * CAPACITY_PER_PERSON;

  // Demand estimate (industry model)
  const aumDemandHrs = (totalAUM / 10000000) * STD_HOURS_PER_10M * COMPLEXITY_MULT;
  const utilization  = Math.min(aumDemandHrs / totalCapacity * 100, 100);

  // AUM per staff
  const aumPerStaff = totalAUM / totalStaff;

  // Hiring trigger: when will we hit 90% capacity?
  // Growth rate → AUM next year → demand hours next year
  const aumNext1yr   = totalAUM * (1 + AVG_AUM_GROWTH);
  const aumNext2yr   = totalAUM * Math.pow(1 + AVG_AUM_GROWTH, 2);
  const demandNext1  = (aumNext1yr / 10000000) * STD_HOURS_PER_10M * COMPLEXITY_MULT;
  const demandNext2  = (aumNext2yr / 10000000) * STD_HOURS_PER_10M * COMPLEXITY_MULT;
  const util1 = (demandNext1 / totalCapacity * 100);
  const util2 = (demandNext2 / totalCapacity * 100);
  const needsHire1yr = util1 > 90;
  const needsHire2yr = util2 > 90;

  // Revenue per capita
  const totalRev = clients.reduce((s,c)=>s+c.ltvMetrics.estimatedAnnualRevenue,0);
  const revPerStaff = totalRev / totalStaff;

  // Task type distribution
  const typeCount = {};
  caTasks.forEach(t => { typeCount[t.type] = (typeCount[t.type]||0) + 1; });
  const typeSorted = Object.entries(typeCount).sort((a,b) => b[1]-a[1]);
  const maxTypeCount = typeSorted[0]?.[1] || 1;

  const roleColors = { SCA: '#0C2340', ACA: '#6B8FAF', CA: '#B8923C' };

  return `
  <div class="r-insights-row">
    ${rInsight('Total Team', totalStaff+' people', CA_STAFF.map(s=>s.role).sort().join(', '))}
    ${rInsight('AUM per Staff', formatCurrency(aumPerStaff), 'Advisor + support team')}
    ${rInsight('Revenue per Staff', formatCurrency(revPerStaff), 'Annual revenue / headcount')}
    ${rInsight('Est. Capacity Used', utilization.toFixed(0)+'%', 'UHNW complexity-adjusted model', utilization>80?'#C0392B':utilization>60?'#B8923C':'#2D7A2D')}
    ${rInsight('Annual Capacity', (totalCapacity).toLocaleString()+'h', totalStaff+' staff × '+CAPACITY_PER_PERSON+'h each')}
  </div>

  <div class="reports-grid" style="margin-top:16px">
    <div class="panel-card">
      <div class="panel-title">Team Workload Summary <span class="panel-title-sub">From tracked tasks (monthly snapshot × 12)</span></div>
      <table class="data-table">
        <thead><tr><th>Staff Member</th><th>Role</th><th style="text-align:center">Tasks</th><th style="text-align:center">Open</th><th style="text-align:center">Overdue</th><th style="text-align:right">Est. Annual Hrs</th></tr></thead>
        <tbody>${staffLoad.map(r => `
          <tr>
            <td>
              <span class="ops-avatar-chip" style="background:${roleColors[r.staff.role]||'#6B8FAF'};color:#fff;margin-right:8px">${r.staff.initials}</span>
              <strong>${r.staff.name}</strong>
            </td>
            <td><span class="r-role-badge" style="background:${roleColors[r.staff.role]||'#6B8FAF'}22;color:${roleColors[r.staff.role]||'#6B8FAF'}">${r.staff.role}</span></td>
            <td style="text-align:center">${r.taskCount}</td>
            <td style="text-align:center">${r.openTasks}</td>
            <td style="text-align:center;color:${r.overdueTasks>0?'#C0392B':'inherit'}">${r.overdueTasks}</td>
            <td style="text-align:right">${r.annualHrsEst.toFixed(0)}h</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="panel-card">
      <div class="panel-title">Capacity Model</div>
      <div class="r-capacity-model">
        <div class="r-cap-row">
          <span class="data-table-sub">Current AUM</span>
          <span class="data-table-primary">${formatCurrency(totalAUM)}</span>
        </div>
        <div class="r-cap-row">
          <span class="data-table-sub">Avg YTD AUM Growth</span>
          <span class="data-table-primary">+${(AVG_AUM_GROWTH*100).toFixed(1)}%</span>
        </div>
        <div class="r-cap-row">
          <span class="data-table-sub">Est. AUM in 12 months</span>
          <span class="data-table-primary">${formatCurrency(aumNext1yr)}</span>
        </div>
        <div class="r-cap-row">
          <span class="data-table-sub">Est. AUM in 24 months</span>
          <span class="data-table-primary">${formatCurrency(aumNext2yr)}</span>
        </div>
        <div class="r-cap-divider"></div>
        <div class="r-cap-row">
          <span class="data-table-sub">Team capacity (annual hrs)</span>
          <span class="data-table-primary">${totalCapacity.toLocaleString()}h</span>
        </div>
        <div class="r-cap-row">
          <span class="data-table-sub">Demand estimate (current)</span>
          <span class="data-table-primary">${Math.round(aumDemandHrs).toLocaleString()}h</span>
        </div>
        <div class="r-cap-row">
          <span class="data-table-sub">Demand estimate (12 months)</span>
          <span class="data-table-primary ${util1>90?'loss':''}">${Math.round(demandNext1).toLocaleString()}h (${util1.toFixed(0)}%)</span>
        </div>
        <div class="r-cap-row">
          <span class="data-table-sub">Demand estimate (24 months)</span>
          <span class="data-table-primary ${util2>90?'loss':''}">${Math.round(demandNext2).toLocaleString()}h (${util2.toFixed(0)}%)</span>
        </div>
      </div>

      <div class="r-hiring-rec" style="border-color:${needsHire1yr?'#C0392B':needsHire2yr?'#B8923C':'#2D7A2D'}">
        <div class="r-hiring-icon">${needsHire1yr?'⚠':needsHire2yr?'📋':'✓'}</div>
        <div>
          <div class="r-hiring-title" style="color:${needsHire1yr?'#C0392B':needsHire2yr?'#B8923C':'#2D7A2D'}">
            ${needsHire1yr
              ? 'Recommend hiring an ACA within 6 months'
              : needsHire2yr
              ? 'Initiate ACA search within 12–18 months'
              : 'Current staffing adequate for 24-month horizon'}
          </div>
          <div class="r-hiring-sub">
            ${needsHire1yr
              ? 'At current growth (+'+((AVG_AUM_GROWTH*100).toFixed(1))+'%/yr), demand will exceed 90% capacity in 12 months. Adding 1 ACA increases capacity to '+(totalCapacity+CAPACITY_PER_PERSON).toLocaleString()+'h/yr.'
              : needsHire2yr
              ? 'Team will approach full capacity within 24 months at current AUM growth rate.'
              : 'Model projects utilization at '+util2.toFixed(0)+'% in 24 months — monitor quarterly.'}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="panel-card" style="margin-top:16px">
    <div class="panel-title">Task Volume by Category <span class="panel-title-sub">Where CA team time is allocated</span></div>
    ${typeSorted.map(([type, count]) => {
      const meta = CA_TASK_TYPES[type];
      return `<div class="r-eng-row" style="margin-bottom:6px">
        <span class="r-eng-name data-table-primary">${meta ? meta.label : type}</span>
        <div style="flex:1;padding:0 4px">${svgBarH(count/maxTypeCount*100, meta ? meta.color : 'var(--primary)', 130, 8)}</div>
        <span class="r-eng-count">${count} task${count!==1?'s':''}</span>
      </div>`;
    }).join('')}
  </div>`;
}

// ── Tab 3: Engagement ─────────────────────────────────────
function renderRptEngagement() {
  const sorted = [...clients].sort((a,b) => a.ltvMetrics.engagementScore - b.ltvMetrics.engagementScore);
  const avgEngagement = (clients.reduce((s,c) => s+c.ltvMetrics.engagementScore,0)/clients.length).toFixed(1);
  const avgDaysSince  = Math.round(clients.reduce((s,c) => s+daysSince(c.lastTouchpoint.date),0)/clients.length);

  // Touchpoint type counts across all clients
  const allTp = clients.flatMap(c => c.touchpoints);
  const tpTypes = {};
  allTp.forEach(tp => { tpTypes[tp.type] = (tpTypes[tp.type]||0)+1; });
  const tpTypeSorted = Object.entries(tpTypes).sort((a,b) => b[1]-a[1]);

  // Touchpoints per client in last 90 days
  const tpLast90 = clients.map(c => ({
    client: c,
    count: c.touchpoints.filter(tp => daysSince(tp.date) <= 90).length,
    lastDays: daysSince(c.lastTouchpoint.date)
  })).sort((a,b) => a.count - b.count);

  const maxTp = Math.max(...tpLast90.map(x => x.count), 1);

  // At-risk contacts (>60 days)
  const atRisk = clients.filter(c => daysSince(c.lastTouchpoint.date) > 60)
    .sort((a,b) => daysSince(b.lastTouchpoint.date) - daysSince(a.lastTouchpoint.date));

  // Upcoming milestones next 90 days
  const milestones = clients.flatMap(c =>
    c.upcomingMilestones
      .filter(m => { const d = daysUntil(m.date); return d >= 0 && d <= 90; })
      .map(m => ({ ...m, client: c, daysOut: daysUntil(m.date) }))
  ).sort((a,b) => a.daysOut - b.daysOut);

  const tpTypeLabel = {
    meeting: 'Meeting', phone_call: 'Phone Call', email: 'Email',
    gift_sent: 'Gift Sent', annual_review: 'Annual Review', event: 'Event'
  };

  return `
  <div class="r-insights-row">
    ${rInsight('Avg Engagement Score', avgEngagement+'/10', 'Across all clients', rScoreColor(+avgEngagement))}
    ${rInsight('Avg Days Since Contact', avgDaysSince+'d', avgDaysSince > 30 ? 'Above 30-day target' : 'Within 30-day target', avgDaysSince > 30 ? '#C0392B' : '#2D7A2D')}
    ${rInsight('Touchpoints (Last 90d)', allTp.filter(tp => daysSince(tp.date) <= 90).length+'', 'Across all clients', 'var(--primary)')}
    ${rInsight('At-Risk Contacts', atRisk.length+'', '>60 days since last contact', atRisk.length > 0 ? '#C0392B' : '#2D7A2D')}
    ${rInsight('Milestones Next 90d', milestones.length+'', 'Birthdays, reviews, events', 'var(--primary)')}
  </div>

  <div class="reports-grid" style="margin-top:16px">
    <div class="panel-card">
      <div class="panel-title">Touchpoint Frequency <span class="panel-title-sub">Last 90 days — sorted by activity</span></div>
      ${tpLast90.map(({client: c, count, lastDays}) => {
        const isOver = lastDays > 60;
        const barColor = rScoreColor(c.ltvMetrics.engagementScore);
        return `<div class="r-eng-row">
          <div class="r-eng-name">
            <div class="data-table-primary">${c.displayName.split(' ')[1]}</div>
            <div class="data-table-sub" style="color:${isOver?'#C0392B':'var(--text-muted)'};font-size:10px">
              ${lastDays}d ago${isOver?' ⚠':''}
            </div>
          </div>
          <div style="flex:1;padding:0 4px">${svgBarH(count/maxTp*100, barColor, 120, 7)}</div>
          <span class="r-eng-count">${count}</span>
        </div>`;
      }).join('')}
    </div>

    <div class="panel-card">
      <div class="panel-title">Contact Type Breakdown</div>
      ${tpTypeSorted.map(([type, count]) => `
      <div class="r-eng-row">
        <span class="data-table-primary r-eng-name">${tpTypeLabel[type] || type}</span>
        <div style="flex:1;padding:0 4px">${svgBarH(count/allTp.length*100, 'var(--primary)', 120, 7)}</div>
        <span class="r-eng-count">${count}</span>
      </div>`).join('')}

      <div class="panel-title" style="margin-top:20px">Engagement Quality <span class="panel-title-sub">Score by client</span></div>
      ${[...clients].sort((a,b)=>b.ltvMetrics.engagementScore-a.ltvMetrics.engagementScore).map(c => `
      <div class="r-eng-row">
        <span class="data-table-primary r-eng-name">${c.displayName.split(' ')[1]}</span>
        <div style="flex:1;padding:0 4px">${svgBarH(c.ltvMetrics.engagementScore*10, rScoreColor(c.ltvMetrics.engagementScore), 120, 7)}</div>
        ${rScoreChip(c.ltvMetrics.engagementScore)}
      </div>`).join('')}
    </div>
  </div>

  ${atRisk.length > 0 ? `
  <div class="panel-card" style="margin-top:16px;border-left:3px solid #C0392B">
    <div class="panel-title" style="color:#C0392B">⚠ Overdue for Contact</div>
    <table class="data-table">
      <thead><tr><th>Client</th><th>Last Contact</th><th>Type</th><th>Summary</th><th>Engagement Score</th></tr></thead>
      <tbody>${atRisk.map(c => `
        <tr>
          <td><div class="data-table-primary">${c.displayName}</div></td>
          <td class="data-table-num" style="color:#C0392B;font-weight:700">${daysSince(c.lastTouchpoint.date)}d ago</td>
          <td class="data-table-sub">${c.lastTouchpoint.type.replace('_',' ')}</td>
          <td class="data-table-sub">${c.lastTouchpoint.summary}</td>
          <td>${rScoreChip(c.ltvMetrics.engagementScore)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${milestones.length > 0 ? `
  <div class="panel-card" style="margin-top:16px;padding:0;overflow:hidden">
    <div style="padding:14px 20px 8px"><div class="panel-title" style="margin:0">Upcoming Milestones — Next 90 Days</div></div>
    <table class="data-table">
      <thead><tr><th>Client</th><th>Date</th><th>Days Out</th><th>Event</th><th>Urgent</th></tr></thead>
      <tbody>${milestones.map(m => `
        <tr>
          <td class="data-table-primary">${m.client.displayName}</td>
          <td class="data-table-sub">${m.date}</td>
          <td class="data-table-num ${m.daysOut<=14?'loss':''}">${m.daysOut}d</td>
          <td>${m.description}</td>
          <td>${m.urgent?'<span style="color:#C0392B;font-weight:700">Yes</span>':'—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}`;
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

  // Portfolio pulse data
  const thriving = clients.filter(c => c.healthLabel === 'Thriving');
  const nurture  = clients.filter(c => c.healthLabel === 'Nurture');
  const atRisk   = clients.filter(c => c.healthLabel === 'At Risk');
  const overdue  = clients.filter(c => daysSince(c.lastTouchpoint.date) > 60);
  const thrivingAUM = thriving.reduce((s,c) => s+c.aum,0);
  const nurtureAUM  = nurture.reduce((s,c) => s+c.aum,0);
  const atRiskAUM   = atRisk.reduce((s,c) => s+c.aum,0);

  const healthDonut = svgDonutSegments([
    { value: thriving.length, color: '#1E7A52' },
    { value: nurture.length,  color: '#A87020' },
    { value: atRisk.length,   color: '#A83228' }
  ], 88, 12);

  const totalRev = clients.reduce((s,c) => s+c.ltvMetrics.estimatedAnnualRevenue,0);

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
    ${headerEnd()}
  </div>

  <div class="main-content">
    <div class="stats-bar">
      <div class="stat-card stat-card--primary">
        <div class="stat-card-icon">
          ${NAV_ICONS.advisor}
        </div>
        <div class="stat-label">Total AUM</div>
        <div class="stat-value">${formatCurrency(totalAUM)}</div>
        <div class="stat-sub">${clients.length} client relationships</div>
      </div>
      <div class="stat-card stat-card--gold">
        <div class="stat-card-icon">${NAV_ICONS.reports}</div>
        <div class="stat-label">Annual Revenue</div>
        <div class="stat-value">${formatCurrency(totalRev)}</div>
        <div class="stat-sub">${((totalRev/totalAUM)*100).toFixed(2)}% blended fee</div>
      </div>
      <div class="stat-card stat-card--${parseFloat(avgHealth) >= 7.5 ? 'green' : parseFloat(avgHealth) >= 5.5 ? 'amber' : 'red'}">
        <div class="stat-card-icon">${miniRing(parseFloat(avgHealth), 32)}</div>
        <div class="stat-label">Avg Health Score</div>
        <div class="stat-value">${avgHealth}<span style="font-size:14px;font-weight:400;opacity:.5">/10</span></div>
        <div class="stat-sub">LTV-weighted across book</div>
      </div>
      <div class="stat-card stat-card--${totalTasks > 10 ? 'amber' : 'neutral'}">
        <div class="stat-card-icon">${NAV_ICONS.tasks}</div>
        <div class="stat-label">Open Tasks</div>
        <div class="stat-value">${totalTasks}</div>
        <div class="stat-sub">${upcoming} milestones next 30d${overdue.length > 0 ? ` · <span style="color:var(--red)">${overdue.length} overdue contact</span>` : ''}</div>
      </div>
    </div>

    <div class="portfolio-pulse">
      <div class="pp-donut">${healthDonut}
        <div class="pp-donut-label"><div style="font-size:18px;font-weight:700;color:var(--primary)">${clients.length}</div><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Clients</div></div>
      </div>
      <div class="pp-segments">
        <div class="pp-seg pp-seg--green">
          <div class="pp-seg-bar" style="width:${(thriving.length/clients.length*100).toFixed(0)}%"></div>
          <div class="pp-seg-info">
            <span class="pp-seg-label">Thriving</span>
            <span class="pp-seg-count">${thriving.length} clients · ${formatCurrency(thrivingAUM)}</span>
          </div>
        </div>
        <div class="pp-seg pp-seg--amber">
          <div class="pp-seg-bar" style="width:${(nurture.length/clients.length*100).toFixed(0)}%"></div>
          <div class="pp-seg-info">
            <span class="pp-seg-label">Nurture</span>
            <span class="pp-seg-count">${nurture.length} clients · ${formatCurrency(nurtureAUM)}</span>
          </div>
        </div>
        ${atRisk.length > 0 ? `<div class="pp-seg pp-seg--red">
          <div class="pp-seg-bar" style="width:${(atRisk.length/clients.length*100).toFixed(0)}%"></div>
          <div class="pp-seg-info">
            <span class="pp-seg-label">At Risk</span>
            <span class="pp-seg-count">${atRisk.length} clients · ${formatCurrency(atRiskAUM)}</span>
          </div>
        </div>` : ''}
      </div>
      <div class="pp-divider"></div>
      <div class="pp-quick-stats">
        <div class="pp-qs"><div class="pp-qs-val">${((thrivingAUM/totalAUM)*100).toFixed(0)}%</div><div class="pp-qs-label">AUM Thriving</div></div>
        <div class="pp-qs"><div class="pp-qs-val">${overdue.length}</div><div class="pp-qs-label">Overdue Contact</div></div>
        <div class="pp-qs"><div class="pp-qs-val">${clients.filter(c=>c.upcomingMilestones.some(m=>{ const d=daysUntil(m.date); return d>=0&&d<=14; })).length}</div><div class="pp-qs-label">Moments (14d)</div></div>
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
  const maxAUM = Math.max(...clients.map(c => c.aum));
  const aumPct = (client.aum / maxAUM * 100).toFixed(1);
  const aumBarColor = client.aumGrowthYTD >= 0 ? '#1E7A52' : '#A83228';

  return `
  <div class="client-card" data-client-id="${client.id}">
    <div class="card-health-stripe ${hc}"></div>
    <div class="card-body">

      <div class="card-top-row">
        <div class="card-name-block">
          <div class="card-name">${client.displayName}</div>
          <span class="tier-badge ${tierClass(client.tier)}">${tierLabel(client.tier)}</span>
        </div>
        <div class="card-ring-wrap">${miniRing(client.healthScore, 46)}</div>
      </div>

      <div class="card-aum-block">
        <div class="card-aum-row">
          <span class="card-aum">${formatCurrency(client.aum)}</span>
          <span class="card-aum-growth ${client.aumGrowthYTD >= 0 ? 'positive' : 'negative'}">
            ${client.aumGrowthYTD >= 0 ? '▲' : '▼'} ${Math.abs(client.aumGrowthYTD * 100).toFixed(1)}% YTD
          </span>
        </div>
        <div class="card-aum-bar">${svgBarH(parseFloat(aumPct), aumBarColor, 180, 4)}</div>
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
          <div class="metric-label">Service Req</div>
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
      <button class="card-view-btn" data-client-id="${client.id}">View Profile →</button>
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
      <button class="header-btn-text" data-wire-instructions="${client.id}">⬇ Wire Instructions</button>
      <button class="header-btn-text primary">+ Service Request</button>
    </div>
    ${headerEnd()}
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
        { id: 'overview',      label: 'Overview',      badge: null },
        { id: 'touchpoints',   label: 'Touchpoints',   badge: client.touchpoints.length },
        { id: 'service',       label: 'Service',       badge: client.serviceRequests.filter(r=>r.status!=='completed').length || null },
        { id: 'holdings',      label: 'Holdings',      badge: null },
        { id: 'transactions',  label: 'Transactions',  badge: null },
        { id: 'inbox',         label: 'Inbox',         badge: clientMessages.filter(m=>m.clientId===client.id&&!m.read).length || null }
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
    case 'inbox':         return renderClientInboxTab(client);
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

// SVG path-arc donut: proper hit-testing, hover + click on slices
function renderDonut(slices) {
  if (!slices || !slices.length) return '';
  const cx = 60, cy = 60, outerR = 50, innerR = 28;
  const toRad = d => d * Math.PI / 180;
  let startAngle = -90;

  const paths = slices.map(s => {
    const sweep = Math.min((s.pct / 100) * 360, 359.99);
    const end   = startAngle + sweep;
    const x1 = cx + outerR * Math.cos(toRad(startAngle));
    const y1 = cy + outerR * Math.sin(toRad(startAngle));
    const x2 = cx + outerR * Math.cos(toRad(end));
    const y2 = cy + outerR * Math.sin(toRad(end));
    const x3 = cx + innerR * Math.cos(toRad(end));
    const y3 = cy + innerR * Math.sin(toRad(end));
    const x4 = cx + innerR * Math.cos(toRad(startAngle));
    const y4 = cy + innerR * Math.sin(toRad(startAngle));
    const large = sweep > 180 ? 1 : 0;
    const d = `M${x1.toFixed(2)},${y1.toFixed(2)} A${outerR},${outerR} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${innerR},${innerR} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`;
    startAngle += sweep;
    return `<path d="${d}" fill="${s.color}" stroke="var(--bg)" stroke-width="2.5"
      class="donut-slice${s.drillClass ? ' can-drill' : ''}"
      data-slice-label="${s.label}"
      data-slice-val="${Math.round(s.val)}"
      data-slice-pct="${s.pct.toFixed(1)}"
      ${s.drillClass ? `data-drill-class="${s.drillClass}"` : ''}/>`;
  });
  return `<svg viewBox="0 0 120 120" class="donut-svg" id="holdings-donut">${paths.join('')}</svg>`;
}

function renderKPIBars(items) {
  if (!items || !items.length) return '';
  const palette = ['#0C2340','#B8923C','#6B8FAF','#3D2B1F','#5A6B7A','#8B7355','#5A7A5A','#C8BFA8'];
  return `<div class="kpi-bars">${items.map((item, i) => `
    <div class="kpi-bar-row">
      <span class="kpi-bar-label">${item.label}</span>
      <div class="kpi-bar-track"><div class="kpi-bar-fill" style="width:${item.pct}%;background:${palette[i % palette.length]}"></div></div>
      <span class="kpi-bar-pct">${item.pct}%</span>
    </div>`).join('')}
  </div>`;
}

function renderHoldingsKPIs(client, assetClass) {
  const kpis = PORTFOLIO_KPIS[client.id];
  if (!kpis) return '';
  const map = { 'Equity': kpis.equity, 'Fixed Income': kpis.fixedIncome, 'Alternatives': kpis.alternatives, 'Cash': kpis.cash };
  const d = map[assetClass];
  if (!d) return '';

  if (assetClass === 'Equity') {
    return `<div class="kpi-panel">
      <div class="kpi-card"><div class="kpi-card-title">Geographic Exposure</div>${renderKPIBars(d.geographic)}</div>
      <div class="kpi-card"><div class="kpi-card-title">Sector Weights</div>${renderKPIBars(d.sectors)}</div>
      <div class="kpi-card"><div class="kpi-card-title">Market Cap &amp; Metrics</div>${renderKPIBars(d.marketCap)}
        <div class="kpi-metrics">
          ${d.ytdReturn      !== undefined ? `<div class="kpi-metric"><span class="kpi-metric-label">YTD Return</span><span class="kpi-metric-val gain">+${d.ytdReturn}%</span></div>` : ''}
          ${d.beta           !== undefined ? `<div class="kpi-metric"><span class="kpi-metric-label">Beta</span><span class="kpi-metric-val">${d.beta}</span></div>` : ''}
          ${d.dividendYield  !== undefined ? `<div class="kpi-metric"><span class="kpi-metric-label">Div. Yield</span><span class="kpi-metric-val">${d.dividendYield}%</span></div>` : ''}
          ${d.concentrationNote ? `<div class="kpi-alert">${d.concentrationNote}</div>` : ''}
        </div>
      </div>
    </div>`;
  }
  if (assetClass === 'Fixed Income') {
    return `<div class="kpi-panel">
      <div class="kpi-card"><div class="kpi-card-title">Credit Quality</div>${renderKPIBars(d.creditQuality)}</div>
      <div class="kpi-card"><div class="kpi-card-title">Geographic Mix</div>${renderKPIBars(d.geographic)}</div>
      <div class="kpi-card"><div class="kpi-card-title">Risk Metrics</div>
        <div class="kpi-metrics">
          <div class="kpi-metric"><span class="kpi-metric-label">Avg Duration</span><span class="kpi-metric-val">${d.duration}y</span></div>
          <div class="kpi-metric"><span class="kpi-metric-label">Yield to Maturity</span><span class="kpi-metric-val">${d.yieldToMaturity}%</span></div>
        </div>
      </div>
    </div>`;
  }
  if (assetClass === 'Alternatives') {
    return `<div class="kpi-panel">
      <div class="kpi-card"><div class="kpi-card-title">Sub-Type Breakdown</div>${renderKPIBars(d.subTypes)}</div>
      <div class="kpi-card"><div class="kpi-card-title">Performance Metrics</div>
        <div class="kpi-metrics">
          ${d.netIRR        !== undefined ? `<div class="kpi-metric"><span class="kpi-metric-label">Net IRR</span><span class="kpi-metric-val gain">${d.netIRR}%</span></div>` : ''}
          ${d.ytdReturn     !== undefined ? `<div class="kpi-metric"><span class="kpi-metric-label">YTD Return</span><span class="kpi-metric-val gain">+${d.ytdReturn}%</span></div>` : ''}
          ${d.dividendYield !== undefined ? `<div class="kpi-metric"><span class="kpi-metric-label">Distribution Yield</span><span class="kpi-metric-val">${d.dividendYield}%</span></div>` : ''}
          ${d.vintageRange  ? `<div class="kpi-metric"><span class="kpi-metric-label">Vintage Range</span><span class="kpi-metric-val">${d.vintageRange}</span></div>` : ''}
          ${d.sharpe        !== undefined ? `<div class="kpi-metric"><span class="kpi-metric-label">Sharpe Ratio</span><span class="kpi-metric-val">${d.sharpe}</span></div>` : ''}
        </div>
      </div>
    </div>`;
  }
  if (assetClass === 'Cash') {
    return `<div class="kpi-panel" style="grid-template-columns:1fr 1fr">
      <div class="kpi-card"><div class="kpi-card-title">Instruments</div>${renderKPIBars(d.instruments)}</div>
      <div class="kpi-card"><div class="kpi-card-title">Yield</div>
        <div class="kpi-metrics"><div class="kpi-metric"><span class="kpi-metric-label">Current Yield</span><span class="kpi-metric-val">${d.yield}%</span></div></div>
      </div>
    </div>`;
  }
  return '';
}

function renderHoldingsTab(client) {
  const allHoldings = client.holdings.map(h => enrichHolding(client.id, h));
  const totalVal    = allHoldings.reduce((s, h) => s + h.value, 0);

  const l1Totals = {};
  allHoldings.forEach(h => { l1Totals[h.assetClass] = (l1Totals[h.assetClass] || 0) + h.value; });

  const viewHoldings = holdingsDrill ? allHoldings.filter(h => h.assetClass === holdingsDrill) : allHoldings;
  const viewTotal    = viewHoldings.reduce((s, h) => s + h.value, 0);

  // Build donut slices — top-level L1 slices get drillClass for click-to-drill
  let donutSlices;
  const canDrill = !holdingsDrill && holdingsLevel === 'class';

  if (holdingsDrill) {
    const l2T = {};
    viewHoldings.forEach(h => { l2T[h.strategy] = (l2T[h.strategy] || 0) + h.value; });
    donutSlices = Object.entries(l2T).map(([s, v]) => ({
      label: s, val: v, pct: (v / viewTotal) * 100, color: L2_COLORS[s] || '#9CA3AF'
    })).sort((a, b) => b.pct - a.pct);
  } else if (holdingsLevel === 'strategy') {
    const l2T = {};
    allHoldings.forEach(h => { l2T[h.strategy] = (l2T[h.strategy] || 0) + h.value; });
    donutSlices = Object.entries(l2T).map(([s, v]) => ({
      label: s, val: v, pct: (v / totalVal) * 100, color: L2_COLORS[s] || '#9CA3AF'
    })).sort((a, b) => b.pct - a.pct);
  } else {
    donutSlices = Object.entries(l1Totals).map(([cls, v]) => ({
      label: cls, val: v, pct: (v / totalVal) * 100,
      color: L1_COLORS[cls] || '#9CA3AF',
      drillClass: cls   // ← enables click-to-drill on the SVG path
    })).sort((a, b) => b.pct - a.pct);
  }

  const centerDisplayVal   = formatCurrency(holdingsDrill ? viewTotal : totalVal);
  const centerDisplayLabel = holdingsDrill ? holdingsDrill : 'Portfolio';

  // Legend rows — drillable on legend click OR donut click
  const legendRows = donutSlices.map(s => {
    const drillAttr = canDrill ? `data-drill-class="${s.label}"` : '';
    return `<div class="donut-legend-row holdings-legend-row${canDrill ? ' drillable' : ''}" ${drillAttr}
        data-legend-label="${s.label}">
        <span class="donut-legend-dot" style="background:${s.color}"></span>
        <span class="donut-legend-label">${s.label}</span>
        <span class="donut-legend-pct">${s.pct.toFixed(1)}%</span>
        <span class="donut-legend-val">${formatCurrency(s.val)}</span>
        ${canDrill ? '<span class="drill-chevron">›</span>' : ''}
      </div>`;
  }).join('');

  // Breadcrumb (only when drilled in)
  const breadcrumb = holdingsDrill ? `
    <div class="holdings-breadcrumb">
      <button class="breadcrumb-back" data-holdings-back>← All Assets</button>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${holdingsDrill}</span>
    </div>` : '';

  // Table rows
  const tableRows = viewHoldings.map(h => {
    const displayName = holdingsView === 'exposure' ? h.exposure : h.name;
    const displaySub  = holdingsView === 'exposure' ? h.strategy : (h.ticker || null);
    const pctOfTotal  = (h.value / totalVal) * 100;
    const l1Key       = h.assetClass.toLowerCase().replace(/ /g, '-');
    return `<tr>
        <td>
          <div class="data-table-primary">${displayName}</div>
          ${displaySub ? `<div class="data-table-sub">${displaySub}</div>` : ''}
        </td>
        <td><span class="l1-badge l1-${l1Key}">${h.assetClass}</span></td>
        <td class="data-table-sub" style="max-width:150px;white-space:normal;line-height:1.35">${h.strategy}</td>
        <td class="data-table-num">${formatCurrency(h.value)}</td>
        <td>
          <div class="alloc-bar-wrap">
            <div class="alloc-bar"><div class="alloc-fill" style="width:${Math.min(pctOfTotal, 100)}%;background:${L1_COLORS[h.assetClass] || '#9CA3AF'}"></div></div>
            <span class="data-table-sub">${pctOfTotal.toFixed(1)}%</span>
          </div>
        </td>
        <td class="data-table-num ${h.gainLossPct >= 0 ? 'gain' : 'loss'}">${h.gainLossPct >= 0 ? '+' : ''}${h.gainLossPct.toFixed(1)}%</td>
      </tr>`;
  }).join('');

  return `
  ${breadcrumb}

  <div class="tab-section-header">
    <div class="tab-section-title">
      ${viewHoldings.length} Position${viewHoldings.length !== 1 ? 's' : ''} &nbsp;·&nbsp; ${formatCurrency(holdingsDrill ? viewTotal : totalVal)}
    </div>
  </div>

  <div class="holdings-overview">
    <!-- Donut: hover any slice to see details, click to drill (L1 mode) -->
    <div class="donut-wrap">
      ${renderDonut(donutSlices)}
      <div class="donut-center">
        <div class="donut-center-val" id="donut-center-val">${centerDisplayVal}</div>
        <div class="donut-center-label" id="donut-center-label">${centerDisplayLabel}</div>
      </div>
    </div>

    <!-- Legend column with level switcher -->
    <div class="holdings-legend-col">
      <div class="holdings-level-switcher">
        <button class="level-pill${holdingsLevel === 'class'    ? ' active' : ''}" data-holdings-level="class">Asset Class</button>
        <button class="level-pill${holdingsLevel === 'strategy' ? ' active' : ''}" data-holdings-level="strategy">Strategy</button>
      </div>
      <div class="donut-legend" id="donut-legend">
        ${legendRows}
      </div>
      ${canDrill ? `<div class="drill-hint">Click a slice or row to drill in</div>` : ''}
    </div>
  </div>

  ${holdingsDrill ? renderHoldingsKPIs(client, holdingsDrill) : ''}

  <div class="holdings-table-bar">
    <span class="holdings-table-label">Positions</span>
    <div class="view-pill-group">
      <button class="view-pill${holdingsView === 'product'  ? ' active' : ''}" data-holdings-view="product">Product</button>
      <button class="view-pill${holdingsView === 'exposure' ? ' active' : ''}" data-holdings-view="exposure">Exposure</button>
    </div>
  </div>
  <div class="panel-card" style="padding:0;overflow:hidden">
    <table class="data-table">
      <thead>
        <tr>
          <th>${holdingsView === 'exposure' ? 'Exposure' : 'Position'}</th>
          <th>Asset Class</th>
          <th>Strategy</th>
          <th style="text-align:right">Value</th>
          <th>Alloc.</th>
          <th style="text-align:right">Gain / Loss</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
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

// ─── CHATBOT ──────────────────────────────────────────────
const chatState = {
  open: false,
  messages: []
};

function chatContextInfo() {
  if (state.view === 'client') {
    const c = clients.find(x => x.id === state.clientId);
    return {
      label: c ? c.displayName : 'Client',
      level: 'client',
      client: c,
      prompts: ['Prepare call agenda', 'Last contact', 'Top holdings', 'Open requests', 'Milestones']
    };
  }
  return {
    label: 'Book of Business',
    level: 'book',
    client: null,
    prompts: ['Who needs attention?', 'Overdue contacts', 'AUM summary', 'Open tasks', 'Milestones this month']
  };
}

function chatResponse(text) {
  const q = text.toLowerCase().trim();
  const ctx = chatContextInfo();

  // ── CLIENT LEVEL ────────────────────────────────────────
  if (ctx.level === 'client') {
    const c = ctx.client;
    if (!c) return 'No client selected. Navigate to a client profile first.';

    if (/agenda|call prep|prepare|talking point/.test(q)) {
      const dsc = daysSince(c.lastTouchpoint.date);
      const milestones = c.upcomingMilestones.filter(m => daysUntil(m.date) >= 0 && daysUntil(m.date) <= 90);
      const openReqs = c.serviceRequests.filter(r => r.status !== 'completed');
      const actions = computeNextBestActions(c);
      return `**Call Agenda — ${c.displayName}**\n\n**Context:**\n• Last contact: ${dsc} day${dsc !== 1 ? 's' : ''} ago — ${c.lastTouchpoint.summary}\n• Portfolio: ${formatCurrency(c.aum)} AUM, +${(c.aumGrowthYTD * 100).toFixed(1)}% YTD\n\n**Open Items (${openReqs.length}):**\n${openReqs.length ? openReqs.slice(0, 4).map(r => `• ${r.title} [${r.priority.toUpperCase()}] · ${statusLabel(r.status)}`).join('\n') : '• None — all clear'}\n\n**Upcoming Milestones:**\n${milestones.length ? milestones.slice(0, 3).map(m => `• ${m.description} — ${formatDate(m.date)} (${daysUntil(m.date)}d)`).join('\n') : '• None in next 90 days'}\n\n**Suggested Topics:**\n${actions.map(a => `• ${a.title}`).join('\n')}`;
    }

    if (/last contact|last touch|last speak|last call|last meet|when.*contact/.test(q)) {
      const dsc = daysSince(c.lastTouchpoint.date);
      const tp = c.touchpoints[0];
      return `Last contact with **${c.displayName}** was **${dsc} days ago** (${formatDate(c.lastTouchpoint.date)}).\n\n${tp ? `**${tp.title}**\n${tp.notes.slice(0, 220)}${tp.notes.length > 220 ? '…' : ''}` : c.lastTouchpoint.summary}`;
    }

    if (/hold|portfolio|asset|allocation|position/.test(q)) {
      const totals = {};
      c.holdings.forEach(h => { totals[h.type] = (totals[h.type] || 0) + h.value; });
      const totalVal = c.holdings.reduce((s, h) => s + h.value, 0);
      const byType = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      const top3 = c.holdings.slice().sort((a, b) => b.value - a.value).slice(0, 3);
      return `**${c.displayName} — ${formatCurrency(totalVal)} Portfolio**\n\n**By Asset Class:**\n${byType.map(([t, v]) => `• ${t}: ${formatCurrency(v)} (${((v / totalVal) * 100).toFixed(1)}%)`).join('\n')}\n\n**Top Positions:**\n${top3.map(h => `• ${h.name}: ${formatCurrency(h.value)} (${h.gainLossPct >= 0 ? '+' : ''}${h.gainLossPct.toFixed(1)}%)`).join('\n')}`;
    }

    if (/service|request|open item|open task|ticket/.test(q)) {
      const open = c.serviceRequests.filter(r => r.status !== 'completed');
      if (open.length === 0) return `No open service requests for **${c.displayName}**. All clear!`;
      return `**Open Service Requests — ${c.displayName}** (${open.length})\n\n${open.map(r => `• **${r.title}** [${r.priority.toUpperCase()}]\n  ${statusLabel(r.status)} · Due ${formatDate(r.dueDate)}\n  ${r.notes.slice(0, 100)}`).join('\n\n')}`;
    }

    if (/milestone|birthday|anniversary|upcoming/.test(q)) {
      const ms = c.upcomingMilestones.filter(m => daysUntil(m.date) >= -14);
      if (ms.length === 0) return `No upcoming milestones found for **${c.displayName}**.`;
      return `**Upcoming Milestones — ${c.displayName}**\n\n${ms.map(m => { const d = daysUntil(m.date); return `• ${m.description}: ${formatDate(m.date)} (${d >= 0 ? `in ${d} days` : `${Math.abs(d)} days ago`})`; }).join('\n')}`;
    }

    if (/revenue|fee|ltv|lifetime|worth/.test(q)) {
      const lv = c.ltvMetrics;
      return `**Relationship Value — ${c.displayName}**\n\n• Est. Annual Revenue: **${formatCurrency(lv.estimatedAnnualRevenue)}**\n• Projected LTV: ${formatCurrency(lv.projectedLTV)}\n• Fee Rate: ${(lv.feeRate * 100).toFixed(2)}%\n• Tenure: ${lv.tenureYears} years\n• Referrals Given: ${lv.referralsGiven}\n• Services: ${lv.servicesUsed.join(', ')}`;
    }

    if (/health|score|status/.test(q)) {
      const lv = c.ltvMetrics;
      return `**${c.displayName}** — Health Score **${c.healthScore}/10** (${c.healthLabel})\n\n• Revenue: ${lv.revenueScore}/10\n• Engagement: ${lv.engagementScore}/10\n• Growth: ${lv.growthScore}/10\n• Tenure: ${lv.tenureScore}/10\n• Breadth: ${lv.breadthScore}/10`;
    }

    return `I'm viewing **${c.displayName}** (${formatCurrency(c.aum)} AUM, ${c.healthLabel}). Ask me about their holdings, service requests, milestones, call agenda, or relationship value.`;
  }

  // ── BOOK LEVEL ──────────────────────────────────────────
  const totalAUM = clients.reduce((s, c) => s + c.aum, 0);
  const totalRev = clients.reduce((s, c) => s + c.ltvMetrics.estimatedAnnualRevenue, 0);
  const atRisk = clients.filter(c => c.healthLabel === 'At Risk');
  const overdue = clients.filter(c => daysSince(c.lastTouchpoint.date) > 60);
  const openTasksCount = clients.reduce((s, c) => s + c.openTasks, 0);

  if (/attention|at.?risk|critical|urgent/.test(q)) {
    const parts = [];
    if (atRisk.length) parts.push(`**At-Risk Clients (${atRisk.length}):**\n${atRisk.map(c => `• ${c.displayName} — ${c.healthScore}/10`).join('\n')}`);
    if (overdue.length) parts.push(`**Overdue for Contact (${overdue.length}):**\n${overdue.map(c => `• ${c.displayName} — ${daysSince(c.lastTouchpoint.date)} days`).join('\n')}`);
    const highPri = clients.flatMap(c => c.serviceRequests.filter(r => r.status !== 'completed' && r.priority === 'high').map(r => ({ name: c.displayName, title: r.title })));
    if (highPri.length) parts.push(`**High-Priority Requests (${highPri.length}):**\n${highPri.slice(0, 4).map(x => `• ${x.name}: ${x.title}`).join('\n')}`);
    return parts.length ? parts.join('\n\n') : 'No urgent items — your book is in great shape!';
  }

  if (/overdue|haven.t.*spoken|no contact|follow.?up/.test(q)) {
    if (overdue.length === 0) return 'No clients are overdue for contact — great job staying on top of outreach!';
    return `**Overdue for Contact (${overdue.length}):**\n${overdue.map(c => `• ${c.displayName} — ${daysSince(c.lastTouchpoint.date)} days since contact`).join('\n')}\n\nConsider scheduling outreach for these clients.`;
  }

  if (/aum|assets under|total.*portfolio|book.*value|book size/.test(q)) {
    const byTier = {};
    clients.forEach(c => { byTier[c.tier] = (byTier[c.tier] || 0) + c.aum; });
    return `**Book of Business — ${formatCurrency(totalAUM)} AUM**\n\n**By Tier:**\n${Object.entries(byTier).sort((a, b) => b[1] - a[1]).map(([t, v]) => `• ${tierLabel(t)}: ${formatCurrency(v)} (${((v / totalAUM) * 100).toFixed(1)}%)`).join('\n')}\n\n• Est. Annual Revenue: ${formatCurrency(totalRev)}\n• Clients: ${clients.length}`;
  }

  if (/task|open item|request|service/.test(q)) {
    const allOpen = clients.flatMap(c => c.serviceRequests.filter(r => r.status !== 'completed').map(r => ({ name: c.displayName, r })));
    const highPri = allOpen.filter(x => x.r.priority === 'high');
    return `**Open Tasks: ${openTasksCount}**\n\n**High Priority (${highPri.length}):**\n${highPri.slice(0, 5).map(x => `• ${x.name}: ${x.r.title}`).join('\n') || '• None'}\n\nTotal open service requests: ${allOpen.length}`;
  }

  if (/milestone|birthday|anniversary|upcoming|this week|this month/.test(q)) {
    const soon = [];
    clients.forEach(c => {
      c.upcomingMilestones.forEach(m => {
        const d = daysUntil(m.date);
        if (d >= 0 && d <= 30) soon.push({ name: c.displayName, m, d });
      });
    });
    soon.sort((a, b) => a.d - b.d);
    if (soon.length === 0) return 'No milestones in the next 30 days.';
    return `**Upcoming Milestones (next 30 days):**\n${soon.map(x => `• ${x.name}: ${x.m.description} — ${formatDate(x.m.date)} (in ${x.d}d)`).join('\n')}`;
  }

  if (/revenue|fees|earn|income/.test(q)) {
    const top = [...clients].sort((a, b) => b.ltvMetrics.estimatedAnnualRevenue - a.ltvMetrics.estimatedAnnualRevenue);
    return `**Estimated Annual Revenue: ${formatCurrency(totalRev)}**\n\n**By Client:**\n${top.map(c => `• ${c.displayName}: ${formatCurrency(c.ltvMetrics.estimatedAnnualRevenue)}/yr`).join('\n')}`;
  }

  if (/how many|number of client|client count/.test(q)) {
    const thriving = clients.filter(c => c.healthLabel === 'Thriving').length;
    const nurture  = clients.filter(c => c.healthLabel === 'Nurture').length;
    const risk     = clients.filter(c => c.healthLabel === 'At Risk').length;
    return `**${clients.length} clients** in your book:\n• Thriving: ${thriving}\n• Nurture: ${nurture}\n• At Risk: ${risk}`;
  }

  if (/health|score|average/.test(q)) {
    const avg = (clients.reduce((s, c) => s + c.healthScore, 0) / clients.length).toFixed(1);
    return `**Average Health Score: ${avg}/10**\n\n${clients.map(c => `• ${c.displayName}: ${c.healthScore}/10 (${c.healthLabel})`).join('\n')}`;
  }

  return `I can help you with your **${clients.length}-client book** (${formatCurrency(totalAUM)} AUM). Try asking about at-risk clients, overdue contacts, AUM summary, open tasks, upcoming milestones, or revenue.`;
}

function initChat() {
  if (document.getElementById('chat-fab')) return;

  const fab = document.createElement('button');
  fab.id = 'chat-fab';
  fab.className = 'chat-fab';
  fab.setAttribute('aria-label', 'Open AI assistant');
  fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-left">
        <div class="chat-header-icon">GC</div>
        <div>
          <div class="chat-header-title">AI Assistant</div>
          <div class="chat-header-ctx" id="chat-ctx-label">Book of Business</div>
        </div>
      </div>
      <button class="chat-close" id="chat-close" aria-label="Close">×</button>
    </div>
    <div class="chat-prompts" id="chat-prompts"></div>
    <div class="chat-messages" id="chat-messages">
      <div class="chat-welcome">
        <div class="chat-welcome-icon">GC</div>
        <div class="chat-welcome-text">Hello, ${advisor.name.split(' ')[0]}. Ask me anything about your book or navigate to a client for client-level insights.</div>
      </div>
    </div>
    <div class="chat-input-row">
      <input class="chat-input" id="chat-input" type="text" placeholder="Ask a question…" autocomplete="off" />
      <button class="chat-send" id="chat-send" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>`;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  fab.addEventListener('click', () => toggleChat(true));
  document.getElementById('chat-close').addEventListener('click', () => toggleChat(false));

  const input  = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  function sendChatMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendChatMsg('user', text);
    appendTyping();
    setTimeout(() => {
      removeTyping();
      appendChatMsg('bot', chatResponse(text));
    }, 500 + Math.random() * 500);
  }

  sendBtn.addEventListener('click', sendChatMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

  updateChatContext();
}

function toggleChat(open) {
  chatState.open = open;
  const panel = document.getElementById('chat-panel');
  const fab   = document.getElementById('chat-fab');
  if (!panel || !fab) return;
  panel.classList.toggle('open', open);
  fab.classList.toggle('hidden', open);
  if (open) { updateChatContext(); setTimeout(() => document.getElementById('chat-input')?.focus(), 320); }
}

function updateChatContext() {
  const ctx = chatContextInfo();
  const label = document.getElementById('chat-ctx-label');
  const promptsEl = document.getElementById('chat-prompts');
  if (label) label.textContent = ctx.label;
  if (promptsEl) {
    promptsEl.innerHTML = ctx.prompts.map(p =>
      `<button class="chat-chip" data-prompt="${p}">${p}</button>`
    ).join('');
    promptsEl.querySelectorAll('.chat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = document.getElementById('chat-input');
        if (inp) { inp.value = btn.getAttribute('data-prompt'); document.getElementById('chat-send').click(); }
      });
    });
  }
}

function appendChatMsg(role, text) {
  chatState.messages.push({ role, text });
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const welcome = container.querySelector('.chat-welcome');
  if (welcome) welcome.remove();
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  div.innerHTML = `<div class="chat-bubble">${formatted}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendTyping() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.id = 'chat-typing';
  div.className = 'chat-msg chat-msg-bot';
  div.innerHTML = `<div class="chat-bubble chat-typing-indicator"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('chat-typing');
  if (el) el.remove();
}

// ─── DONUT INTERACTIVITY ──────────────────────────────────
function setupDonutInteractivity() {
  const svg = document.getElementById('holdings-donut');
  if (!svg) return;
  const slices  = svg.querySelectorAll('.donut-slice');
  const valEl   = document.getElementById('donut-center-val');
  const lblEl   = document.getElementById('donut-center-label');
  const legend  = document.getElementById('donut-legend');
  if (!valEl || !lblEl) return;

  const defVal = valEl.textContent;
  const defLbl = lblEl.textContent;

  // Highlight legend row matching the hovered slice label
  function highlightLegend(label) {
    if (!legend) return;
    legend.querySelectorAll('.holdings-legend-row').forEach(row => {
      row.classList.toggle('legend-dimmed', row.dataset.legendLabel !== label);
    });
  }
  function resetLegend() {
    if (!legend) return;
    legend.querySelectorAll('.holdings-legend-row').forEach(r => r.classList.remove('legend-dimmed'));
  }

  slices.forEach(slice => {
    slice.addEventListener('mouseenter', () => {
      const label = slice.dataset.sliceLabel;
      const val   = parseInt(slice.dataset.sliceVal, 10);
      const pct   = slice.dataset.slicePct;
      // Update center text
      valEl.textContent = formatCurrency(val);
      lblEl.textContent = `${pct}%`;
      // Dim other slices
      slices.forEach(s => s.classList.toggle('dimmed', s !== slice));
      highlightLegend(label);
    });

    slice.addEventListener('mouseleave', () => {
      valEl.textContent = defVal;
      lblEl.textContent = defLbl;
      slices.forEach(s => s.classList.remove('dimmed'));
      resetLegend();
    });

    // Click to drill (only on L1 slices that have data-drill-class)
    slice.addEventListener('click', () => {
      const dc = slice.dataset.drillClass;
      if (!dc) return;
      holdingsDrill = dc;
      const client = clients.find(c => c.id === state.clientId);
      const tc = document.getElementById('tab-content');
      if (tc && client) {
        tc.innerHTML = renderTabContent(client);
        setupDonutInteractivity();
      }
    });
  });

  // Legend row hover syncs with donut
  if (legend) {
    legend.querySelectorAll('.holdings-legend-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        const label = row.dataset.legendLabel;
        slices.forEach(s => s.classList.toggle('dimmed', s.dataset.sliceLabel !== label));
        highlightLegend(label);
      });
      row.addEventListener('mouseleave', () => {
        slices.forEach(s => s.classList.remove('dimmed'));
        resetLegend();
      });
    });
  }
}

// ─── OPERATIONS VIEW (CA Task Dashboard) ──────────────────
const STATUS_META = {
  pending:          { label: 'Pending',         color: '#5A6B7A' },
  in_progress:      { label: 'In Progress',     color: '#1E4A78' },
  awaiting_client:  { label: 'Awaiting Client', color: '#B8923C' },
  completed:        { label: 'Completed',       color: '#3A7A3A' },
};
const PRIORITY_META = {
  high:   { label: 'High', color: '#C0392B' },
  medium: { label: 'Med',  color: '#B8923C' },
  low:    { label: 'Low',  color: '#5A7A5A' }
};

// ── Task helpers ──────────────────────────────────────────
function opsClientName(id) { const c = clients.find(x => x.id === id); return c ? c.displayName : 'Unknown'; }
function opsStaffName(id)  { const s = CA_STAFF.find(x => x.id === id); return s ? s.name : id; }
function opsInitials(id)   { const s = CA_STAFF.find(x => x.id === id); return s ? s.initials : '??'; }

// ── Mutations + partial refresh ───────────────────────────
function updateTask(taskId, changes) {
  const task = caTasks.find(t => t.id === taskId);
  if (!task) return;
  Object.assign(task, changes);
  refreshOpsView();
  // If detail panel is open on this task, refresh it
  if (opsSelectedTask === taskId) {
    const p = document.getElementById('ops-task-panel');
    if (p) { p.innerHTML = renderTaskPanelContent(taskId); wireTaskPanel(); }
  }
}

function refreshOpsView() {
  if (state.view !== 'operations') return;
  const main = document.querySelector('.main-area');
  if (!main) return;
  main.innerHTML = renderOperationsView();
  wireOpsSelects();
  if (showNewTaskModal) wireNewTaskModal();
}

function wireOpsSelects() {
  document.querySelectorAll('[data-ops-filter]').forEach(sel => {
    sel.addEventListener('change', e => {
      opsFilters[e.target.getAttribute('data-ops-filter')] = e.target.value;
      refreshOpsView();
    });
  });
}

// ── Task detail panel ─────────────────────────────────────
function initTaskPanel() {
  if (document.getElementById('ops-task-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'ops-task-panel';
  panel.className = 'ops-task-panel';
  document.body.appendChild(panel);
  const bd = document.createElement('div');
  bd.id = 'ops-panel-backdrop';
  bd.className = 'ops-panel-backdrop';
  bd.addEventListener('click', closeTaskPanel);
  document.body.appendChild(bd);
}

function openTaskPanel(taskId) {
  opsSelectedTask = taskId;
  initTaskPanel();
  const panel = document.getElementById('ops-task-panel');
  const bd    = document.getElementById('ops-panel-backdrop');
  panel.innerHTML = renderTaskPanelContent(taskId);
  panel.classList.add('open');
  bd.classList.add('open');
  wireTaskPanel();
}

function closeTaskPanel() {
  opsSelectedTask = null;
  const p = document.getElementById('ops-task-panel');
  const b = document.getElementById('ops-panel-backdrop');
  if (p) p.classList.remove('open');
  if (b) b.classList.remove('open');
}

function wireTaskPanel() {
  const panel = document.getElementById('ops-task-panel');
  if (!panel) return;
  const form = panel.querySelector('#task-note-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const inp = panel.querySelector('#task-note-input');
      if (!inp?.value.trim()) return;
      const task = caTasks.find(t => t.id === opsSelectedTask);
      if (!task) return;
      const note = `[${TODAY}] ${inp.value.trim()}`;
      task.notes = task.notes ? task.notes + '\n' + note : note;
      inp.value = '';
      panel.innerHTML = renderTaskPanelContent(opsSelectedTask);
      wireTaskPanel();
    });
  }
  panel.querySelector('[data-tp-assign]')?.addEventListener('change', e => {
    updateTask(opsSelectedTask, { assignedTo: e.target.value });
  });
  panel.querySelector('[data-tp-due]')?.addEventListener('change', e => {
    updateTask(opsSelectedTask, { dueDate: e.target.value });
  });
}

function renderTaskPanelContent(taskId) {
  const task = caTasks.find(t => t.id === taskId);
  if (!task) return '<div style="padding:24px;color:var(--text-muted)">Task not found.</div>';
  const sm     = STATUS_META[task.status] || STATUS_META.pending;
  const pm     = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const tm     = CA_TASK_TYPES[task.type] || CA_TASK_TYPES.general;
  const client = clients.find(c => c.id === task.clientId);
  const isOver = task.status !== 'completed' && task.dueDate < TODAY;
  const isDone = task.status === 'completed';
  const daysOver = isOver ? Math.round((new Date(TODAY) - new Date(task.dueDate)) / 86400000) : 0;

  const statusBtns = Object.entries(STATUS_META).map(([k, v]) =>
    `<button class="tp-status-btn${task.status===k?' active':''}"
       data-task-set-status="${taskId}:${k}"
       style="${task.status===k?`background:${v.color};color:#fff;border-color:${v.color}`:''}">
       ${v.label}</button>`
  ).join('');

  const noteLines = task.notes ? task.notes.split('\n').filter(Boolean) : [];
  const notesHtml = noteLines.length
    ? noteLines.slice().reverse().map(n => {
        const m = n.match(/^\[(\d{4}-\d{2}-\d{2})\] (.+)$/);
        return m
          ? `<div class="tp-note-entry"><span class="tp-note-date">${m[1]}</span><span class="tp-note-text">${m[2]}</span></div>`
          : `<div class="tp-note-entry"><span class="tp-note-text">${n}</span></div>`;
      }).join('')
    : '<div class="tp-note-empty">No notes yet — log context, blockers, or follow-ups here.</div>';

  const assignOpts = CA_STAFF.map(s =>
    `<option value="${s.id}"${task.assignedTo===s.id?' selected':''}>${s.name} (${s.role})</option>`
  ).join('');

  return `
  <div class="tp-header">
    <div class="tp-hdr-top">
      <span class="tp-type-badge" style="background:${tm.color}22;color:${tm.color}">${tm.label}</span>
      <button class="tp-close-btn" data-task-panel-close title="Close">✕</button>
    </div>
    <div class="tp-title">${task.title}</div>
    <div class="tp-sub-row">
      <span class="tp-sub-text">${task.subType}</span>
      ${task.recurring ? '<span class="tp-recurring-badge">↻ Recurring</span>' : ''}
      ${isDone ? `<span class="tp-done-badge">✓ Completed ${task.completedDate}</span>` : ''}
    </div>
  </div>
  <div class="tp-body">
    <div class="tp-section">
      <div class="tp-section-label">Status</div>
      <div class="tp-status-bar">${statusBtns}</div>
    </div>

    ${isOver ? `<div class="tp-alert-banner">⚠ Overdue by ${daysOver} day${daysOver!==1?'s':''} &mdash; action required</div>` : ''}

    <div class="tp-meta-grid">
      <div class="tp-meta-item">
        <div class="tp-meta-label">Client</div>
        <div class="tp-meta-val">${client ? client.displayName : '—'}</div>
      </div>
      <div class="tp-meta-item">
        <div class="tp-meta-label">Priority</div>
        <div class="tp-meta-val" style="color:${pm.color};font-weight:700">${pm.label}</div>
      </div>
      <div class="tp-meta-item">
        <div class="tp-meta-label">Due Date</div>
        <div class="tp-meta-val">
          <input type="date" class="tp-date-edit${isOver?' tp-date-overdue':''}" value="${task.dueDate}" data-tp-due>
        </div>
      </div>
      <div class="tp-meta-item">
        <div class="tp-meta-label">Est. Hours</div>
        <div class="tp-meta-val">${task.estHours ? task.estHours+'h' : '—'}${task.actHours ? ` / ${task.actHours}h actual` : ''}</div>
      </div>
      <div class="tp-meta-item tp-meta-full">
        <div class="tp-meta-label">Assigned To</div>
        <div class="tp-meta-val"><select class="tp-select-edit" data-tp-assign>${assignOpts}</select></div>
      </div>
    </div>

    <div class="tp-section">
      <div class="tp-section-label">Notes &amp; Activity</div>
      <div class="tp-notes-list">${notesHtml}</div>
      <form id="task-note-form" class="tp-note-form">
        <input id="task-note-input" class="tp-note-input" type="text"
               placeholder="Add a note, update, or blocker…" autocomplete="off">
        <button type="submit" class="tp-note-submit">Log</button>
      </form>
    </div>

    <div class="tp-quick-actions">
      ${!isDone ? `<button class="tp-act-primary" data-task-set-status="${taskId}:completed">✓ Mark Complete</button>` : ''}
      ${task.status === 'awaiting_client' ? `<button class="tp-act-secondary" data-task-log-followup="${taskId}">📞 Log Follow-up</button>` : ''}
      ${task.status === 'pending' ? `<button class="tp-act-secondary" data-task-set-status="${taskId}:in_progress">▶ Start Task</button>` : ''}
    </div>
  </div>`;
}

// ── Needs Action view ─────────────────────────────────────
function renderNeedsActionView() {
  // Apply staff filter; status filter ignored (we bucket by urgency)
  const open = caTasks.filter(t => t.status !== 'completed');
  const pool = opsFilters.assignee === 'all' ? open : open.filter(t => t.assignedTo === opsFilters.assignee);

  const overdue  = pool.filter(t => t.dueDate < TODAY).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  const dueToday = pool.filter(t => t.dueDate === TODAY);
  const awaiting = pool.filter(t => t.status === 'awaiting_client' && !overdue.includes(t) && !dueToday.includes(t))
                       .sort((a,b) => a.createdDate.localeCompare(b.createdDate));
  const active   = pool.filter(t => t.status === 'in_progress' && !overdue.includes(t) && !dueToday.includes(t));
  const highPend = pool.filter(t => t.priority === 'high' && t.status === 'pending'
                                  && !overdue.includes(t) && !dueToday.includes(t));

  if (!overdue.length && !dueToday.length && !awaiting.length && !active.length && !highPend.length) {
    return `<div class="ops-all-clear">
      <div class="ops-ac-icon">✓</div>
      <div class="ops-ac-title">All clear — nothing urgent right now</div>
      <div class="ops-ac-sub">Switch to By Family or By Task Type to review all tasks</div>
    </div>`;
  }

  function actionCard(t, group) {
    const tm  = CA_TASK_TYPES[t.type] || CA_TASK_TYPES.general;
    const pm  = PRIORITY_META[t.priority] || PRIORITY_META.medium;
    const cli = clients.find(c => c.id === t.clientId);
    const stf = CA_STAFF.find(s => s.id === t.assignedTo);
    const daysDiff = Math.round((new Date(TODAY) - new Date(t.dueDate)) / 86400000);
    const daysPending = Math.round((new Date(TODAY) - new Date(t.createdDate)) / 86400000);

    const urgencyMap = {
      overdue:  { label: `Overdue ${daysDiff} day${daysDiff!==1?'s':''}`,  cls: 'ac-urg-overdue'  },
      today:    { label: 'Due today',                                        cls: 'ac-urg-today'    },
      awaiting: { label: `Awaiting ${daysPending} day${daysPending!==1?'s':''}`, cls: 'ac-urg-await' },
      active:   { label: `In progress · due ${t.dueDate}`,                  cls: 'ac-urg-active'   },
      high:     { label: `High priority · pending`,                          cls: 'ac-urg-high'     },
    };
    const urg = urgencyMap[group];

    const btns = [];
    if (t.status === 'pending')          btns.push(`<button class="ac-btn ac-btn-start"   data-task-set-status="${t.id}:in_progress">▶ Start</button>`);
    if (t.status === 'awaiting_client')  btns.push(`<button class="ac-btn ac-btn-followup" data-task-log-followup="${t.id}">📞 Log Follow-up</button>`);
    btns.push(`<button class="ac-btn ac-btn-done" data-task-set-status="${t.id}:completed">✓ Done</button>`);
    btns.push(`<button class="ac-btn ac-btn-open" data-task-open="${t.id}">Detail →</button>`);

    return `
    <div class="ac-card ${urg.cls}" data-task-id="${t.id}">
      <div class="ac-card-body">
        <div class="ac-urg-tag ${urg.cls}">${urg.label}</div>
        <div class="ac-title">${t.title}</div>
        <div class="ac-meta">
          <span class="ac-meta-client">${cli ? cli.displayName.split(' ')[1] : '?'}</span>
          <span class="ac-dot">·</span>
          <span style="color:${tm.color};font-size:12px">${tm.label} · ${t.subType}</span>
          <span class="ac-dot">·</span>
          <span class="ac-meta-staff">${stf ? stf.name.split(' ')[0] : t.assignedTo}</span>
          <span class="ac-meta-pri" style="color:${pm.color}"> · ${pm.label}</span>
        </div>
      </div>
      <div class="ac-card-actions">${btns.join('')}</div>
    </div>`;
  }

  function acSection(title, color, items, group) {
    if (!items.length) return '';
    return `
    <div class="ops-ac-section">
      <div class="ops-ac-section-hdr" style="color:${color}">
        <span class="ops-ac-dot" style="background:${color}"></span>${title}
        <span class="ops-ac-count">${items.length}</span>
      </div>
      <div class="ops-ac-cards">${items.map(t => actionCard(t, group)).join('')}</div>
    </div>`;
  }

  return `<div class="ops-needs-action">
    ${acSection('Overdue',                   '#C0392B', overdue,  'overdue')}
    ${acSection('Due Today',                 '#E67E22', dueToday, 'today')}
    ${acSection('Awaiting Client Response',  '#B8923C', awaiting, 'awaiting')}
    ${acSection('In Progress',               '#1E4A78', active,   'active')}
    ${acSection('High Priority — Not Started','#8B5CF6', highPend, 'high')}
  </div>`;
}

// ── New Task Modal ─────────────────────────────────────────
function renderNewTaskModal() {
  const typeKey = newTaskDraft.type || 'cash';
  const subs    = CA_TASK_TYPES[typeKey]?.subTypes || [];
  return `
  <div class="modal-overlay" id="new-task-overlay">
    <div class="modal-box">
      <div class="modal-header">
        <span class="modal-title">New Task</span>
        <button class="modal-close" data-modal-cancel>✕</button>
      </div>
      <form id="new-task-form" class="modal-form">
        <div class="modal-row">
          <label class="modal-field">Client <span class="modal-req">*</span>
            <select name="clientId" class="modal-input" required>
              <option value="">Select client…</option>
              ${clients.map(c => `<option value="${c.id}"${newTaskDraft.clientId==c.id?' selected':''}>${c.displayName}</option>`).join('')}
            </select>
          </label>
          <label class="modal-field">Task Type <span class="modal-req">*</span>
            <select name="type" class="modal-input" id="nt-type" required>
              ${Object.entries(CA_TASK_TYPES).map(([k,v]) => `<option value="${k}"${typeKey===k?' selected':''}>${v.label}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="modal-row">
          <label class="modal-field">Sub-type <span class="modal-req">*</span>
            <select name="subType" class="modal-input" id="nt-subtype" required>
              ${subs.map(s => `<option value="${s}"${newTaskDraft.subType===s?' selected':''}>${s}</option>`).join('')}
            </select>
          </label>
          <label class="modal-field">Priority
            <select name="priority" class="modal-input">
              <option value="high"${newTaskDraft.priority==='high'?' selected':''}>High</option>
              <option value="medium"${newTaskDraft.priority!=='high'&&newTaskDraft.priority!=='low'?' selected':''}>Medium</option>
              <option value="low"${newTaskDraft.priority==='low'?' selected':''}>Low</option>
            </select>
          </label>
        </div>
        <label class="modal-field modal-field-full">Title <span class="modal-req">*</span>
          <input name="title" type="text" class="modal-input" id="nt-title" required
                 value="${newTaskDraft.title||''}" placeholder="Describe the task…">
        </label>
        <div class="modal-row">
          <label class="modal-field">Assign To <span class="modal-req">*</span>
            <select name="assignedTo" class="modal-input" required>
              <option value="">Select staff…</option>
              ${CA_STAFF.map(s => `<option value="${s.id}"${newTaskDraft.assignedTo===s.id?' selected':''}>${s.name} (${s.role})</option>`).join('')}
            </select>
          </label>
          <label class="modal-field">Due Date <span class="modal-req">*</span>
            <input name="dueDate" type="date" class="modal-input" required value="${newTaskDraft.dueDate||''}">
          </label>
        </div>
        <div class="modal-row">
          <label class="modal-field">Est. Hours
            <input name="estHours" type="number" min="0.1" step="0.5" class="modal-input"
                   placeholder="e.g. 1.5" value="${newTaskDraft.estHours||''}">
          </label>
          <label class="modal-field modal-field-check">
            <input name="recurring" type="checkbox" ${newTaskDraft.recurring?'checked':''}>
            Recurring task
          </label>
        </div>
        <label class="modal-field modal-field-full">Notes
          <textarea name="notes" class="modal-input modal-textarea"
                    placeholder="Context, instructions, or dependencies…">${newTaskDraft.notes||''}</textarea>
        </label>
        <div class="modal-footer">
          <button type="button" class="modal-btn-cancel" data-modal-cancel>Cancel</button>
          <button type="submit" class="modal-btn-submit">Create Task</button>
        </div>
      </form>
    </div>
  </div>`;
}

function wireNewTaskModal() {
  const overlay       = document.getElementById('new-task-overlay');
  if (!overlay) return;
  const typeSelect    = overlay.querySelector('#nt-type');
  const subTypeSelect = overlay.querySelector('#nt-subtype');
  const titleInput    = overlay.querySelector('#nt-title');
  const clientSelect  = overlay.querySelector('[name="clientId"]');

  function autoFillTitle() {
    if (titleInput.dataset.edited) return;
    const client = clients.find(c => c.id === parseInt(clientSelect?.value));
    const lastName = client ? client.displayName.split(' ')[1] : '';
    const sub = subTypeSelect?.value || '';
    if (sub) titleInput.value = lastName ? `${sub} — ${lastName}` : sub;
  }

  typeSelect?.addEventListener('change', e => {
    const subs = CA_TASK_TYPES[e.target.value]?.subTypes || [];
    subTypeSelect.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
    autoFillTitle();
  });
  subTypeSelect?.addEventListener('change', autoFillTitle);
  clientSelect?.addEventListener('change',  autoFillTitle);
  titleInput?.addEventListener('input', () => { titleInput.dataset.edited = '1'; });

  overlay.querySelector('#new-task-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const clientId = parseInt(data.get('clientId'));
    const cliName  = clients.find(c => c.id === clientId)?.displayName.split(' ')[1] || '';
    caTasks.push({
      id:            `cat${String(caTasksNextId).padStart(3, '0')}`,
      clientId,
      type:          data.get('type'),
      subType:       data.get('subType'),
      title:         data.get('title') || `${data.get('subType')} — ${cliName}`,
      assignedTo:    data.get('assignedTo'),
      priority:      data.get('priority'),
      status:        'pending',
      createdDate:   TODAY,
      dueDate:       data.get('dueDate'),
      completedDate: null,
      estHours:      parseFloat(data.get('estHours')) || null,
      actHours:      null,
      recurring:     data.has('recurring'),
      notes:         data.get('notes') || ''
    });
    caTasksNextId++;
    showNewTaskModal = false;
    newTaskDraft = { clientId:'', type:'cash', subType:'', title:'', assignedTo:'', priority:'medium', dueDate:'', estHours:'', recurring:false, notes:'' };
    refreshOpsView();
  });

  overlay.querySelectorAll('[data-modal-cancel]').forEach(btn => {
    btn.addEventListener('click', () => { showNewTaskModal = false; refreshOpsView(); });
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { showNewTaskModal = false; refreshOpsView(); }
  });
}

// ─── NOTIFICATION PANEL ───────────────────────────────────
function renderNotifPanelContent() {
  const recent = [...clientMessages].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,10);
  const unread = recent.filter(m => !m.read).length;
  const BELL_FULL = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7.5 2a4 4 0 0 1 4 4V8.5L13 11H2L3.5 8.5V6a4 4 0 0 1 4-4z"/>
    <path d="M6 11a1.5 1.5 0 0 0 3 0"/>
  </svg>`;
  return `
  <div class="np-header">
    <div class="np-title-row">
      <span class="np-icon">${BELL_FULL}</span>
      <span class="np-title">Inbox</span>
      ${unread > 0 ? `<span class="np-unread-pill">${unread} new</span>` : ''}
    </div>
    <button class="np-close" data-notif-close>✕</button>
  </div>
  <div class="np-list">
    ${recent.map(m => {
      const c = msgClient(m);
      const hc = c ? healthColor(c.healthScore) : 'green';
      return `<div class="np-item${!m.read ? ' np-item--unread' : ''}" data-notif-open="${m.id}">
        <div class="np-item-avatar ${hc}">${c ? c.initials : '?'}</div>
        <div class="np-item-body">
          <div class="np-item-top">
            <span class="np-item-client">${c ? c.displayName.split(' ')[1] : '?'}</span>
            <span class="np-item-date">${formatDateShort(m.date)}</span>
          </div>
          <div class="np-item-subject">${m.subject.slice(0,54)}${m.subject.length>54?'…':''}</div>
          <div class="np-item-type">${MSG_TYPE_ICON[m.type]} ${m.type === 'document' ? 'Document' : 'Message'}${m.priority==='urgent'?' · <span style="color:#A83228;font-weight:700">Urgent</span>':''}</div>
        </div>
        ${!m.read ? '<div class="np-unread-dot"></div>' : ''}
      </div>`;
    }).join('')}
  </div>
  <div class="np-footer">
    <button class="np-view-all" data-notif-go-inbox>View all in Inbox →</button>
  </div>`;
}

function openNotifPanel() {
  let panel = document.getElementById('notif-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.className = 'notif-panel';
    document.body.appendChild(panel);
    const bd = document.createElement('div');
    bd.id = 'notif-backdrop';
    bd.className = 'notif-backdrop';
    bd.addEventListener('click', closeNotifPanel);
    document.body.appendChild(bd);
  }
  panel.innerHTML = renderNotifPanelContent();
  panel.classList.add('open');
  document.getElementById('notif-backdrop')?.classList.add('open');
}

function closeNotifPanel() {
  document.getElementById('notif-panel')?.classList.remove('open');
  document.getElementById('notif-backdrop')?.classList.remove('open');
}

// ── Global task event listener ─────────────────────────────
function attachGlobalTaskListeners() {
  document.body.addEventListener('click', e => {
    if (e.target.closest('[data-task-panel-close]')) { closeTaskPanel(); return; }

    const openBtn = e.target.closest('[data-task-open]');
    if (openBtn) { openTaskPanel(openBtn.getAttribute('data-task-open')); return; }

    const statusBtn = e.target.closest('[data-task-set-status]');
    if (statusBtn) {
      const [taskId, newStatus] = statusBtn.getAttribute('data-task-set-status').split(':');
      const changes = { status: newStatus };
      if (newStatus === 'completed') changes.completedDate = TODAY;
      updateTask(taskId, changes);
      return;
    }

    const followupBtn = e.target.closest('[data-task-log-followup]');
    if (followupBtn) {
      const taskId = followupBtn.getAttribute('data-task-log-followup');
      const task = caTasks.find(t => t.id === taskId);
      if (task) {
        const stf  = CA_STAFF.find(s => s.id === task.assignedTo);
        const note = `[${TODAY}] Follow-up attempted (${stf ? stf.initials : '?'})`;
        updateTask(taskId, { notes: task.notes ? task.notes + '\n' + note : note });
      }
      return;
    }

    // Click task row body (not a button) → open detail
    const row = e.target.closest('.ops-task-row[data-task-id]');
    if (row && !e.target.closest('button') && !e.target.closest('select') && !e.target.closest('input')) {
      openTaskPanel(row.getAttribute('data-task-id'));
      return;
    }

    // Click action card body (not a button) → open detail
    const card = e.target.closest('.ac-card[data-task-id]');
    if (card && !e.target.closest('button')) {
      openTaskPanel(card.getAttribute('data-task-id'));
      return;
    }

    // Notification bell toggle
    if (e.target.closest('[data-notif-toggle]')) {
      const panel = document.getElementById('notif-panel');
      if (panel?.classList.contains('open')) { closeNotifPanel(); } else { openNotifPanel(); }
      return;
    }

    // Notification panel close
    if (e.target.closest('[data-notif-close]')) { closeNotifPanel(); return; }

    // Notification panel: go to inbox
    if (e.target.closest('[data-notif-go-inbox]')) {
      closeNotifPanel();
      navigate('inbox');
      return;
    }

    // Notification panel: open a specific message
    const notifItem = e.target.closest('[data-notif-open]');
    if (notifItem) {
      const msgId = notifItem.getAttribute('data-notif-open');
      updateMessage(msgId, { read: true, status: clientMessages.find(m=>m.id===msgId)?.status === 'unread' ? 'read' : clientMessages.find(m=>m.id===msgId)?.status });
      inboxSelectedId = msgId;
      closeNotifPanel();
      navigate('inbox');
      return;
    }

    // Message actions (reply, task, file, archive)
    const msgActionBtn = e.target.closest('[data-msg-action]');
    if (msgActionBtn) {
      const [action, msgId] = msgActionBtn.getAttribute('data-msg-action').split(':');
      const msg = clientMessages.find(m => m.id === msgId);
      if (!msg) return;
      if (action === 'archive') {
        updateMessage(msgId, { status: 'archived', read: true });
        if (inboxSelectedId === msgId) inboxSelectedId = null;
        renderApp();
      } else if (action === 'file') {
        updateMessage(msgId, { status: 'task_created', read: true });
        renderApp();
      } else if (action === 'task') {
        updateMessage(msgId, { status: 'task_created', read: true });
        renderApp();
      } else if (action === 'reply') {
        updateMessage(msgId, { status: 'replied', read: true });
        renderApp();
      }
      return;
    }
  });
}

// ─── INBOX VIEW ───────────────────────────────────────────

const MSG_TYPE_ICON = {
  message:  `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="2" width="11" height="8" rx="1.5"/><polyline points="1,3 6.5,7.5 12,3"/></svg>`,
  document: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2.5" y="1" width="8" height="11" rx="1.2"/><line x1="4.5" y1="4.5" x2="8.5" y2="4.5"/><line x1="4.5" y1="6.5" x2="8.5" y2="6.5"/><line x1="4.5" y1="8.5" x2="7" y2="8.5"/></svg>`
};

const MSG_STATUS_META = {
  unread:       { label: 'Unread',       cls: 'status-unread'  },
  read:         { label: 'Read',         cls: 'status-read'    },
  replied:      { label: 'Replied',      cls: 'status-replied' },
  task_created: { label: 'Task Created', cls: 'status-task'    },
  archived:     { label: 'Archived',     cls: 'status-arch'    },
};

const FILE_ICON = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1.5" y="0.5" width="9" height="11" rx="1"/><line x1="3.5" y1="4" x2="8.5" y2="4"/><line x1="3.5" y1="6" x2="8.5" y2="6"/><line x1="3.5" y1="8" x2="6.5" y2="8"/></svg>`;

function msgClient(m) { return clients.find(c => c.id === m.clientId); }

function renderMsgRow(m, selected) {
  const c = msgClient(m);
  const hc = c ? healthColor(c.healthScore) : 'green';
  const isUrgent = m.priority === 'urgent';
  return `<div class="inbox-msg-row${!m.read ? ' unread' : ''}${selected ? ' selected' : ''}${isUrgent ? ' urgent' : ''}" data-inbox-select="${m.id}">
    <div class="imr-avatar ${hc}">${c ? c.initials : '?'}</div>
    <div class="imr-body">
      <div class="imr-top">
        <span class="imr-client">${c ? c.displayName.split(' ')[1] : 'Unknown'}</span>
        <span class="imr-date">${formatDateShort(m.date)}</span>
      </div>
      <div class="imr-subject">${isUrgent ? '<span class="imr-urgent-dot"></span>' : ''}${m.subject}</div>
      <div class="imr-preview">${m.body.replace(/\n/g,' ').slice(0, 72)}…</div>
      <div class="imr-meta-row">
        <span class="imr-type-icon">${MSG_TYPE_ICON[m.type]}</span>
        ${m.attachments.length > 0 ? `<span class="imr-attach-count">${m.attachments.length} attachment${m.attachments.length>1?'s':''}</span>` : ''}
        <span class="imr-status ${MSG_STATUS_META[m.status]?.cls||''}">${MSG_STATUS_META[m.status]?.label||m.status}</span>
      </div>
    </div>
    ${!m.read ? '<div class="imr-unread-dot"></div>' : ''}
  </div>`;
}

function renderMsgDetail(m) {
  const c = msgClient(m);
  const hc = c ? healthColor(c.healthScore) : 'green';
  const isUrgent = m.priority === 'urgent';
  return `<div class="msg-detail">
    <div class="msg-detail-header">
      <div class="mdh-left">
        <div class="mdh-avatar ${hc}">${c ? c.initials : '?'}</div>
        <div class="mdh-info">
          <div class="mdh-from">${c ? c.displayName : 'Unknown Client'}</div>
          <div class="mdh-meta">${m.type === 'document' ? 'Document Upload' : 'Message'} · ${formatDate(m.date)}</div>
        </div>
      </div>
      <div class="mdh-right">
        ${isUrgent ? `<span class="msg-priority-badge urgent">Urgent</span>` : ''}
        <span class="msg-status-badge ${MSG_STATUS_META[m.status]?.cls||''}">${MSG_STATUS_META[m.status]?.label||m.status}</span>
      </div>
    </div>

    <div class="msg-subject">${m.subject}</div>

    <div class="msg-body">${m.body.replace(/\n/g, '<br>')}</div>

    ${m.attachments.length > 0 ? `
    <div class="msg-attachments">
      <div class="msg-attach-label">Attachments (${m.attachments.length})</div>
      <div class="msg-attach-list">
        ${m.attachments.map(a => `
        <div class="msg-attach-card">
          <span class="mac-icon">${FILE_ICON}</span>
          <div class="mac-info">
            <div class="mac-name">${a.name}</div>
            <div class="mac-meta">${a.category} · ${a.size}</div>
          </div>
          <button class="mac-dl" title="Download">↓</button>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <div class="msg-action-bar">
      <button class="mab-btn mab-primary" data-msg-action="reply:${m.id}">↩ Reply</button>
      <button class="mab-btn" data-msg-action="task:${m.id}">+ Create CA Task</button>
      <button class="mab-btn" data-msg-action="file:${m.id}">📁 File to Record</button>
      ${m.status !== 'archived' ? `<button class="mab-btn mab-ghost" data-msg-action="archive:${m.id}">Archive</button>` : ''}
    </div>

    ${m.tags.length > 0 ? `
    <div class="msg-tags">
      ${m.tags.map(t => `<span class="msg-tag">${t}</span>`).join('')}
    </div>` : ''}
  </div>`;
}

function renderInboxView() {
  const allSorted = [...clientMessages].sort((a,b) => new Date(b.date) - new Date(a.date));
  const filtered = allSorted.filter(m => {
    if (inboxFilter === 'unread')     return !m.read;
    if (inboxFilter === 'documents')  return m.type === 'document';
    if (inboxFilter === 'urgent')     return m.priority === 'urgent';
    return true;
  });
  const selected = inboxSelectedId ? clientMessages.find(m => m.id === inboxSelectedId) : null;
  const unreadCt = clientMessages.filter(m => !m.read).length;
  const urgentCt = clientMessages.filter(m => m.priority === 'urgent' && !m.read).length;

  return `
  <div class="main-header">
    ${menuBtn}
    <div class="header-title">Inbox</div>
    <div class="header-spacer"></div>
    ${headerEnd()}
  </div>
  <div class="inbox-shell">
    <div class="inbox-rail">
      <div class="inbox-rail-top">
        <div class="inbox-summary">
          <span class="inbox-summary-unread">${unreadCt} unread</span>
          ${urgentCt > 0 ? `<span class="inbox-summary-urgent"> · ${urgentCt} urgent</span>` : ''}
        </div>
        <div class="inbox-filter-row">
          <button class="ibf-btn${inboxFilter==='all'?      ' active':''}" data-inbox-filter="all">All</button>
          <button class="ibf-btn${inboxFilter==='unread'?   ' active':''}" data-inbox-filter="unread">Unread${unreadCt>0?` <span class="ibf-ct">${unreadCt}</span>`:''}</button>
          <button class="ibf-btn${inboxFilter==='documents'?' active':''}" data-inbox-filter="documents">Docs</button>
          <button class="ibf-btn${inboxFilter==='urgent'?   ' active':''}" data-inbox-filter="urgent">Urgent</button>
        </div>
      </div>
      <div class="inbox-list">
        ${filtered.length === 0
          ? `<div class="inbox-list-empty">No messages match this filter</div>`
          : filtered.map(m => renderMsgRow(m, m.id === inboxSelectedId)).join('')}
      </div>
    </div>

    <div class="inbox-detail-pane">
      ${selected
        ? renderMsgDetail(selected)
        : `<div class="inbox-detail-empty">
            <div class="ide-icon">${MSG_TYPE_ICON.message}</div>
            <div class="ide-title">Select a message</div>
            <div class="ide-sub">${filtered.length} message${filtered.length!==1?'s':''} · ${unreadCt} unread</div>
           </div>`}
    </div>
  </div>`;
}

function renderClientInboxTab(client) {
  const msgs = [...clientMessages]
    .filter(m => m.clientId === client.id)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  if (msgs.length === 0) return `
    <div class="panel-card" style="margin-top:16px">
      <div class="panel-title">Client Inbox</div>
      <div class="r-empty">No messages or documents from ${client.displayName.split(' ')[1]} yet.</div>
    </div>`;

  const selectedMsg = inboxSelectedId ? msgs.find(m => m.id === inboxSelectedId) : null;

  return `
  <div class="client-inbox-shell">
    <div class="client-inbox-list panel-card" style="padding:0;overflow:hidden">
      <div style="padding:14px 18px 10px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:10px">
        <div class="panel-title" style="margin:0">Inbox</div>
        <span style="font-size:11px;color:var(--text-muted)">${msgs.length} message${msgs.length!==1?'s':''} · ${msgs.filter(m=>!m.read).length} unread</span>
      </div>
      ${msgs.map(m => renderMsgRow(m, m.id === inboxSelectedId)).join('')}
    </div>
    <div class="client-inbox-detail">
      ${selectedMsg
        ? renderMsgDetail(selectedMsg)
        : `<div class="inbox-detail-empty" style="height:300px">
             <div class="ide-icon">${MSG_TYPE_ICON.message}</div>
             <div class="ide-title">Select a message to read</div>
           </div>`}
    </div>
  </div>`;
}

function renderOperationsView() {
  // ── Filtered task list ────────────────────────────────
  let tasks = [...caTasks];
  if (opsFilters.assignee !== 'all') tasks = tasks.filter(t => t.assignedTo === opsFilters.assignee);
  if (opsFilters.status   !== 'all') tasks = tasks.filter(t => t.status === opsFilters.status);

  // Sort: overdue + high priority first, then by due date
  tasks.sort((a, b) => {
    const aOver = a.status !== 'completed' && a.dueDate < TODAY;
    const bOver = b.status !== 'completed' && b.dueDate < TODAY;
    if (aOver !== bOver) return aOver ? -1 : 1;
    const priOrd = { high: 0, medium: 1, low: 2 };
    if (priOrd[a.priority] !== priOrd[b.priority]) return priOrd[a.priority] - priOrd[b.priority];
    return a.dueDate.localeCompare(b.dueDate);
  });

  // ── Stats ─────────────────────────────────────────────
  const allTasks = caTasks;
  const open     = allTasks.filter(t => t.status !== 'completed').length;
  const overdue  = allTasks.filter(t => t.status !== 'completed' && t.dueDate < TODAY).length;
  const done     = allTasks.filter(t => t.status === 'completed').length;
  const awaiting = allTasks.filter(t => t.status === 'awaiting_client').length;

  // ── Compact task row ──────────────────────────────────
  function taskRow(t, showClient, showType) {
    const sm      = STATUS_META[t.status] || STATUS_META.pending;
    const pm      = PRIORITY_META[t.priority] || PRIORITY_META.medium;
    const tm      = CA_TASK_TYPES[t.type] || CA_TASK_TYPES.general;
    const isOver  = t.status !== 'completed' && t.dueDate < TODAY;
    const isDone  = t.status === 'completed';
    return `
    <tr class="ops-task-row${isOver ? ' ops-row-overdue' : ''}${isDone ? ' ops-row-done' : ''}" data-task-id="${t.id}">
      <td class="ops-row-status">
        <span class="ops-status-dot" style="background:${sm.color}" title="${sm.label}"></span>
      </td>
      <td class="ops-row-title">
        <span class="ops-row-task-title">${t.title}</span>
        <span class="ops-row-sub">${t.subType}</span>
      </td>
      ${showType  ? `<td class="ops-row-type"><span class="ops-type-chip" style="border-color:${tm.color};color:${tm.color}">${tm.label}</span></td>` : ''}
      ${showClient? `<td class="ops-row-client">${opsClientName(t.clientId).split(' ')[1]}</td>` : ''}
      <td class="ops-row-assignee">
        <span class="ops-avatar-chip" title="${opsStaffName(t.assignedTo)}">${opsInitials(t.assignedTo)}</span>
      </td>
      <td class="ops-row-due${isOver ? ' overdue-text' : ''}">
        ${isDone ? '<span style="color:var(--text-muted)">Done</span>' : t.dueDate}
        ${isOver ? '<span class="ops-overdue-flag">!</span>' : ''}
      </td>
      <td class="ops-row-priority">
        <span class="ops-pri-dot" style="background:${pm.color}" title="${pm.label}"></span>
      </td>
      <td class="ops-row-actions">
        ${!isDone ? `<button class="ops-row-btn ops-row-btn-done" data-task-set-status="${t.id}:completed" title="Mark complete">✓</button>` : ''}
        <button class="ops-row-btn ops-row-btn-open" data-task-open="${t.id}" title="Open detail">→</button>
      </td>
    </tr>`;
  }

  // ── Group header ──────────────────────────────────────
  function groupHeader(label, color, groupTasks) {
    const gOpen    = groupTasks.filter(t => t.status !== 'completed').length;
    const gOverdue = groupTasks.filter(t => t.status !== 'completed' && t.dueDate < TODAY).length;
    const gHigh    = groupTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    return `
    <div class="ops-group-header" style="border-left:3px solid ${color}">
      <span class="ops-group-name">${label}</span>
      <span class="ops-group-chips">
        <span class="ops-group-chip">${groupTasks.length} task${groupTasks.length!==1?'s':''}</span>
        ${gOpen   ? `<span class="ops-group-chip ops-chip-open">${gOpen} open</span>` : ''}
        ${gOverdue? `<span class="ops-group-chip ops-chip-overdue">${gOverdue} overdue</span>` : ''}
        ${gHigh   ? `<span class="ops-group-chip ops-chip-high">${gHigh} high</span>` : ''}
      </span>
    </div>`;
  }

  // ── Build grouped content ─────────────────────────────
  let groupedContent = '';

  if (opsView === 'action') {
    groupedContent = renderNeedsActionView();
  } else if (opsView === 'family') {
    clients.forEach(c => {
      const gt = tasks.filter(t => t.clientId === c.id);
      if (!gt.length) return;
      groupedContent += groupHeader(c.displayName, '#0C2340', gt);
      groupedContent += `<table class="ops-task-table">
        <thead><tr><th></th><th>Task</th><th>Type / Sub-type</th><th>Assigned</th><th>Due</th><th></th><th></th></tr></thead>
        <tbody>${gt.map(t => taskRow(t, false, true)).join('')}</tbody>
      </table>`;
    });
  } else if (opsView === 'type') {
    Object.entries(CA_TASK_TYPES).forEach(([key, tm]) => {
      const gt = tasks.filter(t => t.type === key);
      if (!gt.length) return;
      groupedContent += groupHeader(tm.label, tm.color, gt);
      groupedContent += `<table class="ops-task-table">
        <thead><tr><th></th><th>Task</th><th>Client</th><th>Assigned</th><th>Due</th><th></th><th></th></tr></thead>
        <tbody>${gt.map(t => taskRow(t, true, false)).join('')}</tbody>
      </table>`;
    });
  } else {
    groupedContent = renderOpsStaff(tasks);
  }

  const viewToggle = `
  <div class="ops-view-toggle">
    <button class="ops-view-btn${opsView==='action'?' active':''}" data-ops-view="action">Needs Action</button>
    <button class="ops-view-btn${opsView==='family'?' active':''}" data-ops-view="family">By Family</button>
    <button class="ops-view-btn${opsView==='type'?' active':''}" data-ops-view="type">By Task Type</button>
    <button class="ops-view-btn${opsView==='staff'?' active':''}" data-ops-view="staff">By Staff</button>
  </div>`;

  const filterBar = `
  <div class="ops-filter-bar">
    <select class="ops-filter-sel" data-ops-filter="assignee">
      <option value="all">All Staff</option>
      ${CA_STAFF.map(s => `<option value="${s.id}"${opsFilters.assignee===s.id?' selected':''}>${s.name}</option>`).join('')}
    </select>
    <select class="ops-filter-sel" data-ops-filter="status">
      <option value="all">All Status</option>
      ${Object.entries(STATUS_META).map(([k,v]) => `<option value="${k}"${opsFilters.status===k?' selected':''}>${v.label}</option>`).join('')}
    </select>
    <button class="ops-add-btn" data-ops-new-task>+ New Task</button>
  </div>`;

  return `
  <div class="main-content">
    <div class="page-header">
      <div class="page-title-row">
        <div>
          <h1 class="page-title">CA Task Dashboard</h1>
          <p class="page-subtitle">Client Associate operations &amp; task tracking</p>
        </div>
        ${viewToggle}
      </div>
    </div>
    <div class="ops-stats-bar">
      <div class="ops-stat"><span class="ops-stat-val">${open}</span><span class="ops-stat-label">Open</span></div>
      <div class="ops-stat ops-stat-alert"><span class="ops-stat-val">${overdue}</span><span class="ops-stat-label">Overdue</span></div>
      <div class="ops-stat ops-stat-warn"><span class="ops-stat-val">${awaiting}</span><span class="ops-stat-label">Awaiting Client</span></div>
      <div class="ops-stat ops-stat-ok"><span class="ops-stat-val">${done}</span><span class="ops-stat-label">Completed</span></div>
    </div>
    ${filterBar}
    <div class="ops-groups">
      ${groupedContent || '<div class="ops-empty">No tasks match the current filters.</div>'}
    </div>
  </div>
  ${showNewTaskModal ? renderNewTaskModal() : ''}`;
}

function renderOpsStaff(tasks) {
  let out = '';
  CA_STAFF.forEach(s => {
    const gt      = tasks.filter(t => t.assignedTo === s.id);
    const gOpen   = gt.filter(t => t.status !== 'completed').length;
    const gOver   = gt.filter(t => t.status !== 'completed' && t.dueDate < TODAY).length;
    const gHigh   = gt.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    const estHrs  = gt.reduce((sum, t) => sum + (t.estHours || 0), 0);
    const roleColor = s.role === 'SCA' ? '#0C2340' : s.role === 'CA' ? '#B8923C' : '#6B8FAF';
    const hdr = `
    <div class="ops-group-header" style="border-left:3px solid ${roleColor}">
      <span class="ops-group-name">
        <span class="ops-avatar-chip" style="background:${roleColor};color:#fff;margin-right:8px">${s.initials}</span>
        ${s.name} <span style="color:var(--text-muted);font-weight:400;font-size:12px">${s.role}</span>
      </span>
      <span class="ops-group-chips">
        ${gt.length ? `<span class="ops-group-chip">${gt.length} task${gt.length!==1?'s':''}</span>` : ''}
        ${gOpen  ? `<span class="ops-group-chip ops-chip-open">${gOpen} open</span>` : ''}
        ${gOver  ? `<span class="ops-group-chip ops-chip-overdue">${gOver} overdue</span>` : ''}
        ${gHigh  ? `<span class="ops-group-chip ops-chip-high">${gHigh} high pri</span>` : ''}
        ${gt.length ? `<span class="ops-group-chip">${estHrs.toFixed(1)}h est.</span>` : ''}
      </span>
    </div>`;
    if (!gt.length) {
      out += hdr + `<div class="ops-empty-group">No tasks assigned</div>`;
    } else {
      out += hdr + `<table class="ops-task-table">
        <thead><tr><th></th><th>Task</th><th>Type</th><th>Client</th><th>Due</th><th></th></tr></thead>
        <tbody>${gt.map(t => {
          const sm = STATUS_META[t.status] || STATUS_META.pending;
          const pm = PRIORITY_META[t.priority] || PRIORITY_META.medium;
          const tm = CA_TASK_TYPES[t.type] || CA_TASK_TYPES.general;
          const isOver = t.status !== 'completed' && t.dueDate < TODAY;
          const isDone = t.status === 'completed';
          const cname  = opsClientName(t.clientId).split(' ')[1];
          return `<tr class="ops-task-row${isOver?' ops-row-overdue':''}${isDone?' ops-row-done':''}" data-task-id="${t.id}">
            <td class="ops-row-status"><span class="ops-status-dot" style="background:${sm.color}" title="${sm.label}"></span></td>
            <td class="ops-row-title"><span class="ops-row-task-title">${t.title}</span><span class="ops-row-sub">${t.subType}</span></td>
            <td class="ops-row-type"><span class="ops-type-chip" style="border-color:${tm.color};color:${tm.color}">${tm.label}</span></td>
            <td class="ops-row-client">${cname}</td>
            <td class="ops-row-due${isOver?' overdue-text':''}">${isDone?'<span style="color:var(--text-muted)">Done</span>':t.dueDate}${isOver?'<span class="ops-overdue-flag">!</span>':''}</td>
            <td class="ops-row-priority"><span class="ops-pri-dot" style="background:${pm.color}" title="${pm.label}"></span></td>
            <td class="ops-row-actions">
              ${!isDone?`<button class="ops-row-btn ops-row-btn-done" data-task-set-status="${t.id}:completed" title="Mark complete">✓</button>`:''}
              <button class="ops-row-btn ops-row-btn-open" data-task-open="${t.id}" title="Open detail">→</button>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table>`;
    }
  });
  return out;
}

// ─── MOBILE HELPERS ───────────────────────────────────────
const menuBtn = `<button class="mobile-menu-btn" data-sidebar-toggle aria-label="Menu"><span></span></button>`;

// ─── WIRE INSTRUCTIONS MODAL ──────────────────────────────
function openWireModal(clientId) {
  const client = clients.find(c => c.id === clientId);
  if (!client) return;
  const w = advisor.wire;
  const today = new Date(TODAY).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const existing = document.getElementById('wire-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'wire-modal-overlay';
  overlay.className = 'wire-overlay';
  overlay.innerHTML = `
    <div class="wire-modal" role="dialog" aria-modal="true" aria-label="Wire Instructions">
      <div class="wire-modal-header">
        <div>
          <div class="wire-modal-title">Wire Transfer Instructions</div>
          <div class="wire-modal-sub">${client.displayName} · Generated ${today}</div>
        </div>
        <div class="wire-modal-actions">
          <button class="wire-btn-print" id="wire-print-btn">Print / Save PDF</button>
          <button class="wire-btn-close" id="wire-close-btn" aria-label="Close">✕</button>
        </div>
      </div>

      <div class="wire-doc" id="wire-doc">
        <div class="wire-letterhead">
          <div class="wire-lh-firm">${advisor.firm}</div>
          <div class="wire-lh-meta">${advisor.name} · ${advisor.title}<br>${w.address}</div>
        </div>

        <h2 class="wire-doc-title">Incoming Wire Transfer Instructions</h2>
        <p class="wire-doc-intro">Please use the following instructions to initiate a wire transfer to your Gold Capital account. Contact us with any questions before initiating the transfer.</p>

        <div class="wire-section-label">Receiving Bank</div>
        <table class="wire-table">
          <tr><td class="wire-field">Bank Name</td><td class="wire-value">${w.receivingBank}</td></tr>
          <tr><td class="wire-field">ABA / Routing Number</td><td class="wire-value wire-mono">${w.abaRouting}</td></tr>
          <tr><td class="wire-field">SWIFT Code (International)</td><td class="wire-value wire-mono">${w.swiftCode}</td></tr>
          <tr><td class="wire-field">DTC Number</td><td class="wire-value wire-mono">${w.dtc}</td></tr>
        </table>

        <div class="wire-section-label">Receiving Account</div>
        <table class="wire-table">
          <tr><td class="wire-field">Account Name</td><td class="wire-value">${w.firmAccountName}</td></tr>
          <tr><td class="wire-field">Account Number</td><td class="wire-value wire-mono">${w.firmAccountNum}</td></tr>
        </table>

        <div class="wire-section-label">For Further Credit (FFC) — Client Account</div>
        <table class="wire-table wire-table--highlight">
          <tr><td class="wire-field">Account Name</td><td class="wire-value">${client.wireInfo.accountName}</td></tr>
          <tr><td class="wire-field">Account Number</td><td class="wire-value wire-mono">${client.wireInfo.accountNum}</td></tr>
          <tr><td class="wire-field">Reference / Memo</td><td class="wire-value">${client.lastName} · ${client.wireInfo.accountNum}</td></tr>
        </table>

        <div class="wire-note">
          <strong>Important:</strong> Always include the FFC account name and number in your wire instructions. Wires received without the FFC reference may be delayed. For questions contact ${advisor.name} at ${w.phone}.
        </div>

        <div class="wire-footer">
          ${advisor.firm} · ${w.address} · ${w.phone}<br>
          Document generated ${today} · For client use only — do not distribute
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  document.getElementById('wire-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('wire-print-btn').addEventListener('click', () => window.print());
}

// ─── ANNOUNCEMENT BANNER ──────────────────────────────────
function renderAnnouncementBanner() {
  const a = getActiveBanner();
  if (!a) return '';

  const ICONS = {
    info:    `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7.5" cy="7.5" r="6.5"/><line x1="7.5" y1="5" x2="7.5" y2="5.1"/><line x1="7.5" y1="7" x2="7.5" y2="11"/></svg>`,
    warning: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 1.5 13.5 13H1.5z"/><line x1="7.5" y1="6" x2="7.5" y2="9.5"/><line x1="7.5" y1="11.5" x2="7.5" y2="11.6"/></svg>`,
    success: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="7.5" r="6.5"/><polyline points="4.5,8 6.5,10 10.5,5.5"/></svg>`,
    alert:   `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7.5" cy="7.5" r="6.5"/><line x1="7.5" y1="4.5" x2="7.5" y2="8.5"/><line x1="7.5" y1="10.5" x2="7.5" y2="10.6"/></svg>`
  };

  const icon = ICONS[a.type] || ICONS.info;

  return `<div class="ann-banner ann-banner--${a.type}" role="alert">
    <div class="ann-body">
      <span class="ann-icon">${icon}</span>
      <span class="ann-msg">${a.message}</span>
      ${a.cta ? `<button class="ann-cta" data-nav="${a.cta.route}">${a.cta.label} →</button>` : ''}
    </div>
    <button class="ann-dismiss" data-dismiss-banner="${a.id}" aria-label="Dismiss announcement">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="11" y2="11"/><line x1="11" y1="2" x2="2" y2="11"/></svg>
    </button>
  </div>`;
}

// ─── MAIN RENDER ──────────────────────────────────────────
function renderApp() {
  const sidebar = renderSidebar();
  const viewMap = {
    advisor:    renderAdvisorView,
    client:     renderClientView,
    calendar:   renderCalendarView,
    tasks:      renderTasksView,
    inbox:      renderInboxView,
    reports:    renderReportsView,
    operations: renderOperationsView
  };
  const main = (viewMap[state.view] || renderAdvisorView)();

  document.getElementById('app').innerHTML = `
    ${renderAnnouncementBanner()}
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
    <div class="app-shell fade-in">
      ${sidebar}
      <div class="main-area">${main}</div>
    </div>`;

  attachEventListeners();
  updateChatContext();
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
    // Wire instructions modal
    const wireBtn = e.target.closest('[data-wire-instructions]');
    if (wireBtn) { openWireModal(parseInt(wireBtn.getAttribute('data-wire-instructions'), 10)); return; }

    // Announcement banner dismiss
    const dismissBtn = e.target.closest('[data-dismiss-banner]');
    if (dismissBtn) { dismissBanner(dismissBtn.getAttribute('data-dismiss-banner')); renderApp(); return; }

    // Reset all dismissed announcements
    if (e.target.closest('[data-reset-banners]')) {
      localStorage.removeItem('gc_dismissed_banners');
      renderApp();
      return;
    }

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

    // Holdings drilldown — drill into an asset class (legend row click; SVG handled by setupDonutInteractivity)
    const drillBtn = e.target.closest('[data-drill-class]');
    if (drillBtn && !e.target.closest('#holdings-donut')) {
      holdingsDrill = drillBtn.getAttribute('data-drill-class');
      const tc = document.getElementById('tab-content');
      const client = clients.find(c => c.id === state.clientId);
      if (tc && client) { tc.innerHTML = renderTabContent(client); setupDonutInteractivity(); }
      return;
    }

    // Holdings drilldown — back to all assets
    if (e.target.closest('[data-holdings-back]')) {
      holdingsDrill = null;
      const tc = document.getElementById('tab-content');
      const client = clients.find(c => c.id === state.clientId);
      if (tc && client) { tc.innerHTML = renderTabContent(client); setupDonutInteractivity(); }
      return;
    }

    // Holdings level toggle (Asset Class / Strategy)
    const levelBtn = e.target.closest('[data-holdings-level]');
    if (levelBtn) {
      holdingsLevel = levelBtn.getAttribute('data-holdings-level');
      if (holdingsLevel === 'strategy') holdingsDrill = null;
      const tc = document.getElementById('tab-content');
      const client = clients.find(c => c.id === state.clientId);
      if (tc && client) { tc.innerHTML = renderTabContent(client); setupDonutInteractivity(); }
      return;
    }

    // Holdings view toggle (Product / Exposure)
    const viewBtn = e.target.closest('[data-holdings-view]');
    if (viewBtn) {
      holdingsView = viewBtn.getAttribute('data-holdings-view');
      const tc = document.getElementById('tab-content');
      const client = clients.find(c => c.id === state.clientId);
      if (tc && client) { tc.innerHTML = renderTabContent(client); setupDonutInteractivity(); }
      return;
    }

    // Tab switching
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      const tab = tabBtn.getAttribute('data-tab');
      if (tab && state.activeTab !== tab) {
        state.activeTab = tab;
        if (state.view === 'client') {
          const tc = document.getElementById('tab-content');
          const tb = document.getElementById('tab-bar');
          const client = clients.find(c => c.id === state.clientId);
          if (tc && client) tc.innerHTML = renderTabContent(client);
          if (tab === 'holdings') setupDonutInteractivity();
          if (tb) tb.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tab);
          });
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

    // Ops view toggle
    const opsViewBtn = e.target.closest('[data-ops-view]');
    if (opsViewBtn) {
      opsView = opsViewBtn.getAttribute('data-ops-view');
      refreshOpsView(); return;
    }

    // Ops new task button
    if (e.target.closest('[data-ops-new-task]')) {
      showNewTaskModal = true;
      refreshOpsView(); return;
    }

    // Reports sub-tab
    const reportTabBtn = e.target.closest('[data-report-tab]');
    if (reportTabBtn) {
      reportsTab = reportTabBtn.getAttribute('data-report-tab');
      renderApp(); return;
    }

    // Inbox filter
    const ibfBtn = e.target.closest('[data-inbox-filter]');
    if (ibfBtn) {
      inboxFilter = ibfBtn.getAttribute('data-inbox-filter');
      inboxSelectedId = null;
      renderApp(); return;
    }

    // Inbox message select
    const msgRow = e.target.closest('[data-inbox-select]');
    if (msgRow && !e.target.closest('[data-msg-action]')) {
      const msgId = msgRow.getAttribute('data-inbox-select');
      inboxSelectedId = msgId;
      const msg = clientMessages.find(m => m.id === msgId);
      if (msg && !msg.read) updateMessage(msgId, { read: true, status: msg.status === 'unread' ? 'read' : msg.status });
      renderApp(); return;
    }
  });

  // Ops filter selects
  wireOpsSelects();

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

  // Wire donut on initial load (if holdings tab is already active)
  if (state.view === 'client' && state.activeTab === 'holdings') setupDonutInteractivity();
}

// ─── INIT ─────────────────────────────────────────────────
function init() {
  parseRoute();
  renderApp();
  initChat();
  initTaskPanel();
  attachGlobalTaskListeners();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('hashchange', () => {
  const prevId = state.clientId;
  parseRoute();
  if (state.clientId !== prevId) { holdingsDrill = null; holdingsLevel = 'class'; holdingsView = 'product'; }
  renderApp();
});
