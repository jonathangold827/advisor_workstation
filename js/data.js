// Gold Capital — Advisor Workstation
// Mock Data — 8 Clients

export const TODAY = '2026-03-27';

function daysAgo(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysFromNow(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export const advisor = {
  name: 'Sarah Mitchell',
  title: 'Senior Wealth Advisor',
  initials: 'SM',
  firm: 'Gold Capital',
  wire: {
    receivingBank:   'First National Custodial Bank',
    abaRouting:      '021000089',
    swiftCode:       'FNCBUS33XXX',
    firmAccountName: 'Gold Capital Advisors LLC',
    firmAccountNum:  '4471-0099-334',
    dtc:             '0226',
    phone:           '(415) 555-0100',
    address:         '100 Market Street, Suite 800, San Francisco, CA 94105'
  }
};

export const clients = [

  // ── 1. HARRINGTON ─────────────────────────────────────────
  {
    id: 1,
    displayName: 'Robert & Catherine Harrington',
    firstName: 'Robert', lastName: 'Harrington', preferredName: 'Bob',
    initials: 'RH', tier: 'platinum',
    aum: 285000000, aumGrowthYTD: 0.082,
    advisor: 'Sarah Mitchell',
    joinDate: '2015-03-12', location: 'Atherton, CA',
    healthScore: 9.2, healthLabel: 'Thriving',
    ltvMetrics: {
      estimatedAnnualRevenue: 1852500, projectedLTV: 22230000,
      feeRate: 0.0065, tenureYears: 11, referralsGiven: 3,
      revenueScore: 9.8, tenureScore: 8.2, engagementScore: 9.4,
      growthScore: 8.7, breadthScore: 9.0,
      servicesUsed: ['Investment Mgmt', 'Estate Planning', 'Tax Planning', 'Philanthropy', 'Trust Services']
    },
    lastTouchpoint: { date: daysAgo(7), type: 'meeting', summary: 'Q1 portfolio review and estate planning discussion' },
    openTasks: 2,
    upcomingMilestones: [
      { date: daysFromNow(19), type: 'birthday', description: "Robert's 65th Birthday", urgent: true },
      { date: daysFromNow(47), type: 'anniversary', description: '37th Wedding Anniversary', urgent: false },
      { date: daysFromNow(82), type: 'review', description: 'Q2 Portfolio Review', urgent: false }
    ],
    tags: ['tech-founder', 'philanthropist', 'golf'],
    household: [
      { name: 'Catherine Harrington', relationship: 'Spouse', birthday: '1965-08-22' },
      { name: 'James Harrington', relationship: 'Son', birthday: '1990-03-15' },
      { name: 'Emma Harrington', relationship: 'Daughter', birthday: '1993-11-08' }
    ],
    preferences: {
      communication: 'Phone preferred, mornings only',
      interests: 'Golf (8 handicap), Art collecting, Sailing, SF 49ers',
      notes: 'Always acknowledge Catherine first. Very proud of Emma\'s Harvard MBA. Prefers Opus One Cabernet. Allergic to shellfish.'
    },
    holdings: [
      { name: 'Apple Inc.', ticker: 'AAPL', type: 'US Equity', value: 31350000, allocation: 11.0, gainLossPct: 19.2 },
      { name: 'Microsoft Corp.', ticker: 'MSFT', type: 'US Equity', value: 25650000, allocation: 9.0, gainLossPct: 49.7 },
      { name: 'KKR Private Equity Fund VI', ticker: null, type: 'Private Equity', value: 71250000, allocation: 25.0, gainLossPct: 31.2 },
      { name: 'Blackstone Real Estate Trust', ticker: null, type: 'Real Estate', value: 57000000, allocation: 20.0, gainLossPct: 9.4 },
      { name: 'US Treasury 10Y', ticker: null, type: 'Fixed Income', value: 28500000, allocation: 10.0, gainLossPct: -1.2 },
      { name: 'Goldman Sachs MMF', ticker: null, type: 'Cash', value: 8550000, allocation: 3.0, gainLossPct: 5.1 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(12), type: 'Buy', asset: 'NVDA', description: 'Purchased 1,200 shares Nvidia Corp.', amount: 1452000, account: 'Harrington Family Trust' },
      { id: 't2', date: daysAgo(17), type: 'Sell', asset: 'TSLA', description: 'Sold 500 shares Tesla (tax harvesting)', amount: 872500, account: 'Harrington Taxable' },
      { id: 't3', date: daysAgo(35), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -46312, account: 'All Accounts' },
      { id: 't4', date: daysAgo(55), type: 'Interest', asset: 'US Treasury', description: 'Semi-annual interest payment', amount: 128750, account: 'Family Trust' },
      { id: 't5', date: daysAgo(91), type: 'Rebalance', asset: null, description: 'Q4 2025 portfolio rebalance', amount: 0, account: 'All Accounts' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(7), type: 'meeting', title: 'Q1 2026 Portfolio Review', notes: 'Reviewed portfolio (up 8.2% YTD). Discussed estate planning updates. Catherine mentioned Italy trip in June. Bob wants to increase PE allocation by $10M.', sentiment: 'positive' },
      { id: 'tp2', date: daysAgo(22), type: 'phone_call', title: 'Market Volatility Check-In', notes: 'Called proactively re: tech sector pullback. Bob appreciated the outreach. Reassured on positioning.', sentiment: 'positive' },
      { id: 'tp3', date: daysAgo(41), type: 'gift_sent', title: "Valentine's Day — Flowers for Catherine", notes: 'Sent custom arrangement to Catherine with handwritten note. She called to thank us personally.', sentiment: 'positive' },
      { id: 'tp4', date: daysAgo(71), type: 'annual_review', title: '2026 Annual Review', notes: 'Full-year 2025 review. Strong 18.7% return vs 14.2% benchmark. Discussed 2026 goals.', sentiment: 'positive' },
      { id: 'tp5', date: daysAgo(97), type: 'gift_sent', title: 'Holiday Gift — Opus One Collection', notes: 'Sent 12-bottle Opus One collection with personalized holiday card.', sentiment: 'positive' },
      { id: 'tp6', date: daysAgo(129), type: 'phone_call', title: 'Year-End Tax Planning', notes: 'Discussed tax-loss harvesting with TSLA position. Plan to harvest ~$350K in losses.', sentiment: 'neutral' }
    ],
    serviceRequests: [
      { id: 'sr1', type: 'Tax Document', title: 'Q1 2026 K-1 Statements', status: 'open', priority: 'high', createdDate: daysAgo(26), dueDate: daysFromNow(19), notes: 'Client needs K-1s for KKR and Blackstone for tax filing. CPA deadline April 15.' },
      { id: 'sr2', type: 'Investment Change', title: 'Increase PE Allocation — $10M', status: 'in_progress', priority: 'medium', createdDate: daysAgo(7), dueDate: daysFromNow(35), notes: 'Evaluating Apollo Fund VIII and Carlyle Partners VII. Confirm capital call schedule.' }
    ],
    wireInfo: {
      accountName: 'Harrington Family Trust',
      accountNum:  'GC-2015-001-HFT'
    }
  },

  // ── 2. WHITFIELD ──────────────────────────────────────────
  {
    id: 2,
    displayName: 'Margaret Whitfield',
    firstName: 'Margaret', lastName: 'Whitfield', preferredName: 'Margaret',
    initials: 'MW', tier: 'platinum',
    aum: 175000000, aumGrowthYTD: 0.051,
    advisor: 'Sarah Mitchell',
    joinDate: '2008-06-15', location: 'Newport Beach, CA',
    healthScore: 7.1, healthLabel: 'Nurture',
    ltvMetrics: {
      estimatedAnnualRevenue: 1137500, projectedLTV: 9100000,
      feeRate: 0.0065, tenureYears: 18, referralsGiven: 2,
      revenueScore: 8.5, tenureScore: 9.5, engagementScore: 6.8,
      growthScore: 4.8, breadthScore: 7.5,
      servicesUsed: ['Investment Mgmt', 'Estate Planning', 'Trust Services', 'Philanthropy']
    },
    lastTouchpoint: { date: daysAgo(21), type: 'phone_call', summary: 'Monthly check-in, discussed estate document progress' },
    openTasks: 3,
    upcomingMilestones: [
      { date: daysFromNow(14), type: 'review', description: 'Estate Document Signing Meeting', urgent: true },
      { date: daysFromNow(52), type: 'birthday', description: "Margaret's 78th Birthday", urgent: true }
    ],
    tags: ['widowed', 'estate-planning', 'art-collector', 'multi-gen'],
    household: [
      { name: 'Charles Whitfield Jr.', relationship: 'Son', birthday: '1968-04-12' },
      { name: 'Diana Whitfield-Ross', relationship: 'Daughter', birthday: '1971-09-30' },
      { name: 'Peter Whitfield', relationship: 'Son', birthday: '1974-02-18' }
    ],
    preferences: {
      communication: 'Phone only, afternoons preferred. Never email sensitive information.',
      interests: 'Contemporary art, opera, Newport Yacht Club, gardening',
      notes: 'Husband Harold passed Nov 2023. Still adjusting. Two of three children have expressed interest in moving assets. Needs frequent reassurance and personal attention. Loves when we remember Harold\'s contributions to the community.'
    },
    holdings: [
      { name: 'Vanguard Total Market ETF', ticker: 'VTI', type: 'US Equity', value: 43750000, allocation: 25.0, gainLossPct: 14.3 },
      { name: 'Pimco Total Return Fund', ticker: 'PTTRX', type: 'Fixed Income', value: 52500000, allocation: 30.0, gainLossPct: 2.8 },
      { name: 'Blackstone Real Estate Trust', ticker: null, type: 'Real Estate', value: 35000000, allocation: 20.0, gainLossPct: 9.4 },
      { name: 'Municipal Bond Fund', ticker: 'VWLTX', type: 'Fixed Income', value: 26250000, allocation: 15.0, gainLossPct: 1.9 },
      { name: 'Goldman Sachs MMF', ticker: null, type: 'Cash', value: 17500000, allocation: 10.0, gainLossPct: 5.1 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(10), type: 'Dividend', asset: 'VTI', description: 'Quarterly dividend — VTI', amount: 87500, account: 'Whitfield Trust' },
      { id: 't2', date: daysAgo(30), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -28437, account: 'All Accounts' },
      { id: 't3', date: daysAgo(45), type: 'Rebalance', asset: null, description: 'Annual rebalance — shift to fixed income', amount: 0, account: 'All Accounts' },
      { id: 't4', date: daysAgo(62), type: 'Contribution', asset: null, description: 'Trust distribution reinvestment', amount: 250000, account: 'Whitfield Trust' },
      { id: 't5', date: daysAgo(90), type: 'Interest', asset: 'Muni Fund', description: 'Municipal bond interest', amount: 43750, account: 'Whitfield Trust' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(21), type: 'phone_call', title: 'Monthly Check-In Call', notes: 'Margaret seems more settled this month. Discussed estate attorney progress. She mentioned attending the Newport Opera Gala.', sentiment: 'positive' },
      { id: 'tp2', date: daysAgo(38), type: 'meeting', title: 'Estate Planning Session', notes: 'Met with Jennifer Walsh (estate attorney) and Margaret. Reviewing trust restructuring post Harold\'s passing. Complex — three children have different interests.', sentiment: 'neutral' },
      { id: 'tp3', date: daysAgo(52), type: 'gift_sent', title: "Valentine's Day — Orchid Arrangement", notes: 'Sent white orchid arrangement with note acknowledging this is a tender time of year. Margaret called to say it meant a great deal.', sentiment: 'positive' },
      { id: 'tp4', date: daysAgo(71), type: 'phone_call', title: 'Annual Review Call', notes: 'Covered 2025 performance. Margaret focused more on estate questions than returns. Understandable given circumstances.', sentiment: 'neutral' },
      { id: 'tp5', date: daysAgo(95), type: 'gift_sent', title: 'Holiday Gift — Art Book', notes: 'Sent a signed coffee table book from her favorite artist (Agnes Martin). Very personal touch — she was deeply moved.', sentiment: 'positive' }
    ],
    serviceRequests: [
      { id: 'sr1', type: 'Estate Planning', title: 'Trust Restructuring — Post Harold', status: 'in_progress', priority: 'high', createdDate: daysAgo(90), dueDate: daysFromNow(14), notes: 'Estate attorney drafting amended trust documents. Three beneficiary branches need coordination.' },
      { id: 'sr2', type: 'Account Change', title: 'Account Re-registration to Surviving Spouse', status: 'awaiting_client', priority: 'high', createdDate: daysAgo(60), dueDate: daysFromNow(7), notes: 'Awaiting Margaret\'s signature on re-registration forms. Sent twice via DocuSign.' },
      { id: 'sr3', type: 'Document Request', title: 'Annual Tax Documents — 2025', status: 'open', priority: 'medium', createdDate: daysAgo(20), dueDate: daysFromNow(19), notes: 'Coordinate with CPA Patricia Moore on 1099s and K-1s.' }
    ],
    wireInfo: {
      accountName: 'Whitfield Revocable Trust',
      accountNum:  'GC-2008-002-WRT'
    }
  },

  // ── 3. MORRISON ───────────────────────────────────────────
  {
    id: 3,
    displayName: 'David & Sarah Morrison',
    firstName: 'David', lastName: 'Morrison', preferredName: 'David',
    initials: 'DM', tier: 'gold',
    aum: 42000000, aumGrowthYTD: 0.094,
    advisor: 'Sarah Mitchell',
    joinDate: '2019-09-22', location: 'Greenwich, CT',
    healthScore: 8.2, healthLabel: 'Thriving',
    ltvMetrics: {
      estimatedAnnualRevenue: 315000, projectedLTV: 6800000,
      feeRate: 0.0075, tenureYears: 6, referralsGiven: 2,
      revenueScore: 7.2, tenureScore: 6.0, engagementScore: 8.0,
      growthScore: 8.5, breadthScore: 7.0,
      servicesUsed: ['Investment Mgmt', 'Tax Planning', 'Estate Planning']
    },
    lastTouchpoint: { date: daysAgo(18), type: 'meeting', summary: "Q1 review, discussed hedge fund performance and son's college planning" },
    openTasks: 1,
    upcomingMilestones: [
      { date: daysFromNow(28), type: 'anniversary', description: '20th Wedding Anniversary', urgent: true },
      { date: daysFromNow(61), type: 'event', description: "Connor's Graduation — Yale", urgent: false }
    ],
    tags: ['hedge-fund', 'finance-professional', 'greenwich'],
    household: [
      { name: 'Sarah Morrison', relationship: 'Spouse', birthday: '1978-11-14' },
      { name: 'Connor Morrison', relationship: 'Son', birthday: '2002-06-08' }
    ],
    preferences: {
      communication: 'Email for routine, phone for strategy. David appreciates directness.',
      interests: 'Ice hockey (coaches youth), fly fishing, Yale football',
      notes: "David is a finance professional — treat as peer. Connor graduating Yale May 2026. Sarah handles family day-to-day finances. Don't be late."
    },
    holdings: [
      { name: 'Vanguard S&P 500 ETF', ticker: 'VOO', type: 'US Equity', value: 16800000, allocation: 40.0, gainLossPct: 18.4 },
      { name: 'International Equity Fund', ticker: 'VXUS', type: 'US Equity', value: 6300000, allocation: 15.0, gainLossPct: 9.2 },
      { name: 'Bridgewater All Weather', ticker: null, type: 'Hedge Fund', value: 8400000, allocation: 20.0, gainLossPct: 7.8 },
      { name: 'Investment Grade Corp Bonds', ticker: 'LQD', type: 'Fixed Income', value: 8400000, allocation: 20.0, gainLossPct: 3.1 },
      { name: 'Money Market Fund', ticker: null, type: 'Cash', value: 2100000, allocation: 5.0, gainLossPct: 5.2 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(8), type: 'Buy', asset: 'VOO', description: 'Added to S&P 500 position', amount: 500000, account: 'Morrison Joint' },
      { id: 't2', date: daysAgo(30), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -7875, account: 'All Accounts' },
      { id: 't3', date: daysAgo(45), type: 'Dividend', asset: 'VOO', description: 'Quarterly dividend income', amount: 42000, account: 'Morrison Joint' },
      { id: 't4', date: daysAgo(70), type: 'Contribution', asset: null, description: 'Year-end bonus contribution', amount: 1000000, account: 'Morrison Joint' },
      { id: 't5', date: daysAgo(95), type: 'Rebalance', asset: null, description: 'Q3 rebalance — trimmed equity', amount: 0, account: 'All Accounts' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(18), type: 'meeting', title: 'Q1 Quarterly Review', notes: "Strong quarter up 9.4% YTD. Discussed Connor's 529 and graduation gift ideas. David asked about increasing hedge fund allocation.", sentiment: 'positive' },
      { id: 'tp2', date: daysAgo(32), type: 'phone_call', title: 'Market Outlook Discussion', notes: 'David called with questions on fixed income positioning given rate environment. Good peer-level conversation.', sentiment: 'positive' },
      { id: 'tp3', date: daysAgo(55), type: 'email', title: 'Q4 Performance Summary', notes: 'Sent detailed performance attribution report. David replied with specific questions on sector weights.', sentiment: 'positive' },
      { id: 'tp4', date: daysAgo(90), type: 'annual_review', title: '2025 Annual Review', notes: '22.1% return. Sarah attended for first time. Great energy — discussed 20th anniversary plans.', sentiment: 'positive' },
      { id: 'tp5', date: daysAgo(112), type: 'event', title: 'Gold Capital Annual Dinner', notes: "Attended our annual client dinner. Introduced to new head of alternatives.", sentiment: 'positive' }
    ],
    serviceRequests: [
      { id: 'sr1', type: 'Account Change', title: "Increase 529 Contribution — Connor", status: 'open', priority: 'medium', createdDate: daysAgo(10), dueDate: daysFromNow(30), notes: 'Max contribution for 2026 before Connor graduates. Confirm gift tax exclusion.' }
    ],
    wireInfo: {
      accountName: 'Morrison Joint Account',
      accountNum:  'GC-2019-003-MJA'
    }
  },

  // ── 4. BANCROFT ───────────────────────────────────────────
  {
    id: 4,
    displayName: 'Elizabeth Bancroft',
    firstName: 'Elizabeth', lastName: 'Bancroft', preferredName: 'Liz',
    initials: 'EB', tier: 'gold',
    aum: 38000000, aumGrowthYTD: 0.038,
    advisor: 'Sarah Mitchell',
    joinDate: '2016-04-08', location: 'Palm Beach, FL',
    healthScore: 5.9, healthLabel: 'Nurture',
    ltvMetrics: {
      estimatedAnnualRevenue: 285000, projectedLTV: 3420000,
      feeRate: 0.0075, tenureYears: 10, referralsGiven: 1,
      revenueScore: 7.0, tenureScore: 7.5, engagementScore: 4.5,
      growthScore: 4.0, breadthScore: 5.5,
      servicesUsed: ['Investment Mgmt', 'Estate Planning']
    },
    lastTouchpoint: { date: daysAgo(45), type: 'email', summary: 'Replied to account access question — brief exchange only' },
    openTasks: 4,
    upcomingMilestones: [
      { date: daysFromNow(11), type: 'birthday', description: "Elizabeth's Birthday — Send gift!", urgent: true },
      { date: daysFromNow(30), type: 'review', description: 'Overdue Account Review — Schedule Immediately', urgent: true }
    ],
    tags: ['recently-divorced', 'estate-restructuring', 'at-risk', 'palm-beach'],
    household: [
      { name: 'Sophie Bancroft', relationship: 'Daughter', birthday: '2000-07-22' },
      { name: 'William Bancroft Jr.', relationship: 'Son', birthday: '2003-02-14' }
    ],
    preferences: {
      communication: 'Historically preferred in-person. Less responsive since divorce.',
      interests: 'Equestrian sports, Palm Beach social scene, interior design',
      notes: "Divorce from William finalized Nov 2025. Vulnerable time. Her sister in NY uses a competitor — risk of consolidation. Priority: reach her before birthday April 7th."
    },
    holdings: [
      { name: 'BlackRock Multi-Asset Fund', ticker: 'BMIX', type: 'US Equity', value: 15200000, allocation: 40.0, gainLossPct: 11.2 },
      { name: 'Vanguard Bond Index', ticker: 'BND', type: 'Fixed Income', value: 11400000, allocation: 30.0, gainLossPct: 2.4 },
      { name: 'Cohen & Steers Real Estate', ticker: 'CSRSX', type: 'Real Estate', value: 7600000, allocation: 20.0, gainLossPct: 6.8 },
      { name: 'Treasury Bills 6M', ticker: null, type: 'Fixed Income', value: 2280000, allocation: 6.0, gainLossPct: 5.3 },
      { name: 'Cash & Equivalents', ticker: null, type: 'Cash', value: 1520000, allocation: 4.0, gainLossPct: 4.9 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(15), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -7125, account: 'Bancroft Individual' },
      { id: 't2', date: daysAgo(40), type: 'Rebalance', asset: null, description: 'Post-divorce account restructure', amount: 0, account: 'All Accounts' },
      { id: 't3', date: daysAgo(60), type: 'Withdrawal', asset: null, description: 'Divorce settlement distribution', amount: -4500000, account: 'Bancroft Joint' },
      { id: 't4', date: daysAgo(75), type: 'Contribution', asset: null, description: 'Settlement proceeds reinvestment', amount: 4500000, account: 'Bancroft Individual' },
      { id: 't5', date: daysAgo(95), type: 'Dividend', asset: 'BMIX', description: 'Quarterly dividend income', amount: 28500, account: 'Bancroft Individual' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(45), type: 'email', title: 'Account Access Question', notes: 'Brief email re: portal login. Declined offer for a call.', sentiment: 'neutral' },
      { id: 'tp2', date: daysAgo(88), type: 'phone_call', title: 'Post-Divorce Check-In', notes: 'Liz overwhelmed with transition. Appreciated the call. Feels unsure about decisions without William.', sentiment: 'positive' },
      { id: 'tp3', date: daysAgo(125), type: 'meeting', title: 'Emergency Planning Meeting', notes: 'In-person Palm Beach. Restructured accounts post divorce filing. Very emotional — handled with care.', sentiment: 'neutral' },
      { id: 'tp4', date: daysAgo(165), type: 'phone_call', title: 'Investment Strategy Review', notes: 'Pre-divorce — routine review. Good meeting.', sentiment: 'positive' },
      { id: 'tp5', date: daysAgo(220), type: 'annual_review', title: '2024 Annual Review', notes: 'Annual review with both William and Elizabeth. Strong year. No issues flagged.', sentiment: 'positive' }
    ],
    serviceRequests: [
      { id: 'sr1', type: 'Account Change', title: 'Update Beneficiary Designations', status: 'open', priority: 'high', createdDate: daysAgo(60), dueDate: daysFromNow(14), notes: 'Children to be named as beneficiaries. Forms sent twice — no response.' },
      { id: 'sr2', type: 'Document Request', title: '2025 Tax Documents — Post-Divorce', status: 'open', priority: 'high', createdDate: daysAgo(25), dueDate: daysFromNow(19), notes: 'CPA needs split-year documents. Coordinating with divorce attorney.' },
      { id: 'sr3', type: 'Investment Change', title: 'Consolidate Remaining Joint Accounts', status: 'in_progress', priority: 'medium', createdDate: daysAgo(40), dueDate: daysFromNow(21), notes: 'Transferring joint brokerage to individual account.' },
      { id: 'sr4', type: 'Estate Planning', title: 'Draft New Will & POA', status: 'open', priority: 'high', createdDate: daysAgo(30), dueDate: daysFromNow(30), notes: 'Existing will names William. Urgent to update.' }
    ],
    wireInfo: {
      accountName: 'Bancroft Individual Account',
      accountNum:  'GC-2021-004-BIA'
    }
  },

  // ── 5. AUGUSTINE ──────────────────────────────────────────
  {
    id: 5,
    displayName: 'Thomas Augustine III',
    firstName: 'Thomas', lastName: 'Augustine', preferredName: 'Tom',
    initials: 'TA', tier: 'gold',
    aum: 28000000, aumGrowthYTD: 0.067,
    advisor: 'Sarah Mitchell',
    joinDate: '2012-07-19', location: 'Boston, MA',
    healthScore: 9.1, healthLabel: 'Thriving',
    ltvMetrics: {
      estimatedAnnualRevenue: 210000, projectedLTV: 2730000,
      feeRate: 0.0075, tenureYears: 13, referralsGiven: 5,
      revenueScore: 6.5, tenureScore: 9.0, engagementScore: 9.3,
      growthScore: 8.0, breadthScore: 8.5,
      servicesUsed: ['Investment Mgmt', 'Estate Planning', 'Trust Services', 'Tax Planning']
    },
    lastTouchpoint: { date: daysAgo(8), type: 'phone_call', summary: 'Weekly Friday call — referral follow-up and grandson christening discussion' },
    openTasks: 0,
    upcomingMilestones: [
      { date: daysFromNow(35), type: 'event', description: "Grandson Henry's Christening", urgent: true },
      { date: daysFromNow(73), type: 'birthday', description: "Tom's 60th Birthday — Plan Something Special!", urgent: true }
    ],
    tags: ['attorney', 'old-money', 'referral-source', 'boston'],
    household: [
      { name: 'Eleanor Augustine', relationship: 'Spouse', birthday: '1967-05-12' },
      { name: 'Thomas Augustine IV', relationship: 'Son', birthday: '1994-09-03' },
      { name: 'Claire Augustine-Webb', relationship: 'Daughter', birthday: '1997-04-27' }
    ],
    preferences: {
      communication: 'Phone — calls every Friday morning. Loves the personal relationship.',
      interests: 'Harvard rowing (former athlete), sailing, Boston Red Sox, constitutional law',
      notes: "Best referral source — 5 clients introduced. 60th birthday in June is a MAJOR milestone. Eleanor has private health matters — do not bring up. Tom values loyalty and discretion above everything."
    },
    holdings: [
      { name: 'Berkshire Hathaway B', ticker: 'BRK.B', type: 'US Equity', value: 8400000, allocation: 30.0, gainLossPct: 22.8 },
      { name: 'Johnson & Johnson', ticker: 'JNJ', type: 'US Equity', value: 5600000, allocation: 20.0, gainLossPct: 8.4 },
      { name: 'Vanguard Total Bond', ticker: 'BND', type: 'Fixed Income', value: 8400000, allocation: 30.0, gainLossPct: 2.1 },
      { name: 'Augustine Family LLC', ticker: null, type: 'Private Equity', value: 4200000, allocation: 15.0, gainLossPct: 12.0 },
      { name: 'Cash & T-Bills', ticker: null, type: 'Cash', value: 1400000, allocation: 5.0, gainLossPct: 5.1 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(8), type: 'Dividend', asset: 'JNJ', description: 'Quarterly dividend — JNJ', amount: 14000, account: 'Augustine Trust' },
      { id: 't2', date: daysAgo(30), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -5250, account: 'All Accounts' },
      { id: 't3', date: daysAgo(58), type: 'Buy', asset: 'BRK.B', description: 'Added 500 shares Berkshire', amount: 250000, account: 'Augustine Trust' },
      { id: 't4', date: daysAgo(85), type: 'Interest', asset: 'BND', description: 'Monthly bond interest', amount: 17500, account: 'Augustine Trust' },
      { id: 't5', date: daysAgo(112), type: 'Contribution', asset: null, description: 'Annual contribution', amount: 500000, account: 'Augustine Trust' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(8), type: 'phone_call', title: 'Weekly Friday Call', notes: "Tom referred his law partner Richard Chen. Discussed grandson Henry's christening. Planning to send a special gift.", sentiment: 'positive' },
      { id: 'tp2', date: daysAgo(15), type: 'phone_call', title: 'Weekly Friday Call', notes: 'Market update — Tom well-informed. Asked about fixed income duration.', sentiment: 'positive' },
      { id: 'tp3', date: daysAgo(40), type: 'annual_review', title: 'Annual Review & Estate Update', notes: 'In-person Boston. 2025 performance review. Updated trust docs. Tom joked about 60th birthday wanting something memorable.', sentiment: 'positive' },
      { id: 'tp4', date: daysAgo(68), type: 'gift_sent', title: 'Holiday Gift — Red Sox Premium Package', notes: "Sent premium Red Sox season opener package. Tom said it was the best gift he's ever received from an advisor.", sentiment: 'positive' },
      { id: 'tp5', date: daysAgo(95), type: 'phone_call', title: 'Year-End Tax Planning', notes: 'Maximizing deductions through family LLC distributions. Coordinated with his CPA.', sentiment: 'neutral' }
    ],
    serviceRequests: [
      { id: 'sr1', type: 'Estate Planning', title: 'Add Grandchild to Family Trust', status: 'in_progress', priority: 'low', createdDate: daysAgo(20), dueDate: daysFromNow(45), notes: 'Add Henry Augustine (newborn) as trust beneficiary.' }
    ],
    wireInfo: {
      accountName: 'Augustine Family Trust III',
      accountNum:  'GC-2012-005-AFT'
    }
  },

  // ── 6. PETROV ─────────────────────────────────────────────
  {
    id: 6,
    displayName: 'Alexander Petrov',
    firstName: 'Alexander', lastName: 'Petrov', preferredName: 'Alex',
    initials: 'AP', tier: 'gold',
    aum: 22000000, aumGrowthYTD: 0.044,
    advisor: 'Sarah Mitchell',
    joinDate: '2020-11-30', location: 'Miami, FL',
    healthScore: 5.2, healthLabel: 'At Risk',
    ltvMetrics: {
      estimatedAnnualRevenue: 165000, projectedLTV: 2475000,
      feeRate: 0.0075, tenureYears: 5, referralsGiven: 0,
      revenueScore: 6.0, tenureScore: 5.0, engagementScore: 3.5,
      growthScore: 5.5, breadthScore: 4.0,
      servicesUsed: ['Investment Mgmt', 'Tax Planning']
    },
    lastTouchpoint: { date: daysAgo(67), type: 'email', summary: 'Brief email re: Q4 performance — no follow-up call accepted' },
    openTasks: 3,
    upcomingMilestones: [
      { date: daysFromNow(0), type: 'review', description: 'Annual Review OVERDUE — 67 days without contact', urgent: true }
    ],
    tags: ['international-business', 'hard-to-reach', 'compliance', 'miami'],
    household: [
      { name: 'Natalia Petrov', relationship: 'Spouse', birthday: '1982-03-15' }
    ],
    preferences: {
      communication: 'Email preferred. Travels internationally 3 weeks/month. Limited availability.',
      interests: 'Tennis, international travel, Formula 1, Russian literature',
      notes: "Very difficult to reach. Travels between Miami, London, and Dubai frequently. Compliance complexity with international accounts. No referrals given. At risk of moving assets to European private bank."
    },
    holdings: [
      { name: 'iShares MSCI World ETF', ticker: 'URTH', type: 'US Equity', value: 7700000, allocation: 35.0, gainLossPct: 12.1 },
      { name: 'Emerging Markets Fund', ticker: 'EEM', type: 'US Equity', value: 4400000, allocation: 20.0, gainLossPct: -3.4 },
      { name: 'PIMCO Global Bond Fund', ticker: null, type: 'Fixed Income', value: 6600000, allocation: 30.0, gainLossPct: 1.8 },
      { name: 'Gold ETF', ticker: 'GLD', type: 'US Equity', value: 2200000, allocation: 10.0, gainLossPct: 18.7 },
      { name: 'Cash (Multi-currency)', ticker: null, type: 'Cash', value: 1100000, allocation: 5.0, gainLossPct: 4.2 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(30), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -4125, account: 'Petrov LLC' },
      { id: 't2', date: daysAgo(55), type: 'Dividend', asset: 'URTH', description: 'Annual dividend income', amount: 33000, account: 'Petrov LLC' },
      { id: 't3', date: daysAgo(70), type: 'Sell', asset: 'EEM', description: 'Trimmed EM position', amount: 550000, account: 'Petrov LLC' },
      { id: 't4', date: daysAgo(100), type: 'Buy', asset: 'GLD', description: 'Added gold position', amount: 500000, account: 'Petrov LLC' },
      { id: 't5', date: daysAgo(130), type: 'Rebalance', asset: null, description: 'Annual rebalance', amount: 0, account: 'All Accounts' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(67), type: 'email', title: 'Q4 Performance Email', notes: 'Sent Q4 summary. Alex replied with a one-line acknowledgment. Declined call offer.', sentiment: 'neutral' },
      { id: 'tp2', date: daysAgo(105), type: 'phone_call', title: 'Attempted Check-In — No Answer', notes: 'Called twice. Left voicemail. No callback received. Followed up with email.', sentiment: 'neutral' },
      { id: 'tp3', date: daysAgo(140), type: 'email', title: 'Q3 Quarterly Statement', notes: 'Sent quarterly performance statement. No response.', sentiment: 'neutral' },
      { id: 'tp4', date: daysAgo(175), type: 'phone_call', title: 'Brief Check-In — Traveling', notes: 'Reached Alex briefly. He was in Dubai. 5-minute call — said he was happy with performance. Promised to schedule a proper review.', sentiment: 'positive' },
      { id: 'tp5', date: daysAgo(220), type: 'annual_review', title: '2024 Annual Review', notes: 'Video call annual review. Alex joined from London. Covered performance, discussed EM exposure. Satisfied but disengaged.', sentiment: 'neutral' }
    ],
    serviceRequests: [
      { id: 'sr1', type: 'Compliance', title: 'Annual FBAR Filing Documentation', status: 'open', priority: 'high', createdDate: daysAgo(45), dueDate: daysFromNow(14), notes: 'Required foreign account reporting. Awaiting documents from client. Deadline approaching.' },
      { id: 'sr2', type: 'Document Request', title: '2025 Tax Documents', status: 'open', priority: 'medium', createdDate: daysAgo(25), dueDate: daysFromNow(19), notes: 'Annual tax package. Client unresponsive to requests.' },
      { id: 'sr3', type: 'Account Review', title: 'Annual Review — OVERDUE', status: 'open', priority: 'high', createdDate: daysAgo(30), dueDate: daysAgo(0), notes: 'Annual review has not been scheduled. Last proper review was March 2025.' }
    ],
    wireInfo: {
      accountName: 'Petrov Capital LLC',
      accountNum:  'GC-2020-006-PCL'
    }
  },

  // ── 7. CHEN ───────────────────────────────────────────────
  {
    id: 7,
    displayName: 'Amanda Chen',
    firstName: 'Amanda', lastName: 'Chen', preferredName: 'Amanda',
    initials: 'AC', tier: 'silver',
    aum: 9800000, aumGrowthYTD: 0.113,
    advisor: 'Sarah Mitchell',
    joinDate: '2021-02-14', location: 'San Francisco, CA',
    healthScore: 7.5, healthLabel: 'Nurture',
    ltvMetrics: {
      estimatedAnnualRevenue: 83300, projectedLTV: 4500000,
      feeRate: 0.0085, tenureYears: 5, referralsGiven: 1,
      revenueScore: 4.5, tenureScore: 4.8, engagementScore: 7.5,
      growthScore: 9.5, breadthScore: 5.0,
      servicesUsed: ['Investment Mgmt', 'Equity Compensation Planning']
    },
    lastTouchpoint: { date: daysAgo(20), type: 'phone_call', summary: 'RSU vesting strategy — $2.1M vest coming in 22 days' },
    openTasks: 1,
    upcomingMilestones: [
      { date: daysFromNow(22), type: 'event', description: 'RSU Vesting Event — $2.1M', urgent: true },
      { date: daysFromNow(44), type: 'event', description: 'Promotion Anniversary — 3 Years as VP', urgent: false }
    ],
    tags: ['tech-executive', 'high-growth', 'equity-compensation', 'san-francisco'],
    household: [
      { name: 'Kevin Chen', relationship: 'Spouse', birthday: '1982-09-20' }
    ],
    preferences: {
      communication: 'Text or email preferred. Very busy — keep meetings under 30 min. Always prep an agenda.',
      interests: 'Trail running, ceramics, Japan travel, food scene (SF & NYC)',
      notes: "VP at Vertex Technologies. Options and RSUs are primary wealth driver. AUM likely to reach $30M+ within 5 years if she stays at company. Needs guidance on sell-to-cover vs. cashless exercise strategy. Kevin is a teacher — she's the primary earner."
    },
    holdings: [
      { name: 'Vertex Technologies Stock', ticker: 'VRTX', type: 'US Equity', value: 4900000, allocation: 50.0, gainLossPct: 42.3 },
      { name: 'Vanguard Total Market', ticker: 'VTI', type: 'US Equity', value: 2450000, allocation: 25.0, gainLossPct: 16.8 },
      { name: 'Short-Term Bond Fund', ticker: 'BSV', type: 'Fixed Income', value: 1470000, allocation: 15.0, gainLossPct: 3.2 },
      { name: 'California Muni Bonds', ticker: null, type: 'Fixed Income', value: 588000, allocation: 6.0, gainLossPct: 1.9 },
      { name: 'Cash & Money Market', ticker: null, type: 'Cash', value: 392000, allocation: 4.0, gainLossPct: 5.0 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(10), type: 'Sell', asset: 'VRTX', description: 'Sold RSU shares at vest (tax withholding)', amount: 185000, account: 'Chen Individual' },
      { id: 't2', date: daysAgo(25), type: 'Buy', asset: 'VTI', description: 'Diversification purchase — VTI', amount: 150000, account: 'Chen Individual' },
      { id: 't3', date: daysAgo(30), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -2083, account: 'All Accounts' },
      { id: 't4', date: daysAgo(60), type: 'Contribution', asset: null, description: 'Max 401k contribution', amount: 23500, account: 'Chen 401k' },
      { id: 't5', date: daysAgo(90), type: 'Dividend', asset: 'VTI', description: 'Quarterly dividend', amount: 6125, account: 'Chen Individual' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(20), type: 'phone_call', title: 'RSU Vesting Strategy Call', notes: '$2.1M vest in ~3 weeks. Discussed sell-to-cover vs. hold strategy. Tax implications of CA state income. Amanda engaged and prepared — sent spreadsheet in advance.', sentiment: 'positive' },
      { id: 'tp2', date: daysAgo(35), type: 'email', title: 'Tax-Loss Harvesting Opportunity', notes: 'Flagged short-term loss opportunity in bond fund. Amanda approved rebalance via email within 2 hours.', sentiment: 'positive' },
      { id: 'tp3', date: daysAgo(58), type: 'meeting', title: 'Q4 Portfolio Review', notes: '25-minute video call (she had hard stop). Efficient — covered all key points. Portfolio up 11.3% YTD.', sentiment: 'positive' },
      { id: 'tp4', date: daysAgo(80), type: 'email', title: 'Equity Comp Planning Guide', notes: 'Sent custom guide on ISO vs RSU tax treatment. Amanda forwarded to her accountant and said it was incredibly helpful.', sentiment: 'positive' },
      { id: 'tp5', date: daysAgo(110), type: 'annual_review', title: '2025 Annual Review', notes: 'Video call. First year above $8M AUM. Discussed 5-year growth plan. Kevin joined briefly — nice to connect with him.', sentiment: 'positive' }
    ],
    serviceRequests: [
      { id: 'sr1', type: 'Investment Change', title: 'RSU Vest Proceeds — Diversification Plan', status: 'in_progress', priority: 'high', createdDate: daysAgo(5), dueDate: daysFromNow(22), notes: 'Prepare allocation plan for $2.1M RSU proceeds. Reduce VRTX concentration to <40%. Present options by April 10.' }
    ],
    wireInfo: {
      accountName: 'Chen Investment Account',
      accountNum:  'GC-2022-007-CIA'
    }
  },

  // ── 8. SULLIVAN ───────────────────────────────────────────
  {
    id: 8,
    displayName: 'George & Patricia Sullivan',
    firstName: 'George', lastName: 'Sullivan', preferredName: 'George',
    initials: 'GS', tier: 'silver',
    aum: 8500000, aumGrowthYTD: 0.058,
    advisor: 'Sarah Mitchell',
    joinDate: '2014-03-05', location: 'Scottsdale, AZ',
    healthScore: 9.2, healthLabel: 'Thriving',
    ltvMetrics: {
      estimatedAnnualRevenue: 72250, projectedLTV: 722500,
      feeRate: 0.0085, tenureYears: 12, referralsGiven: 4,
      revenueScore: 4.2, tenureScore: 8.5, engagementScore: 9.8,
      growthScore: 7.5, breadthScore: 8.0,
      servicesUsed: ['Investment Mgmt', 'Income Planning', 'Estate Planning']
    },
    lastTouchpoint: { date: daysAgo(6), type: 'phone_call', summary: 'Regular weekly call — George called to check on markets and share golf update' },
    openTasks: 0,
    upcomingMilestones: [
      { date: daysFromNow(16), type: 'birthday', description: "George's 75th Birthday — Plan something memorable", urgent: true },
      { date: daysFromNow(88), type: 'anniversary', description: "50th Wedding Anniversary — Golden!", urgent: true }
    ],
    tags: ['retired', 'loyal', 'community-leader', 'referral-source', 'scottsdale'],
    household: [
      { name: 'Patricia Sullivan', relationship: 'Spouse', birthday: '1952-07-08' },
      { name: 'Michael Sullivan', relationship: 'Son', birthday: '1975-11-22' },
      { name: 'Karen Sullivan-Davis', relationship: 'Daughter', birthday: '1978-04-30' }
    ],
    preferences: {
      communication: 'George calls every Thursday. Loves to chat — always allow extra time. Patricia reviews statements.',
      interests: 'Golf (Troon North member), Arizona Cardinals, grandchildren (6 of them), volunteering at Scottsdale Food Bank',
      notes: "Retired Scottsdale school principals — pillars of the community. Have referred 4 clients from their network. George's 75th and 50th anniversary are HUGE opportunities for unreasonable hospitality. Patricia handles their giving — Scottsdale Food Bank and St. Mary's Basilica."
    },
    holdings: [
      { name: 'Vanguard Dividend Appreciation', ticker: 'VIG', type: 'US Equity', value: 2975000, allocation: 35.0, gainLossPct: 14.2 },
      { name: 'iShares Core US Aggregate', ticker: 'AGG', type: 'Fixed Income', value: 2550000, allocation: 30.0, gainLossPct: 2.3 },
      { name: 'Vanguard REIT Index', ticker: 'VNQ', type: 'Real Estate', value: 1275000, allocation: 15.0, gainLossPct: 8.6 },
      { name: 'TIPS Fund', ticker: 'SCHP', type: 'Fixed Income', value: 850000, allocation: 10.0, gainLossPct: 3.8 },
      { name: 'Cash & CDs', ticker: null, type: 'Cash', value: 850000, allocation: 10.0, gainLossPct: 5.1 }
    ],
    recentTransactions: [
      { id: 't1', date: daysAgo(6), type: 'Dividend', asset: 'VIG', description: 'Monthly dividend — VIG', amount: 8925, account: 'Sullivan Joint' },
      { id: 't2', date: daysAgo(15), type: 'Dividend', asset: 'AGG', description: 'Monthly bond income — AGG', amount: 5950, account: 'Sullivan IRA' },
      { id: 't3', date: daysAgo(30), type: 'Fee', asset: null, description: 'Q1 2026 Advisory fee', amount: -1806, account: 'All Accounts' },
      { id: 't4', date: daysAgo(45), type: 'Withdrawal', asset: null, description: 'Monthly income distribution', amount: -12000, account: 'Sullivan Joint' },
      { id: 't5', date: daysAgo(75), type: 'Rebalance', asset: null, description: 'Q4 2025 income rebalance', amount: 0, account: 'All Accounts' }
    ],
    touchpoints: [
      { id: 'tp1', date: daysAgo(6), type: 'phone_call', title: 'Weekly Thursday Call', notes: "George shot a 79 at Troon North — very excited. Markets came up briefly. He's thrilled with the income distributions. Mentioned granddaughter Emma's recital.", sentiment: 'positive' },
      { id: 'tp2', date: daysAgo(13), type: 'phone_call', title: 'Weekly Thursday Call', notes: 'Patricia joined briefly to ask about RMD strategy. Sent follow-up summary. George mentioned the Scottsdale Food Bank fundraiser.', sentiment: 'positive' },
      { id: 'tp3', date: daysAgo(45), type: 'meeting', title: 'Annual Review — In Person (Scottsdale)', notes: 'Flew to Scottsdale for in-person meeting. Reviewed 2025 — 5.8% return, all income goals met. Lunch at their club afterward. Met their daughter Karen.', sentiment: 'positive' },
      { id: 'tp4', date: daysAgo(75), type: 'gift_sent', title: 'Holiday Gift — Scottsdale Sunset Dinner', notes: 'Arranged private sunset dinner at Troon North for George and Patricia. They called it the most special evening they have had in years.', sentiment: 'positive' },
      { id: 'tp5', date: daysAgo(105), type: 'phone_call', title: 'RMD Planning Call', notes: 'Walked through 2026 RMD strategy. Reviewed charitable giving options with Scottsdale Food Bank QCD.', sentiment: 'positive' }
    ],
    serviceRequests: [],
    wireInfo: {
      accountName: 'Sullivan Retirement Trust',
      accountNum:  'GC-2010-008-SRT'
    }
  }

]; // end clients
