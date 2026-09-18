// Known analytics and marketing vendors, matched by request host and by cookie
// name. Deliberately conservative: only entries whose whole purpose is
// analytics or advertising. Anything ambiguous is left out, because a false
// positive in an outreach email costs far more than a missed finding.

export const TRACKER_HOSTS = [
  // Google
  { match: 'google-analytics.com',   vendor: 'Google Analytics',    category: 'analyse' },
  { match: 'analytics.google.com',   vendor: 'Google Analytics',    category: 'analyse' },
  { match: 'googletagmanager.com',   vendor: 'Google Tag Manager',  category: 'analyse' },
  { match: 'doubleclick.net',        vendor: 'Google DoubleClick',  category: 'marketing' },
  { match: 'googleadservices.com',   vendor: 'Google Ads',          category: 'marketing' },
  { match: 'googlesyndication.com',  vendor: 'Google AdSense',      category: 'marketing' },
  // Meta
  { match: 'connect.facebook.net',   vendor: 'Meta Pixel',          category: 'marketing' },
  { match: 'facebook.com/tr',        vendor: 'Meta Pixel',          category: 'marketing' },
  // Microsoft
  { match: 'clarity.ms',             vendor: 'Microsoft Clarity',   category: 'analyse' },
  { match: 'bat.bing.com',           vendor: 'Microsoft Ads (UET)', category: 'marketing' },
  // Session replay and heatmaps
  { match: 'hotjar.com',             vendor: 'Hotjar',              category: 'analyse' },
  { match: 'mouseflow.com',          vendor: 'Mouseflow',           category: 'analyse' },
  { match: 'luckyorange.com',        vendor: 'Lucky Orange',        category: 'analyse' },
  { match: 'fullstory.com',          vendor: 'FullStory',           category: 'analyse' },
  // Social advertising
  { match: 'snap.licdn.com',         vendor: 'LinkedIn Insight',    category: 'marketing' },
  { match: 'ads.linkedin.com',       vendor: 'LinkedIn Ads',        category: 'marketing' },
  { match: 'analytics.tiktok.com',   vendor: 'TikTok Pixel',        category: 'marketing' },
  { match: 'tr.snapchat.com',        vendor: 'Snapchat Pixel',      category: 'marketing' },
  { match: 'sc-static.net',          vendor: 'Snapchat Pixel',      category: 'marketing' },
  { match: 'ads-twitter.com',        vendor: 'X / Twitter Ads',     category: 'marketing' },
  { match: 'ct.pinterest.com',       vendor: 'Pinterest Tag',       category: 'marketing' },
  { match: 'redditstatic.com/ads',   vendor: 'Reddit Pixel',        category: 'marketing' },
  // Ad tech, including the ones that matter in DK
  { match: 'adform.net',             vendor: 'Adform',              category: 'marketing' },
  { match: 'criteo',                 vendor: 'Criteo',              category: 'marketing' },
  { match: 'partner-ads.com',        vendor: 'Partner-ads',         category: 'marketing' },
  { match: 'awin1.com',              vendor: 'Awin',                category: 'marketing' },
  { match: 'tradedoubler.com',       vendor: 'Tradedoubler',        category: 'marketing' },
  // Product analytics and CRM tracking
  { match: 'cdn.segment.com',        vendor: 'Segment',             category: 'analyse' },
  { match: 'cdn.mxpnl.com',          vendor: 'Mixpanel',            category: 'analyse' },
  { match: 'js.hs-scripts.com',      vendor: 'HubSpot',             category: 'marketing' },
  { match: 'js.hsforms.net',         vendor: 'HubSpot',             category: 'marketing' },
  { match: 'static.klaviyo.com',     vendor: 'Klaviyo',             category: 'marketing' },
  { match: 'static.hotjar.com',      vendor: 'Hotjar',              category: 'analyse' },
];

// Cookie names. Exact names and prefixes. A prefix entry ending in '*' matches
// by startsWith.
export const TRACKER_COOKIES = [
  { match: '_ga',      vendor: 'Google Analytics',    category: 'analyse' },
  { match: '_ga_*',    vendor: 'Google Analytics',    category: 'analyse' },
  { match: '_gid',     vendor: 'Google Analytics',    category: 'analyse' },
  { match: '_gat*',    vendor: 'Google Analytics',    category: 'analyse' },
  { match: '_gac_*',   vendor: 'Google Ads',          category: 'marketing' },
  { match: '_gcl_*',   vendor: 'Google Ads',          category: 'marketing' },
  { match: 'IDE',      vendor: 'Google DoubleClick',  category: 'marketing' },
  { match: 'test_cookie', vendor: 'Google DoubleClick', category: 'marketing' },
  { match: '_fbp',     vendor: 'Meta Pixel',          category: 'marketing' },
  { match: '_fbc',     vendor: 'Meta Pixel',          category: 'marketing' },
  { match: '_hj*',     vendor: 'Hotjar',              category: 'analyse' },
  { match: '_clck',    vendor: 'Microsoft Clarity',   category: 'analyse' },
  { match: '_clsk',    vendor: 'Microsoft Clarity',   category: 'analyse' },
  { match: '_uetsid',  vendor: 'Microsoft Ads (UET)', category: 'marketing' },
  { match: '_uetvid',  vendor: 'Microsoft Ads (UET)', category: 'marketing' },
  { match: 'bcookie',  vendor: 'LinkedIn Insight',    category: 'marketing' },
  { match: 'lidc',     vendor: 'LinkedIn Insight',    category: 'marketing' },
  { match: 'li_sugr',  vendor: 'LinkedIn Insight',    category: 'marketing' },
  { match: 'UserMatchHistory', vendor: 'LinkedIn Ads', category: 'marketing' },
  { match: '_ttp',     vendor: 'TikTok Pixel',        category: 'marketing' },
  { match: '_tt_enable_cookie', vendor: 'TikTok Pixel', category: 'marketing' },
  { match: '_pin_unauth', vendor: 'Pinterest Tag',    category: 'marketing' },
  { match: '_pk_*',    vendor: 'Matomo',              category: 'analyse' },
  { match: 'mf_*',     vendor: 'Mouseflow',           category: 'analyse' },
  { match: 'ajs_*',    vendor: 'Segment',             category: 'analyse' },
  { match: '__hstc',   vendor: 'HubSpot',             category: 'marketing' },
  { match: 'hubspotutk', vendor: 'HubSpot',           category: 'marketing' },
  { match: '__kla_id', vendor: 'Klaviyo',             category: 'marketing' },
];

// Consent management platforms, by DOM selector. Knowing which CMP is in use
// matters commercially: the fix is a settings change in a tool they already
// pay for, which is a much easier yes than "replace your setup".
export const CMPS = [
  { name: 'Cookiebot',           selector: '#CybotCookiebotDialog' },
  { name: 'Cookie Information',  selector: '#coi-banner-wrapper, .coi-banner__wrapper' },
  { name: 'CookieYes',           selector: '.cky-consent-container, .cky-modal' },
  { name: 'Complianz',           selector: '#cmplz-cookiebanner-container' },
  { name: 'Iubenda',             selector: '#iubenda-cs-banner' },
  { name: 'OneTrust',            selector: '#onetrust-banner-sdk' },
  { name: 'Usercentrics',        selector: '#usercentrics-root' },
  { name: 'Didomi',              selector: '#didomi-host' },
  { name: 'Klaro',               selector: '.klaro .cookie-notice' },
  { name: 'Borlabs Cookie',      selector: '#BorlabsCookieBox' },
  { name: 'Osano',               selector: '.osano-cm-window' },
  { name: 'Quantcast',           selector: '.qc-cmp2-container' },
  { name: 'Real Cookie Banner',  selector: '.rcb-banner, [class*="rcb-banner"]' },
  { name: 'Cookie Notice (WP)',  selector: '#cookie-notice' },
  { name: 'Moove GDPR (WP)',     selector: '#moove_gdpr_cookie_info_bar' },
  { name: 'Termly',              selector: '#termly-code-snippet-support' },
];

// Button text. Lowercased, accent-insensitive comparison happens in detect.mjs.
export const REJECT_PATTERNS = [
  'afvis alle', 'afvis', 'naegt', 'nej tak', 'fravaelg',
  'kun noedvendige', 'kun noedvendig', 'tillad kun noedvendige',
  'kun funktionelle', 'afvis ikke-noedvendige',
  'reject all', 'reject', 'decline', 'deny',
  'only necessary', 'necessary only', 'essential only',
  'continue without accepting',
];

export const ACCEPT_PATTERNS = [
  'accepter alle', 'accepter', 'tillad alle', 'jeg accepterer', 'tillad',
  'forstaet', 'ok',
  'accept all', 'allow all', 'i accept', 'agree', 'got it',
];

// A settings link is explicitly NOT a reject control. Datatilsynet's principial
// decision requires rejecting to be as easy as accepting, which means on the
// first layer, not one click deeper.
export const SETTINGS_PATTERNS = [
  'indstillinger', 'tilpas', 'vis detaljer', 'flere valg', 'administrer',
  'settings', 'customise', 'customize', 'manage', 'preferences', 'show details',
];

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/\s+/g, ' ')
    .trim();

export function matchHost(url) {
  const u = (url || '').toLowerCase();
  return TRACKER_HOSTS.find((t) => u.includes(t.match)) || null;
}

export function matchCookie(name) {
  const n = name || '';
  for (const t of TRACKER_COOKIES) {
    if (t.match.endsWith('*')) {
      if (n.startsWith(t.match.slice(0, -1))) return t;
    } else if (n === t.match) {
      return t;
    }
  }
  return null;
}

export function classifyLabel(text) {
  const t = norm(text);
  if (!t || t.length > 60) return null;
  // Order matters. Settings is checked first so that "administrer samtykke"
  // is never mistaken for a reject control.
  if (SETTINGS_PATTERNS.some((p) => t === p || t.startsWith(p))) return 'settings';
  if (REJECT_PATTERNS.some((p) => t === p || t.startsWith(p))) return 'reject';
  if (ACCEPT_PATTERNS.some((p) => t === p || t.startsWith(p))) return 'accept';
  return null;
}

export { norm };
