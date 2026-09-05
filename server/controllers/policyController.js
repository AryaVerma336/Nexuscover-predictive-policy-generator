const db = require('../config/db');

// Helper to extract JSON from Gemini output
function extractJSON(raw) {
  let s = raw.trim();
  s = s.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in Gemini response');
  }
  return JSON.parse(s.slice(start, end + 1));
}

// Generate Policy using Gemini API
async function generatePolicy(req, res, next) {
  try {
    const { trend } = req.body;
    if (!trend || !trend.trim()) {
      return res.status(400).json({ success: false, error: 'Trend prompt is required.' });
    }

    const clientKey = req.headers['x-api-key'] || req.body.apiKey;
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Gemini API key missing. Please provide GEMINI_API_KEY in server .env or pass x-api-key header.'
      });
    }

    const model = req.body.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const prompt = `You are an elite InsurTech architect. Generate a creative, specific, hackathon-winning insurance policy for the emerging risk: "${trend.trim()}"

Return ONLY this exact JSON (no markdown, no backticks, no extra text):
{"policyName":"Creative specific name","tagline":"8-word punchy pitch","problem":"2-3 concise sentences on the problem","targetMarket":["segment1","segment2","segment3","segment4"],"whyNow":"2-3 sentences with specific data or statistics","covered":["item1","item2","item3","item4","item5"],"excluded":["item1","item2","item3","item4"],"edgeCases":["case1","case2","case3"],"riskFactors":[{"name":"Risk Name","probability":0.72,"impact":"High","description":"1 sentence"},{"name":"Risk Name","probability":0.48,"impact":"Medium","description":"1 sentence"},{"name":"Risk Name","probability":0.31,"impact":"High","description":"1 sentence"}],"pricingFormula":"Monthly Premium = BaseRate × RiskScore × ExposureMultiplier × (1 + ClaimHistoryFactor) × RegionCoefficient","pricingVariables":[{"var":"BaseRate","desc":"Minimum monthly floor","range":"$25–$80"},{"var":"RiskScore","desc":"AI-computed personal risk","range":"0.5–2.5"},{"var":"ExposureMultiplier","desc":"Industry exposure level","range":"1.0–3.0"},{"var":"ClaimHistoryFactor","desc":"Past claim adjustment","range":"0.0–0.8"},{"var":"RegionCoefficient","desc":"Geographic risk factor","range":"0.8–2.0"}],"examplePremium":"$XX/month","exampleBreakdown":"BaseRate $XX × RiskScore X.X × Exposure X.X × (1+X.X) × X.X = $XX/month","claims":[{"title":"Claim title","description":"2 realistic sentences","payout":"$XX,XXX"},{"title":"Claim title","description":"2 realistic sentences","payout":"$XX,XXX"},{"title":"Claim title","description":"2 realistic sentences","payout":"$XX,XXX"}],"innovationScore":9,"viabilityScore":8,"fiveYearOutlook":"3-4 sentences with market size data","futureFeatures":[{"icon":"🔁","title":"Feature title","desc":"Description"},{"icon":"🤖","title":"Feature title","desc":"Description"},{"icon":"⛓","title":"Feature title","desc":"Description"},{"icon":"📡","title":"Feature title","desc":"Description"}],"comparison":[{"dimension":"Risk Definition","traditional":"Static historical perils","nexus":"AI-identified emerging risks"},{"dimension":"Underwriting","traditional":"Static questionnaires","nexus":"Real-time behavioral data"},{"dimension":"Pricing","traditional":"Annual rate tables","nexus":"Continuous ML recalibration"},{"dimension":"Claims","traditional":"30–90 day manual","nexus":"Automated STP blockchain"},{"dimension":"Policy Lifecycle","traditional":"Annual rigid renewal","nexus":"On-demand modular coverage"}]}`;

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192
        }
      })
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const msg = data?.error?.message || `Gemini API returned status ${geminiResponse.status}`;
      return res.status(geminiResponse.status).json({ success: false, error: msg });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) {
      return res.status(500).json({ success: false, error: 'Empty response payload from Gemini AI' });
    }

    let policy;
    try {
      policy = extractJSON(rawText);
    } catch (parseErr) {
      return res.status(422).json({
        success: false,
        error: 'Failed to parse AI output into valid JSON schema. Please retry.'
      });
    }

    // Save generated policy to isolated SQLite DB
    const sql = `
      INSERT INTO policies (trend, policy_name, tagline, innovation_score, viability_score, policy_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      trend.trim(),
      policy.policyName || 'Unnamed Policy',
      policy.tagline || '',
      policy.innovationScore || 0,
      policy.viabilityScore || 0,
      JSON.stringify(policy)
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('Failed to save policy to DB:', err.message);
      }
      const savedId = this ? this.lastID : null;

      res.json({
        success: true,
        savedId,
        trend: trend.trim(),
        policy
      });
    });
  } catch (err) {
    next(err);
  }
}

// Get all saved policies (history)
function getPolicies(req, res, next) {
  const search = req.query.search ? `%${req.query.search.trim()}%` : null;
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;

  let sql = `
    SELECT id, trend, policy_name, tagline, innovation_score, viability_score, created_at
    FROM policies
  `;
  const params = [];

  if (search) {
    sql += ` WHERE trend LIKE ? OR policy_name LIKE ?`;
    params.push(search, search);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.all(sql, params, (err, rows) => {
    if (err) return next(err);
    res.json({
      success: true,
      count: rows.length,
      policies: rows
    });
  });
}

// Get single policy details by ID
function getPolicyById(req, res, next) {
  const id = req.params.id;
  const sql = `SELECT * FROM policies WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) return next(err);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    try {
      row.policy_data = JSON.parse(row.policy_data);
    } catch (e) {
      // keep raw string if parse fails
    }

    res.json({
      success: true,
      policy: row
    });
  });
}

// Save policy manually
function savePolicy(req, res, next) {
  const { trend, policy } = req.body;
  if (!trend || !policy) {
    return res.status(400).json({ success: false, error: 'Trend and policy payload are required.' });
  }

  const sql = `
    INSERT INTO policies (trend, policy_name, tagline, innovation_score, viability_score, policy_data)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    trend.trim(),
    policy.policyName || 'Custom Policy',
    policy.tagline || '',
    policy.innovationScore || 0,
    policy.viabilityScore || 0,
    JSON.stringify(policy)
  ];

  db.run(sql, params, function (err) {
    if (err) return next(err);
    res.json({
      success: true,
      savedId: this.lastID
    });
  });
}

// Delete policy by ID
function deletePolicy(req, res, next) {
  const id = req.params.id;
  const sql = `DELETE FROM policies WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    res.json({
      success: true,
      message: `Policy ${id} deleted successfully.`
    });
  });
}

module.exports = {
  generatePolicy,
  getPolicies,
  getPolicyById,
  savePolicy,
  deletePolicy
};
