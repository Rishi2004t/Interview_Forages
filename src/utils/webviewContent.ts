import * as vscode from 'vscode';

export function getWebviewContent(
  webview: vscode.Webview,
  _context: vscode.ExtensionContext
): string {
  const nonce = getNonce();
  const csp   = `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';`;

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="Content-Security-Policy" content="${csp}"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>InterviewForge</title>
  <style nonce="${nonce}">
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    :root{
      --bg:#0d0f17; --sf:#13161f; --sf2:#191c28;
      --bd:#1e2235; --bd-hi:#2d3250;
      --acc:#7c6af7; --acc-glow:#7c6af740; --acc-dim:#7c6af720;
      --txt:#e2e4f0; --mu:#6b7280;
      --gr:#4ade80; --gr-bg:#0d2b1e; --gr-bd:#1a4d32;
      --bl:#60a5fa;
      --tl:#2dd4bf; --tl-glow:#2dd4bf30; --tl-dim:#2dd4bf18; --tl-bd:#2dd4bf50;
      --or:#fb923c; --or-bg:#2a1500; --or-bd:#7c3a00;
      --red:#f87171;
      --sans:'Segoe UI',system-ui,sans-serif;
      --mono:'Cascadia Code','Fira Code',Consolas,monospace;
      --r:12px; --r-sm:8px;
      --ease:220ms cubic-bezier(.4,0,.2,1);
    }

    html,body{background:var(--bg);color:var(--txt);font-family:var(--sans);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}

    .app{display:flex;flex-direction:column;align-items:center;padding:1.5rem 1.25rem 3rem;gap:1.5rem;min-height:100vh}
    .w100{width:100%}
    .hidden{display:none!important}

    /* Logo */
    .logo-ring{position:relative;width:72px;height:72px;flex-shrink:0}
    .logo-ring svg{width:100%;height:100%;animation:spin 8s linear infinite}
    .logo-center{position:absolute;inset:50%;transform:translate(-50%,-50%);font-size:26px}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* Status */
    .status-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 13px;background:var(--gr-bg);border:1px solid var(--gr-bd);border-radius:999px;color:var(--gr);font-size:11px;font-weight:600;letter-spacing:.04em}
    .status-dot{width:6px;height:6px;border-radius:50%;background:var(--gr);animation:pulse 2s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}

    /* Hero */
    .hero{text-align:center}
    .hero h1{font-size:clamp(1.4rem,4vw,2rem);font-weight:700;letter-spacing:-.02em;background:linear-gradient(135deg,#a78bfa,#60a5fa,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .hero p{margin-top:.4rem;color:var(--mu);font-size:12px}

    /* Cards */
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%}
    .card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:12px 10px;display:flex;flex-direction:column;gap:5px;transition:border-color var(--ease),box-shadow var(--ease)}
    .card:hover{border-color:var(--acc);box-shadow:0 0 14px var(--acc-glow)}
    .card-icon{font-size:18px}.card-label{font-size:10px;font-weight:600;color:var(--mu);text-transform:uppercase;letter-spacing:.06em}.card-desc{font-size:11px;opacity:.8}

    /* Buttons */
    .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:9px 20px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:12px;font-weight:600;cursor:pointer;transition:opacity var(--ease),box-shadow var(--ease),transform var(--ease)}
    .btn-primary:hover{opacity:.88;box-shadow:0 0 18px var(--acc-glow);transform:translateY(-1px)}
    .btn-primary:active{transform:translateY(0)}
    .btn-outlined{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:9px 16px;background:transparent;border-radius:var(--r-sm);font-size:12px;font-weight:600;cursor:pointer;transition:background var(--ease),box-shadow var(--ease),transform var(--ease)}
    .btn-outlined:disabled{opacity:.3;cursor:not-allowed}
    .btn-load   {color:var(--acc);border:1px solid var(--acc)}
    .btn-explain{color:var(--tl); border:1px solid var(--tl)}
    .btn-load:hover:not(:disabled)   {background:var(--acc-dim);box-shadow:0 0 14px var(--acc-glow);transform:translateY(-1px)}
    .btn-explain:hover:not(:disabled){background:var(--tl-dim); box-shadow:0 0 14px var(--tl-glow); transform:translateY(-1px)}
    .btn-load:active:not(:disabled),.btn-explain:active:not(:disabled){transform:translateY(0)}
    .btn-load:disabled,.btn-explain:disabled{border-color:var(--bd);color:var(--mu)}

    /* Divider */
    .divider{width:100%;height:1px;background:var(--bd);flex-shrink:0}

    /* File card */
    .file-card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:14px;display:flex;flex-direction:column;gap:12px}
    .file-card-header{display:flex;align-items:center;gap:8px}
    .file-card-icon{font-size:16px}
    .file-card-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--mu)}
    .no-editor-msg{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg);border:1px dashed var(--bd);border-radius:var(--r-sm);color:var(--mu);font-size:12px;font-style:italic}
    .file-meta-grid{display:flex;flex-direction:column;gap:7px}
    .meta-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;background:var(--bg);border-radius:var(--r-sm);border:1px solid var(--bd)}
    .meta-label{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--mu);white-space:nowrap}
    .meta-value{font-size:12px;font-weight:500;font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;text-align:right}
    .meta-value.lang-badge{padding:1px 8px;background:var(--acc-dim);border:1px solid var(--acc);border-radius:999px;color:var(--acc);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
    .btn-pair{display:flex;flex-direction:column;gap:8px}

    /* Code section */
    .code-section{display:flex;flex-direction:column;border:1px solid var(--bd);border-radius:var(--r);overflow:hidden;background:var(--sf)}
    .code-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;background:var(--sf2);border-bottom:1px solid var(--bd);flex-shrink:0}
    .code-filename{font-size:11px;font-weight:600;font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .code-lang-chip{font-size:10px;font-weight:700;color:var(--bl);background:#1e3a5f40;border:1px solid #60a5fa40;border-radius:999px;padding:1px 8px;white-space:nowrap;text-transform:uppercase;letter-spacing:.04em}
    .code-block{margin:0;padding:12px;overflow:auto;max-height:280px;background:#090b12;font-family:var(--mono);font-size:11px;line-height:1.65;color:#c9d1d9;white-space:pre;tab-size:2;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}
    .code-block::-webkit-scrollbar{width:6px;height:6px}
    .code-block::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}

    /* Shared: loading dots */
    .loader-row{display:flex;align-items:center;gap:14px;padding:20px 14px;color:var(--mu);font-size:12px}
    .dot-row{display:flex;gap:5px}
    .dot{width:7px;height:7px;border-radius:50%;background:var(--tl);animation:dot-bounce 1.4s ease-in-out infinite}
    .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
    @keyframes dot-bounce{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-7px);opacity:1}}

    /* Shared: card shell */
    .card-shell{background:var(--sf);border-radius:var(--r);overflow:hidden}
    .card-hdr{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid;flex-shrink:0}
    .card-hdr-icon{font-size:16px}
    .card-hdr-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;flex:1}
    .card-hdr-badge{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--mu);background:var(--bg);border:1px solid var(--bd);border-radius:999px;padding:2px 8px}

    /* Analysis section */
    .analysis-section{border:1px solid var(--tl-bd);box-shadow:0 0 24px var(--tl-glow)}
    .analysis-hdr{background:linear-gradient(90deg,#0a2420,#111827);border-bottom-color:#2dd4bf25}
    .analysis-hdr-title{color:var(--tl)}
    .analysis-error{display:flex;align-items:flex-start;gap:10px;padding:14px 16px;margin:12px;background:var(--or-bg);border:1px solid var(--or-bd);border-radius:var(--r-sm);color:var(--or)}
    .err-icon{font-size:16px;flex-shrink:0;padding-top:1px}
    .err-title{font-size:11px;font-weight:700;margin-bottom:3px}
    .err-msg{font-size:11px;opacity:.85;line-height:1.5}
    .analysis-results{display:flex;flex-direction:column}
    .ai-block{padding:12px 14px;border-bottom:1px solid var(--bd)}
    .ai-block:last-child{border-bottom:none}
    .ai-block-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--tl);margin-bottom:7px}
    .ai-block-text{font-size:12px;line-height:1.65;opacity:.9}
    .complexity-row{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--bd);border-bottom:1px solid var(--bd)}
    .complexity-card{display:flex;flex-direction:column;gap:5px;padding:12px 14px;background:var(--sf)}
    .complexity-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--mu)}
    .complexity-val{font-size:12px;font-weight:600;font-family:var(--mono);line-height:1.4}
    .ai-list{list-style:none;display:flex;flex-direction:column;gap:6px}
    .ai-list li{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:1.55;opacity:.9}
    .ai-list li::before{content:attr(data-marker);flex-shrink:0;font-size:11px;font-weight:700;color:var(--tl);padding-top:1px;min-width:16px}

    /* Mock Interview section */
    .interview-section{border:1px solid var(--acc);box-shadow:0 0 24px var(--acc-glow)}
    .interview-hdr{background:linear-gradient(90deg,#1a1040,#111827);border-bottom-color:#7c6af730}
    .interview-hdr-title{color:var(--acc)}
    .interview-body{padding:14px;display:flex;flex-direction:column;gap:12px}
    .iv-error{display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--or-bg);border:1px solid var(--or-bd);border-radius:var(--r-sm);color:var(--or);font-size:11px}
    .iv-err-msg{flex:1;line-height:1.4}
    .btn-dismiss{background:none;border:none;color:var(--or);cursor:pointer;font-size:14px;flex-shrink:0;padding:0 2px}
    .interview-intro{font-size:12px;color:var(--mu);line-height:1.55}
    .btn-start{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:12px;font-weight:600;cursor:pointer;transition:opacity var(--ease),box-shadow var(--ease),transform var(--ease)}
    .btn-start:hover:not(:disabled){opacity:.88;box-shadow:0 0 18px var(--acc-glow);transform:translateY(-1px)}
    .btn-start:active:not(:disabled){transform:translateY(0)}
    .btn-start:disabled{opacity:.35;cursor:not-allowed}
    .iv-progress{display:flex;flex-direction:column;gap:6px}
    .iv-progress-label{font-size:11px;color:var(--mu);font-weight:600}
    .iv-progress-bar{height:3px;background:var(--bd);border-radius:999px;overflow:hidden}
    .iv-progress-fill{height:100%;background:var(--acc);border-radius:999px;transition:width .5s ease}
    .iv-question-card{background:var(--bg);border:1px solid var(--bd);border-radius:var(--r-sm);padding:12px}
    .iv-question-text{font-size:13px;line-height:1.65}
    .iv-textarea{width:100%;background:var(--bg);border:1px solid var(--bd);border-radius:var(--r-sm);color:var(--txt);font-family:var(--sans);font-size:12px;padding:10px 12px;resize:vertical;line-height:1.6;outline:none;transition:border-color var(--ease)}
    .iv-textarea:focus{border-color:var(--acc)}
    .iv-textarea::placeholder{color:var(--mu);opacity:.7}
    .btn-action{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:9px 16px;background:transparent;color:var(--acc);border:1px solid var(--acc);border-radius:var(--r-sm);font-size:12px;font-weight:600;cursor:pointer;transition:background var(--ease),box-shadow var(--ease),transform var(--ease)}
    .btn-action:hover:not(:disabled){background:var(--acc-dim);box-shadow:0 0 14px var(--acc-glow);transform:translateY(-1px)}
    .btn-action:active:not(:disabled){transform:translateY(0)}
    .btn-action:disabled{opacity:.35;cursor:not-allowed}
    .iv-score-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--bd)}
    .iv-score-badge{font-size:18px;font-weight:800;font-family:var(--mono);width:64px;text-align:center;flex-shrink:0}
    .score-hi{color:var(--tl)}.score-mid{color:var(--or)}.score-lo{color:var(--red)}
    .iv-score-bar-wrap{flex:1;height:6px;background:var(--bd);border-radius:999px;overflow:hidden}
    .iv-score-bar{height:100%;border-radius:999px;transition:width .6s ease}
    .bar-hi{background:var(--tl)}.bar-mid{background:var(--or)}.bar-lo{background:var(--red)}
    .iv-eval-block{display:flex;flex-direction:column;gap:5px;padding:11px 0;border-bottom:1px solid var(--bd)}
    .iv-eval-block:last-child{border-bottom:none}
    .iv-eval-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--acc)}
    .iv-eval-text{font-size:12px;line-height:1.6;opacity:.9}
    .iv-eval-italic{font-style:italic}
    .iv-complete{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px 0;text-align:center;color:var(--tl);font-size:14px;font-weight:700}
    .btn-restart{padding:7px 18px;background:transparent;color:var(--acc);border:1px solid var(--acc);border-radius:var(--r-sm);font-size:11px;font-weight:600;cursor:pointer;transition:background var(--ease)}
    .btn-restart:hover{background:var(--acc-dim)}

    /* ── Interview History section ── */
    .history-section{border:1px solid var(--bd-hi)}
    .history-hdr{background:var(--sf2);border-bottom-color:var(--bd)}
    .history-hdr-title{color:var(--mu)}

    .btn-clear-history{
      padding:3px 10px;background:transparent;
      color:var(--mu);border:1px solid var(--bd);
      border-radius:999px;font-size:10px;font-weight:600;
      cursor:pointer;transition:color var(--ease),border-color var(--ease);
      flex-shrink:0;
    }
    .btn-clear-history:hover{color:var(--or);border-color:var(--or-bd)}

    .history-empty{
      padding:24px 14px;text-align:center;
      color:var(--mu);font-size:12px;font-style:italic;line-height:1.6;
    }

    .history-list{list-style:none;display:flex;flex-direction:column}

    .history-entry{
      display:flex;flex-direction:column;gap:5px;
      padding:11px 14px;border-bottom:1px solid var(--bd);
      transition:background var(--ease);
    }
    .history-entry:last-child{border-bottom:none}
    .history-entry:hover{background:var(--sf2)}

    .he-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .he-filename{
      font-size:12px;font-weight:600;font-family:var(--mono);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
    }
    .he-score{font-size:15px;font-weight:800;font-family:var(--mono);flex-shrink:0}

    .he-bottom{display:flex;align-items:center;justify-content:space-between;margin-top:1px}
    .he-date{font-size:10px;color:var(--mu)}
    .he-meta{
      font-size:10px;color:var(--mu);
      background:var(--bg);border:1px solid var(--bd);
      border-radius:999px;padding:1px 7px;
    }

    /* Footer */
    .footer-note{font-size:10px;color:var(--mu);opacity:.45;font-family:var(--mono)}
  </style>
</head>
<body>
<main class="app" role="main">

  <!-- Brand -->
  <div class="logo-ring" aria-hidden="true">
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" stroke="#1e2235" stroke-width="2"/>
      <circle cx="40" cy="40" r="36" stroke="url(#g)" stroke-width="2" stroke-dasharray="60 165" stroke-linecap="round"/>
      <defs><linearGradient id="g" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#7c6af7"/><stop offset="100%" stop-color="#60a5fa"/>
      </linearGradient></defs>
    </svg>
    <span class="logo-center">🎯</span>
  </div>
  <div class="status-badge" role="status"><span class="status-dot"></span>InterviewForge Ready</div>
  <section class="hero" aria-labelledby="hero-title">
    <h1 id="hero-title">AI Interview Assistant</h1>
    <p>Analyze your code. Ace the interview.</p>
  </section>
  <div class="cards" role="list">
    <article class="card" role="listitem"><span class="card-icon">🔍</span><span class="card-label">Analyze</span><span class="card-desc">Deep code analysis</span></article>
    <article class="card" role="listitem"><span class="card-icon">💬</span><span class="card-label">Q&amp;A</span><span class="card-desc">AI questions</span></article>
    <article class="card" role="listitem"><span class="card-icon">⚡</span><span class="card-label">Practice</span><span class="card-desc">Live feedback</span></article>
  </div>
  <button id="btn-open-panel" class="btn-primary" type="button"><span>▶</span> Open Full Panel</button>

  <div class="divider" role="separator"></div>

  <!-- File Info Card -->
  <section class="file-card w100" aria-labelledby="fc-title">
    <header class="file-card-header">
      <span class="file-card-icon" aria-hidden="true">📄</span>
      <h2 id="fc-title" class="file-card-title">Current File</h2>
    </header>
    <div aria-live="polite">
      <div class="no-editor-msg" id="no-editor-msg"><span>⚠</span> No active editor found</div>
      <div id="file-meta-grid" class="file-meta-grid hidden">
        <div class="meta-row"><span class="meta-label">📁 File</span><span class="meta-value" id="meta-filename">—</span></div>
        <div class="meta-row"><span class="meta-label">🏷 Language</span><span class="meta-value lang-badge" id="meta-language">—</span></div>
        <div class="meta-row"><span class="meta-label">📏 Lines</span><span class="meta-value" id="meta-lines">—</span></div>
      </div>
    </div>
    <div class="btn-pair">
      <button id="btn-load-code" class="btn-outlined btn-load" type="button" disabled><span>⬇</span> Load Current Code</button>
      <button id="btn-explain-code" class="btn-outlined btn-explain" type="button" disabled>🧠 Explain Code</button>
    </div>
  </section>

  <!-- Code Viewer -->
  <section id="code-section" class="code-section w100 hidden" aria-label="Code viewer">
    <div class="code-header">
      <span class="code-filename" id="code-header-filename">—</span>
      <span class="code-lang-chip" id="code-header-lang">—</span>
    </div>
    <pre id="code-block" class="code-block" tabindex="0" role="region"><code id="code-content"></code></pre>
  </section>

  <!-- AI Analysis -->
  <section id="analysis-section" class="card-shell analysis-section w100 hidden" aria-live="polite">
    <div class="card-hdr analysis-hdr">
      <span class="card-hdr-icon" aria-hidden="true">🧠</span>
      <h2 class="card-hdr-title analysis-hdr-title">AI Analysis</h2>
      <span class="card-hdr-badge">Groq AI</span>
    </div>
    <div id="analysis-loading" class="loader-row hidden" role="status">
      <div class="dot-row" aria-hidden="true"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      <span>Analyzing Code…</span>
    </div>
    <div id="analysis-error" class="analysis-error hidden" role="alert">
      <span class="err-icon">⚠</span>
      <div><div class="err-title">Analysis Failed</div><div id="analysis-error-msg" class="err-msg">—</div></div>
    </div>
    <div id="analysis-results" class="analysis-results hidden">
      <div class="ai-block"><div class="ai-block-label">📋 Summary</div><p id="ai-summary" class="ai-block-text">—</p></div>
      <div class="complexity-row">
        <div class="complexity-card"><span class="complexity-lbl">⏱ Time Complexity</span><span id="ai-time" class="complexity-val">—</span></div>
        <div class="complexity-card"><span class="complexity-lbl">💾 Space Complexity</span><span id="ai-space" class="complexity-val">—</span></div>
      </div>
      <div class="ai-block"><div class="ai-block-label">🔄 Alternative Approaches</div><ul id="ai-approaches" class="ai-list"></ul></div>
      <div class="ai-block"><div class="ai-block-label">💬 Interview Questions</div><ol id="ai-questions" class="ai-list"></ol></div>
    </div>
  </section>

  <div class="divider" role="separator"></div>

  <!-- Mock Interview -->
  <section id="interview-section" class="card-shell interview-section w100" aria-live="polite">
    <div class="card-hdr interview-hdr">
      <span class="card-hdr-icon" aria-hidden="true">🎤</span>
      <h2 class="card-hdr-title interview-hdr-title">Mock Interview</h2>
      <span class="card-hdr-badge" id="iv-badge">5 Questions</span>
    </div>
    <div class="interview-body">
      <div id="iv-error" class="iv-error hidden" role="alert">
        <span>⚠</span>
        <span id="iv-error-msg" class="iv-err-msg">—</span>
        <button id="btn-dismiss-err" class="btn-dismiss" type="button">✕</button>
      </div>
      <!-- Idle -->
      <div id="iv-idle">
        <p class="interview-intro" style="margin-bottom:10px">Answer 5 AI-generated technical questions based on your loaded code. Get scored, receive feedback, and a follow-up after each answer.</p>
        <button id="btn-start-interview" class="btn-start" type="button" disabled>🚀 Start Mock Interview</button>
      </div>
      <!-- Loading questions -->
      <div id="iv-loading" class="loader-row hidden" role="status">
        <div class="dot-row" aria-hidden="true"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        <span>Generating questions…</span>
      </div>
      <!-- Active question -->
      <div id="iv-active" class="hidden">
        <div class="iv-progress">
          <span class="iv-progress-label">Question <span id="iv-q-index">1</span> of <span id="iv-q-total">5</span></span>
          <div class="iv-progress-bar"><div id="iv-progress-fill" class="iv-progress-fill" style="width:20%"></div></div>
        </div>
        <div class="iv-question-card"><p id="iv-question-text" class="iv-question-text">—</p></div>
        <textarea id="iv-answer-textarea" class="iv-textarea" placeholder="Type your answer here…" rows="5" aria-label="Your answer"></textarea>
        <button id="btn-submit-answer" class="btn-action" type="button">Submit Answer →</button>
      </div>
      <!-- Evaluating -->
      <div id="iv-evaluating" class="loader-row hidden" role="status">
        <div class="dot-row" aria-hidden="true"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        <span>Evaluating your answer…</span>
      </div>
      <!-- Evaluation result -->
      <div id="iv-eval" class="hidden">
        <div class="iv-score-row">
          <span id="iv-score-badge" class="iv-score-badge">—</span>
          <div class="iv-score-bar-wrap"><div id="iv-score-bar" class="iv-score-bar"></div></div>
        </div>
        <div class="iv-eval-block"><div class="iv-eval-label">📝 Feedback</div><p id="iv-feedback" class="iv-eval-text">—</p></div>
        <div class="iv-eval-block"><div class="iv-eval-label">🔁 Follow-up Question</div><p id="iv-followup" class="iv-eval-text iv-eval-italic">—</p></div>
        <div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">
          <button id="btn-next-question" class="btn-action hidden" type="button">Next Question →</button>
          <div id="iv-complete" class="iv-complete hidden">
            <span>🎉 Interview Complete!</span>
            <button id="btn-restart-interview" class="btn-restart" type="button">Start Again</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider" role="separator"></div>

  <!-- ════════════════════════════════════════════
       Interview History Section
       ════════════════════════════════════════════ -->
  <section id="history-section" class="card-shell history-section w100" aria-label="Interview History">
    <div class="card-hdr history-hdr">
      <span class="card-hdr-icon" aria-hidden="true">📊</span>
      <h2 class="card-hdr-title history-hdr-title">Interview History</h2>
      <button id="btn-clear-history" class="btn-clear-history" type="button" title="Clear all history">
        Clear
      </button>
    </div>

    <!-- Empty state -->
    <div id="history-empty" class="history-empty">
      No sessions yet.<br>Complete a Mock Interview to see your history here.
    </div>

    <!-- Session list (max 10) -->
    <ul id="history-list" class="history-list hidden" aria-label="Past interview sessions"></ul>
  </section>

  <p class="footer-note" aria-hidden="true">v0.0.1 · Powered by Groq</p>
</main>

<script nonce="${nonce}">
'use strict';
const vscode = acquireVsCodeApi();

// ── DOM refs ──────────────────────────────────────────────────
const elNoEditor       = document.getElementById('no-editor-msg');
const elMetaGrid       = document.getElementById('file-meta-grid');
const elMetaFilename   = document.getElementById('meta-filename');
const elMetaLanguage   = document.getElementById('meta-language');
const elMetaLines      = document.getElementById('meta-lines');
const elBtnLoad        = document.getElementById('btn-load-code');
const elBtnExplain     = document.getElementById('btn-explain-code');
const elCodeSection    = document.getElementById('code-section');
const elCodeFilename   = document.getElementById('code-header-filename');
const elCodeLang       = document.getElementById('code-header-lang');
const elCodeContent    = document.getElementById('code-content');
// Analysis
const elAnalysis       = document.getElementById('analysis-section');
const elAnalysisLoad   = document.getElementById('analysis-loading');
const elAnalysisErr    = document.getElementById('analysis-error');
const elAnalysisErrMsg = document.getElementById('analysis-error-msg');
const elAnalysisRes    = document.getElementById('analysis-results');
const elAiSummary      = document.getElementById('ai-summary');
const elAiTime         = document.getElementById('ai-time');
const elAiSpace        = document.getElementById('ai-space');
const elAiApproaches   = document.getElementById('ai-approaches');
const elAiQuestions    = document.getElementById('ai-questions');
// Interview
const elIvError        = document.getElementById('iv-error');
const elIvErrorMsg     = document.getElementById('iv-error-msg');
const elIvIdle         = document.getElementById('iv-idle');
const elIvLoading      = document.getElementById('iv-loading');
const elIvActive       = document.getElementById('iv-active');
const elIvEvaluating   = document.getElementById('iv-evaluating');
const elIvEval         = document.getElementById('iv-eval');
const elBtnStart       = document.getElementById('btn-start-interview');
const elQIndex         = document.getElementById('iv-q-index');
const elQTotal         = document.getElementById('iv-q-total');
const elProgressFill   = document.getElementById('iv-progress-fill');
const elQuestionText   = document.getElementById('iv-question-text');
const elAnswerTA       = document.getElementById('iv-answer-textarea');
const elBtnSubmit      = document.getElementById('btn-submit-answer');
const elScoreBadge     = document.getElementById('iv-score-badge');
const elScoreBar       = document.getElementById('iv-score-bar');
const elFeedback       = document.getElementById('iv-feedback');
const elFollowup       = document.getElementById('iv-followup');
const elBtnNext        = document.getElementById('btn-next-question');
const elIvComplete     = document.getElementById('iv-complete');
const elBtnRestart     = document.getElementById('btn-restart-interview');
const elIvBadge        = document.getElementById('iv-badge');
// History
const elHistoryEmpty   = document.getElementById('history-empty');
const elHistoryList    = document.getElementById('history-list');
const elBtnClearHistory= document.getElementById('btn-clear-history');

// ── Client state ──────────────────────────────────────────────
let nextQ = null;

// ── Helpers ───────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function renderList(ul, items, ordered) {
  ul.innerHTML = '';
  (items || []).forEach((text, i) => {
    const li = document.createElement('li');
    li.setAttribute('data-marker', ordered ? (i+1)+'.' : '→');
    li.textContent = text;
    ul.appendChild(li);
  });
}

function ivState(state) {
  elIvIdle.classList.toggle      ('hidden', state !== 'idle');
  elIvLoading.classList.toggle   ('hidden', state !== 'loading');
  elIvActive.classList.toggle    ('hidden', state !== 'active');
  elIvEvaluating.classList.toggle('hidden', state !== 'evaluating');
  elIvEval.classList.toggle      ('hidden', state !== 'eval');
}

// ── File info / code renderers ────────────────────────────────
function renderFileInfo(p) {
  elNoEditor.classList.add('hidden');
  elMetaGrid.classList.remove('hidden');
  elMetaFilename.textContent = p.fileName;
  elMetaLanguage.textContent = p.language;
  elMetaLines.textContent    = p.lineCount.toLocaleString();
  elBtnLoad.disabled         = false;
}

function renderNoEditor() {
  elNoEditor.classList.remove('hidden');
  elMetaGrid.classList.add('hidden');
  elCodeSection.classList.add('hidden');
  elAnalysis.classList.add('hidden');
  elBtnLoad.disabled    = true;
  elBtnExplain.disabled = true;
  elBtnStart.disabled   = true;
  elBtnLoad.innerHTML   = '<span>⬇</span> Load Current Code';
}

function renderCode(p) {
  elCodeFilename.textContent = p.fileName;
  elCodeLang.textContent     = p.language;
  elCodeContent.innerHTML    = escapeHtml(p.code);
  elCodeSection.classList.remove('hidden');
  elBtnExplain.disabled      = false;
  elBtnStart.disabled        = false;
  document.getElementById('code-block').scrollTop = 0;
}

// ── Analysis renderers ────────────────────────────────────────
function showAnalysisLoading() {
  elAnalysis.classList.remove('hidden');
  elAnalysisLoad.classList.remove('hidden');
  elAnalysisErr.classList.add('hidden');
  elAnalysisRes.classList.add('hidden');
  elAnalysis.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function renderAnalysisResults(p) {
  elAnalysisLoad.classList.add('hidden');
  elAnalysisErr.classList.add('hidden');
  elAnalysisRes.classList.remove('hidden');
  elAiSummary.textContent = p.summary          || '—';
  elAiTime.textContent    = p.timeComplexity    || '—';
  elAiSpace.textContent   = p.spaceComplexity   || '—';
  renderList(elAiApproaches, p.alternativeApproaches, false);
  renderList(elAiQuestions,  p.interviewQuestions,    true);
}

function renderAnalysisError(msg) {
  elAnalysisLoad.classList.add('hidden');
  elAnalysisRes.classList.add('hidden');
  elAnalysisErr.classList.remove('hidden');
  elAnalysisErrMsg.textContent = msg || 'An unexpected error occurred.';
}

function restoreExplainBtn() {
  elBtnExplain.disabled  = false;
  elBtnExplain.innerHTML = '🧠 Explain Code';
}

// ── Interview renderers ───────────────────────────────────────
function renderQuestion(question, index, total) {
  elQuestionText.textContent = question;
  elQIndex.textContent       = index + 1;
  elQTotal.textContent       = total;
  elProgressFill.style.width = ((index + 1) / total * 100) + '%';
  elAnswerTA.value           = '';
  elBtnSubmit.disabled       = false;
  elIvBadge.textContent      = 'Q' + (index + 1) + ' / ' + total;
  ivState('active');
  document.getElementById('interview-section')
    .scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function renderEvaluation(p) {
  const s   = p.score || 0;
  const cls = s >= 8 ? 'hi' : s >= 5 ? 'mid' : 'lo';
  elScoreBadge.textContent = s + ' / 10';
  elScoreBadge.className   = 'iv-score-badge score-' + cls;
  elScoreBar.style.width   = (s / 10 * 100) + '%';
  elScoreBar.className     = 'iv-score-bar bar-' + cls;
  elFeedback.textContent   = p.feedback         || '—';
  elFollowup.textContent   = p.followUpQuestion || '—';
  nextQ = p.isComplete ? null : { question: p.nextQuestion, index: p.nextQuestionIndex, total: p.total };
  elBtnNext.classList.toggle('hidden', !!p.isComplete);
  elIvComplete.classList.toggle('hidden', !p.isComplete);
  if (p.isComplete) { elIvBadge.textContent = '✓ Done'; }
  ivState('eval');
}

// ── History renderer ──────────────────────────────────────────
function renderHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    elHistoryEmpty.classList.remove('hidden');
    elHistoryList.classList.add('hidden');
    elHistoryList.innerHTML = '';
    return;
  }

  elHistoryEmpty.classList.add('hidden');
  elHistoryList.classList.remove('hidden');
  elHistoryList.innerHTML = '';

  history.forEach(entry => {
    const li  = document.createElement('li');
    li.className = 'history-entry';

    const avg  = typeof entry.averageScore === 'number' ? entry.averageScore : 0;
    const cls  = avg >= 8 ? 'score-hi' : avg >= 5 ? 'score-mid' : 'score-lo';

    // Format date
    let dateStr = '—';
    try {
      const d = new Date(entry.date);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const h   = d.getHours();
      const min = String(d.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12  = h % 12 || 12;
      dateStr = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
              + ' · ' + h12 + ':' + min + ' ' + ampm;
    } catch (_) { /* keep '—' */ }

    li.innerHTML =
      '<div class="he-top">' +
        '<span class="he-filename">' + escapeHtml(entry.fileName || 'Unknown') + '</span>' +
        '<span class="he-score ' + cls + '">' + avg.toFixed(1) + '</span>' +
      '</div>' +
      '<div class="he-bottom">' +
        '<span class="he-date">' + dateStr + '</span>' +
        '<span class="he-meta">' + (entry.totalQuestions || 0) + ' Q</span>' +
      '</div>';

    elHistoryList.appendChild(li);
  });
}

// ── Inbound messages ──────────────────────────────────────────
window.addEventListener('message', ({ data }) => {
  const { command, payload } = data;
  switch (command) {

    case 'fileInfo':   renderFileInfo(payload); break;
    case 'codeLoaded':
      renderFileInfo(payload);
      renderCode(payload);
      elBtnLoad.disabled  = false;
      elBtnLoad.innerHTML = '<span>⬇</span> Load Current Code';
      break;
    case 'noEditor':
      renderNoEditor();
      break;

    case 'analysisReady':
      renderAnalysisResults(payload);
      restoreExplainBtn();
      break;
    case 'analysisError':
      renderAnalysisError(payload && payload.message);
      restoreExplainBtn();
      break;

    case 'questionReady':
      renderQuestion(payload.question, payload.index, payload.total);
      break;
    case 'evaluationReady':
      renderEvaluation(payload);
      break;
    case 'interviewError':
      elIvErrorMsg.textContent = (payload && payload.message) || 'An error occurred.';
      elIvError.classList.remove('hidden');
      elBtnStart.disabled  = false;
      elBtnStart.innerHTML = '🚀 Start Mock Interview';
      ivState('idle');
      break;

    case 'historyUpdated':
      renderHistory(payload);
      break;
  }
});

// ── Outbound: file ────────────────────────────────────────────
document.getElementById('btn-open-panel').addEventListener('click', () => {
  vscode.postMessage({ command: 'openPanel' });
});

elBtnLoad.addEventListener('click', () => {
  elBtnLoad.disabled    = true;
  elBtnLoad.textContent = '⏳ Loading…';
  vscode.postMessage({ command: 'loadCode' });
});

elBtnExplain.addEventListener('click', () => {
  elBtnExplain.disabled  = true;
  elBtnExplain.innerHTML = '⏳ Analyzing…';
  showAnalysisLoading();
  vscode.postMessage({ command: 'explainCode' });
});

// ── Outbound: interview ───────────────────────────────────────
elBtnStart.addEventListener('click', () => {
  elIvError.classList.add('hidden');
  elBtnStart.disabled  = true;
  elBtnStart.innerHTML = '⏳ Generating…';
  ivState('loading');
  vscode.postMessage({ command: 'startInterview' });
});

elBtnSubmit.addEventListener('click', () => {
  const ans = elAnswerTA.value.trim();
  if (!ans) { elAnswerTA.focus(); return; }
  elBtnSubmit.disabled = true;
  ivState('evaluating');
  vscode.postMessage({ command: 'submitAnswer', payload: { answer: ans } });
});

elBtnNext.addEventListener('click', () => {
  if (nextQ) { renderQuestion(nextQ.question, nextQ.index, nextQ.total); nextQ = null; }
});

elBtnRestart.addEventListener('click', () => {
  nextQ = null;
  elBtnStart.disabled  = false;
  elBtnStart.innerHTML = '🚀 Start Mock Interview';
  elIvBadge.textContent = '5 Questions';
  ivState('idle');
  vscode.postMessage({ command: 'startInterview' });
});

document.getElementById('btn-dismiss-err').addEventListener('click', () => {
  elIvError.classList.add('hidden');
});

// ── Outbound: history ─────────────────────────────────────────
elBtnClearHistory.addEventListener('click', () => {
  vscode.postMessage({ command: 'clearHistory' });
});

// ── Boot ──────────────────────────────────────────────────────
vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

function getNonce(): string {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let n = '';
  for (let i = 0; i < 32; i++) { n += c.charAt(Math.floor(Math.random() * c.length)); }
  return n;
}
