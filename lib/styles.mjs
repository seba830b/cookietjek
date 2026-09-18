// Delt mellem landingssiden og rapporterne, saa de to ikke driver fra hinanden.
export const SHARED_CSS = `
  :root {
    --bg:#ffffff; --fg:#16181d; --muted:#5d636e; --line:#e2e5ea;
    --card:#f7f8fa; --accent:#1f5fd6; --warn-bg:#fff6f4; --warn-line:#e8b4a8;
    --ok-bg:#f2f9f3; --ok-line:#a9d4b1;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg:#14161a; --fg:#e8eaee; --muted:#9aa1ad; --line:#2b2f37;
      --card:#1b1e24; --accent:#6aa3ff; --warn-bg:#2a1d1a; --warn-line:#6b3f34;
      --ok-bg:#18241b; --ok-line:#35583c;
    }
  }
  :root[data-theme="dark"] {
    --bg:#14161a; --fg:#e8eaee; --muted:#9aa1ad; --line:#2b2f37;
    --card:#1b1e24; --accent:#6aa3ff; --warn-bg:#2a1d1a; --warn-line:#6b3f34;
    --ok-bg:#18241b; --ok-line:#35583c;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);
       font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  .wrap{max-width:720px;margin:0 auto;padding:48px 16px 80px}
  h1{font-size:1.9rem;line-height:1.22;margin:0 0 14px;letter-spacing:-.01em}
  h2{font-size:1.15rem;margin:36px 0 12px}
  h3{font-size:.9rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:22px 0 8px}
  p{margin:0 0 15px}
  .muted{color:var(--muted)}
  .small{font-size:.89rem}
  .lead{font-size:1.08rem;color:var(--muted)}
  .mono,code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.87em}
  .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:20px;margin:0 0 18px}
  .finding{border:1px solid var(--line);border-radius:10px;padding:20px;margin:0 0 18px;background:var(--card)}
  .finding.alvorlig{background:var(--warn-bg);border-color:var(--warn-line)}
  .finding.ok{background:var(--ok-bg);border-color:var(--ok-line)}
  table{width:100%;border-collapse:collapse;margin:0 0 8px;font-size:.92rem}
  th{text-align:left;font-weight:600;color:var(--muted);font-size:.8rem;text-transform:uppercase;
     letter-spacing:.03em;padding:6px 10px 6px 0;border-bottom:1px solid var(--line)}
  td{padding:7px 10px 7px 0;border-bottom:1px solid var(--line);vertical-align:top}
  td:last-child,th:last-child{padding-right:0}
  figure{margin:0 0 22px}
  img{width:100%;height:auto;display:block;border:1px solid var(--line);border-radius:8px}
  figcaption{color:var(--muted);font-size:.85rem;margin-top:8px}
  .tilbud{border:2px solid var(--accent);border-radius:10px;padding:24px;margin:32px 0 22px}
  .pris{font-size:1.9rem;font-weight:700;margin:4px 0 2px}
  .btn{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;
       padding:11px 20px;border-radius:7px;font-weight:600;margin-top:10px}
  .btn:hover{filter:brightness(1.08)}
  .btn.sekundaer{background:transparent;color:var(--accent);border:2px solid var(--accent)}
  a{color:var(--accent)}
  ol,ul{margin:0 0 15px;padding-left:20px}
  li{margin-bottom:7px}
  header{border-bottom:1px solid var(--line);padding-bottom:22px;margin-bottom:30px}
  footer{border-top:1px solid var(--line);margin-top:46px;padding-top:20px}
  @media print{.tilbud{break-inside:avoid}body{background:#fff;color:#000}}
`;

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const kr = (n) => Number(n).toLocaleString('da-DK');
