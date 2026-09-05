/* ═══════════════════════════════
   NEXUSCOVER MAIN APPLICATION JS
═══════════════════════════════ */

// Nav Scroll Listener
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Intersection Observer for Animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// Helper Functions
function st(v) {
  const ti = document.getElementById('ti');
  if (ti) { ti.value = v; ti.focus(); }
}

function cj() {
  const jo = document.getElementById('jo');
  if (!jo) return;
  navigator.clipboard.writeText(jo.textContent).then(() => {
    const b = document.querySelector('.copy-btn');
    if (b) {
      b.textContent = 'Copied ✓';
      setTimeout(() => b.textContent = 'Copy JSON', 2200);
    }
  });
}

function rj(d) {
  return JSON.stringify(d, null, 2)
    .replace(/"([^"]+)":/g, '<span class="jk">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="js">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="jn">$1</span>')
    .replace(/: (true|false)/g, ': <span class="jb">$1</span>');
}

// API Key Management
function saveKey() {
  const inp = document.getElementById('api-key-input');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  try { localStorage.setItem('nxc_gemini_key', val); } catch (e) { }
  const btn = document.querySelector('.api-key-save');
  inp.value = val.slice(0, 8) + '••••••••••••••••••••••••';
  inp.classList.add('has-key');
  if (btn) {
    btn.textContent = 'Saved ✓';
    btn.classList.add('saved');
    setTimeout(() => { btn.textContent = 'Save'; btn.classList.remove('saved'); }, 2500);
  }
}

function loadKey() {
  try {
    const key = localStorage.getItem('nxc_gemini_key');
    if (key) {
      const inp = document.getElementById('api-key-input');
      if (inp) {
        inp.value = key.slice(0, 8) + '••••••••••••••••••••••••';
        inp.classList.add('has-key');
      }
    }
  } catch (e) { }
}

document.addEventListener('DOMContentLoaded', () => {
  const _apiInput = document.getElementById('api-key-input');
  if (_apiInput) {
    _apiInput.addEventListener('focus', function () {
      try {
        const k = localStorage.getItem('nxc_gemini_key');
        if (k) this.value = k;
        this.classList.remove('has-key');
      } catch (e) { }
    });
    _apiInput.addEventListener('blur', function () {
      const v = this.value.trim();
      if (v && v.length > 10) { saveKey(); }
    });
  }
  loadKey();

  const ti = document.getElementById('ti');
  if (ti) {
    ti.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }
});

async function testKey() {
  let key = '';
  try { key = localStorage.getItem('nxc_gemini_key') || ''; } catch (e) { }
  if (!key) key = document.getElementById('api-key-input')?.value?.trim() || '';
  if (!key) { alert('Paste a key first'); return; }

  const btns = document.querySelectorAll('.api-key-save');
  const btn = btns[1] || btns[0];
  if (btn) btn.textContent = 'Checking…';

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (!listRes.ok) {
      if (btn) btn.textContent = 'Test';
      alert('❌ Error ' + listRes.status + ':\n\n' + JSON.stringify(listData?.error, null, 2));
      return;
    }

    const models = (listData.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name);

    alert('✅ Key valid!\n\nAvailable models:\n' + models.join('\n'));
    if (btn) btn.textContent = '✓ Valid!';

    const preferred = ['models/gemini-1.5-flash', 'models/gemini-1.0-pro', 'models/gemini-pro'];
    const best = preferred.find(p => models.includes(p)) || models[0] || '';
    if (best) {
      const modelId = best.replace('models/', '');
      try { localStorage.setItem('nxc_gemini_model', modelId); } catch (e) { }
      setTimeout(() => alert('Auto-selected model: ' + modelId + '\n\nYou can now generate a policy!'), 500);
    }
  } catch (e) {
    if (btn) btn.textContent = 'Test';
    alert('❌ Network error:\n\n' + e.message);
  }
  if (btn) setTimeout(() => { btn.textContent = 'Test'; }, 4000);
}

function goBack() {
  document.getElementById('results-page').classList.remove('active');
  document.getElementById('res').classList.remove('on');
  document.getElementById('homepage-wrap').classList.remove('hidden');
  document.getElementById('gb').disabled = false;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Loading Animation Controller
const STEP_PROGRESS = [10, 28, 48, 68, 85];
async function animLoad() {
  const ids = ['ls1', 'ls2', 'ls3', 'ls4', 'ls5'];
  const txt = ['◉ Analyzing risk landscape', '◉ Structuring coverage model', '◉ Computing actuarial pricing', '◉ Generating policy schema', '◉ Finalizing document'];
  setLoadProgress(4);
  for (let i = 0; i < ids.length; i++) {
    await new Promise(r => setTimeout(r, 400));
    if (i > 0) {
      const p = document.getElementById(ids[i - 1]);
      if (p) { p.classList.remove('act'); p.classList.add('done'); p.textContent = '✓ ' + txt[i - 1].slice(2); }
    }
    const cur = document.getElementById(ids[i]);
    if (cur) { cur.classList.add('act'); cur.textContent = txt[i]; }
    setLoadProgress(STEP_PROGRESS[i]);
  }
  let slow = 85;
  window._loadTicker = setInterval(() => {
    if (slow < 90) { slow += 0.5; setLoadProgress(slow); }
  }, 300);
}

function setLoadProgress(pct) {
  const bar = document.getElementById('load-bar');
  const lbl = document.getElementById('load-pct');
  const n = Math.round(pct);
  if (bar) bar.style.width = n + '%';
  if (lbl) lbl.textContent = n + '%';
  if (n >= 100 && lbl) lbl.style.color = 'var(--green)';
}

function stopLoadTicker() {
  if (window._loadTicker) { clearInterval(window._loadTicker); window._loadTicker = null; }
}

// Backend Integration & Policy Generator
window.hasBackendAPI = false;

async function checkBackendStatus() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok') {
        window.hasBackendAPI = true;
        const bBadge = document.getElementById('backend-status-badge');
        if (bBadge) bBadge.style.display = 'inline-flex';
      }
    }
  } catch (e) {
    window.hasBackendAPI = false;
  }
}
document.addEventListener('DOMContentLoaded', checkBackendStatus);

async function go() {
  const trend = document.getElementById('ti').value.trim();
  if (!trend) { document.getElementById('ti').focus(); return; }

  let apiKey = '';
  try { apiKey = localStorage.getItem('nxc_gemini_key') || ''; } catch (e) { }
  if (!apiKey) apiKey = document.getElementById('api-key-input')?.value?.trim() || '';

  if (!window.hasBackendAPI && !apiKey) {
    const erEl = document.getElementById('er');
    erEl.textContent = '⚠ Please enter your Gemini API key first.';
    erEl.classList.add('on');
    setTimeout(() => erEl.classList.remove('on'), 5000);
    document.getElementById('api-key-input')?.focus();
    return;
  }

  document.getElementById('gb').disabled = true;
  document.getElementById('res').classList.remove('on');
  document.getElementById('er').classList.remove('on');
  document.getElementById('homepage-wrap').classList.add('hidden');
  const ldEl = document.getElementById('ld');
  ldEl.classList.add('on');
  setLoadProgress(0);
  window.scrollTo({ top: 0, behavior: 'instant' });

  ['ls1', 'ls2', 'ls3', 'ls4', 'ls5'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'lstep';
      el.textContent = ['◌ Analyzing risk landscape', '◌ Structuring coverage model', '◌ Computing actuarial pricing', '◌ Generating policy schema', '◌ Finalizing document'][i];
    }
  });
  animLoad();

  try {
    let p;

    if (window.hasBackendAPI) {
      let model = '';
      try { model = localStorage.getItem('nxc_gemini_model') || ''; } catch (e) { }

      const res = await fetch('/api/policies/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'x-api-key': apiKey })
        },
        body: JSON.stringify({ trend, model })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Backend API error (Status ${res.status})`);
      }
      p = data.policy;
    } else {
      let model = '';
      try { model = localStorage.getItem('nxc_gemini_model') || ''; } catch (e) { }
      if (!model) model = 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const prompt = `You are an elite InsurTech architect. Generate a creative, specific, hackathon-winning insurance policy for the emerging risk: "${trend}"

Return ONLY this exact JSON (no markdown, no backticks, no extra text):
{"policyName":"Creative specific name","tagline":"8-word punchy pitch","problem":"2-3 concise sentences on the problem","targetMarket":["segment1","segment2","segment3","segment4"],"whyNow":"2-3 sentences with specific data or statistics","covered":["item1","item2","item3","item4","item5"],"excluded":["item1","item2","item3","item4"],"edgeCases":["case1","case2","case3"],"riskFactors":[{"name":"Risk Name","probability":0.72,"impact":"High","description":"1 sentence"},{"name":"Risk Name","probability":0.48,"impact":"Medium","description":"1 sentence"},{"name":"Risk Name","probability":0.31,"impact":"High","description":"1 sentence"}],"pricingFormula":"Monthly Premium = BaseRate × RiskScore × ExposureMultiplier × (1 + ClaimHistoryFactor) × RegionCoefficient","pricingVariables":[{"var":"BaseRate","desc":"Minimum monthly floor","range":"$25–$80"},{"var":"RiskScore","desc":"AI-computed personal risk","range":"0.5–2.5"},{"var":"ExposureMultiplier","desc":"Industry exposure level","range":"1.0–3.0"},{"var":"ClaimHistoryFactor","desc":"Past claim adjustment","range":"0.0–0.8"},{"var":"RegionCoefficient","desc":"Geographic risk factor","range":"0.8–2.0"}],"examplePremium":"$XX/month","exampleBreakdown":"BaseRate $XX × RiskScore X.X × Exposure X.X × (1+X.X) × X.X = $XX/month","claims":[{"title":"Claim title","description":"2 realistic sentences","payout":"$XX,XXX"},{"title":"Claim title","description":"2 realistic sentences","payout":"$XX,XXX"},{"title":"Claim title","description":"2 realistic sentences","payout":"$XX,XXX"}],"innovationScore":9,"viabilityScore":8,"fiveYearOutlook":"3-4 sentences with market size data","futureFeatures":[{"icon":"🔁","title":"Feature title","desc":"Description"},{"icon":"🤖","title":"Feature title","desc":"Description"},{"icon":"⛓","title":"Feature title","desc":"Description"},{"icon":"📡","title":"Feature title","desc":"Description"}],"comparison":[{"dimension":"Risk Definition","traditional":"Static historical perils","nexus":"AI-identified emerging risks"},{"dimension":"Underwriting","traditional":"Static questionnaires","nexus":"Real-time behavioral data"},{"dimension":"Pricing","traditional":"Annual rate tables","nexus":"Continuous ML recalibration"},{"dimension":"Claims","traditional":"30–90 day manual","nexus":"Automated STP blockchain"},{"dimension":"Policy Lifecycle","traditional":"Annual rigid renewal","nexus":"On-demand modular coverage"}]}`;

      async function callGemini(temperature) {
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature, maxOutputTokens: 8192 }
          })
        });
      }

      function extractJSON(raw) {
        let s = raw.trim();
        s = s.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/, '').trim();
        const start = s.indexOf('{');
        const end = s.lastIndexOf('}');
        if (start === -1 || end === -1 || end <= start) throw new Error('No JSON object found in response');
        return JSON.parse(s.slice(start, end + 1));
      }

      const r = await callGemini(0.9);
      const d = await r.json();

      if (!r.ok) {
        const msg = d?.error?.message || d?.error?.status || `HTTP ${r.status}`;
        if (r.status === 400 && msg.toLowerCase().includes('api key')) throw new Error('API_KEY_INVALID: ' + msg);
        if (r.status === 403) throw new Error('API_KEY_INVALID: ' + msg);
        if (r.status === 429) throw new Error('QUOTA: ' + msg);
        throw new Error(msg);
      }

      const raw = d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!raw) throw new Error('Empty response from Gemini — please try again');

      try {
        p = extractJSON(raw);
      } catch (parseErr) {
        const prompt2 = prompt + '\n\nIMPORTANT: Your previous response could not be parsed. Return ONLY raw JSON starting with { and ending with }. No other text whatsoever.';
        const r2 = await callGemini(0.3);
        const d2 = await r2.json();
        const raw2 = d2?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!raw2) throw new Error('Empty response on retry — please try again');
        p = extractJSON(raw2);
      }
    }

    setLoadProgress(100);
    stopLoadTicker();
    await new Promise(r => setTimeout(r, 350));
    render(p, trend);

  } catch (e) {
    stopLoadTicker();
    setLoadProgress(0);
    console.error('Generation error:', e);
    document.getElementById('ld').classList.remove('on');
    document.getElementById('homepage-wrap').classList.remove('hidden');
    const erEl = document.getElementById('er');
    const msg = e.message || '';
    erEl.textContent =
      msg.includes('API_KEY_INVALID') || msg.includes('403')
        ? '⚠ Invalid API key — re-enter at aistudio.google.com/apikey'
      : msg.includes('QUOTA') || msg.includes('429')
        ? '⚠ Rate limit — wait 30 seconds and try again'
      : msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('Failed to fetch')
        ? '⚠ Network error — check your internet connection'
      : msg.includes('No JSON') || msg.includes('parse')
        ? '⚠ AI gave bad response — please try again'
      : `⚠ ${msg.slice(0, 120) || 'Unknown error — please try again'}`;
    erEl.classList.add('on');
    setTimeout(() => erEl.classList.remove('on'), 9000);
    document.getElementById('gb').disabled = false;
  }
}

// Tab Navigation Controller
let currentTab = 0;
const TOTAL_TABS = 6;

function goTab(n) {
  const old = currentTab;
  currentTab = n;

  document.querySelectorAll('.tab-panel').forEach((el, i) => {
    el.classList.remove('active', 'exit');
    if (i === n) el.classList.add('active');
    else if (i === old) el.classList.add('exit');
    if (i === old) setTimeout(() => el.classList.remove('exit'), 450);
  });

  document.querySelectorAll('.progress-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i === n) el.classList.add('active');
    else if (i < n) el.classList.add('done');
  });

  const prevBtn = document.getElementById('tab-prev');
  const nextBtn = document.getElementById('tab-next');
  if (prevBtn) prevBtn.disabled = n === 0;
  if (nextBtn) nextBtn.disabled = n === TOTAL_TABS - 1;

  if (n === 2) {
    setTimeout(() => {
      document.querySelectorAll('.risk-bar-fill').forEach(el => {
        el.style.width = el.dataset.w + '%';
      });
    }, 300);
  }
  const panel = document.getElementById('tab-' + n);
  if (panel) panel.scrollTop = 0;
}

function nextTab() { if (currentTab < TOTAL_TABS - 1) goTab(currentTab + 1); }
function prevTab() { if (currentTab > 0) goTab(currentTab - 1); }

document.addEventListener('keydown', e => {
  const res = document.getElementById('res');
  if (!res || !res.classList.contains('on')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextTab();
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevTab();
});

// Policy UI Render Engine
function render(p, trend) {
  document.getElementById('ld').classList.remove('on');

  // Tab 0: Overview
  document.getElementById('pmeta').textContent = trend;
  document.getElementById('pn').textContent = p.policyName;
  document.getElementById('ptag').textContent = `"${p.tagline}"`;
  document.getElementById('pprob').textContent = p.problem;
  document.getElementById('iscore').textContent = p.innovationScore + '.0';
  document.getElementById('vscore').textContent = p.viabilityScore + '.0';
  document.getElementById('fytext').textContent = p.fiveYearOutlook;
  const mp = document.getElementById('mpills'); mp.innerHTML = '';
  (p.targetMarket || []).forEach(m => mp.innerHTML += `<span class="mpill">${m}</span>`);
  document.getElementById('wn').textContent = p.whyNow;

  // Tab 1: Coverage
  const cl = document.getElementById('cl'); cl.innerHTML = '';
  (p.covered || []).forEach(i => cl.innerHTML += `<li><span class="cdot" style="background:var(--green)"></span>${i}</li>`);
  const el = document.getElementById('el'); el.innerHTML = '';
  (p.excluded || []).forEach(i => el.innerHTML += `<li><span class="cdot" style="background:var(--red)"></span>${i}</li>`);
  const ecl = document.getElementById('ecl'); ecl.innerHTML = '';
  (p.edgeCases || []).forEach(i => ecl.innerHTML += `<div class="edge-item">⚠ ${i}</div>`);

  // Tab 2: Risk
  const rf = document.getElementById('rf'); rf.innerHTML = '';
  (p.riskFactors || []).forEach(r => {
    const pct = Math.round(r.probability * 100);
    const ic = r.impact === 'High' ? 'badge-hi' : r.impact === 'Medium' ? 'badge-me' : 'badge-lo';
    const fc = r.impact === 'High' ? 'var(--red)' : r.impact === 'Medium' ? 'var(--orange)' : 'var(--green)';
    rf.innerHTML += `<div class="risk-panel-row"><div>
      <div class="risk-name">${r.name}</div>
      <div class="risk-desc">${r.description}</div>
      <div class="risk-bar-bg"><div class="risk-bar-fill" data-w="${pct}" style="background:${fc};width:0%"></div></div>
    </div><div class="risk-right"><span class="badge badge-pct">${pct}%</span><span class="badge ${ic}">${r.impact}</span></div></div>`;
  });

  // Tab 3: Pricing
  document.getElementById('pformula').textContent = p.pricingFormula;
  const vtb = document.getElementById('vtbody'); vtb.innerHTML = '';
  (p.pricingVariables || []).forEach(v => vtb.innerHTML += `<tr><td class="var-nm">${v.var}</td><td>${v.desc}</td><td class="var-rng">${v.range}</td></tr>`);
  document.getElementById('ecalc').innerHTML = `<div class="ex-lbl">◈ Example Calculation</div><div class="ex-price">${p.examplePremium}</div><div class="ex-note">${p.exampleBreakdown}</div>`;

  // Tab 4: Claims
  const cs = document.getElementById('cs'); cs.innerHTML = '';
  (p.claims || []).forEach((c, i) => cs.innerHTML += `<div class="claim-panel-card">
    <div class="claim-num">SCENARIO 0${i + 1}</div>
    <div class="claim-title">${c.title}</div>
    <div class="claim-desc">${c.description}</div>
    <div class="claim-pay">${c.payout}</div>
    <div class="claim-pay-lbl">Estimated payout</div>
  </div>`);

  // Tab 5: Technical
  const gj = {
    policy: { policyNumber: "NXC-" + Math.random().toString(36).substr(2, 8).toUpperCase(), productCode: p.policyName.replace(/\s+/g, '_').toUpperCase().substr(0, 20), effectiveDate: new Date().toISOString().split('T')[0], expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], trend, innovationScore: p.innovationScore, viabilityScore: p.viabilityScore },
    coverages: (p.covered || []).map((c, i) => ({ coverageCode: "COV_" + String(i + 1).padStart(3, '0'), coverageName: c, type: "Occurrence", status: "Active" })),
    exclusions: (p.excluded || []).map((e, i) => ({ exclusionCode: "EXC_" + String(i + 1).padStart(3, '0'), desc: e })),
    risks: (p.riskFactors || []).map(r => ({ riskName: r.name, probability: r.probability, impact: r.impact })),
    premiumModel: { formula: p.pricingFormula, variables: p.pricingVariables || [], example: p.examplePremium },
    claims: (p.claims || []).map((c, i) => ({ id: "CLM_" + String(i + 1).padStart(2, '0'), title: c.title, payout: c.payout, processingType: "STP" }))
  };
  document.getElementById('jo').innerHTML = rj(gj);
  const ctb = document.getElementById('ctbody'); ctb.innerHTML = '';
  (p.comparison || []).forEach(r => ctb.innerHTML += `<tr><td>${r.dimension}</td><td class="t-trad">${r.traditional}</td><td class="t-nex">${r.nexus}</td></tr>`);
  const ffg = document.getElementById('ffgrid'); ffg.innerHTML = '';
  (p.futureFeatures || []).forEach(f => ffg.innerHTML += `<div class="ff-card" style="padding:14px;"><div class="ff-icon" style="width:36px;height:36px;font-size:18px;">${f.icon}</div><div><div class="ff-title">${f.title}</div><div class="ff-desc">${f.desc}</div></div></div>`);

  currentTab = 0;
  document.getElementById('res').classList.add('on');
  document.getElementById('results-page').classList.add('active');
  document.getElementById('topbar-title').textContent = p.policyName;
  document.getElementById('gb').disabled = false;
  goTab(0);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
