const db = require('../config/db');

function getAnalytics(req, res, next) {
  const statsSql = `
    SELECT 
      COUNT(*) AS total_policies,
      ROUND(AVG(innovation_score), 2) AS avg_innovation,
      ROUND(AVG(viability_score), 2) AS avg_viability,
      MAX(created_at) AS last_policy_created
    FROM policies
  `;

  const recentSql = `
    SELECT id, trend, policy_name, innovation_score, viability_score, created_at
    FROM policies
    ORDER BY created_at DESC
    LIMIT 5
  `;

  db.get(statsSql, [], (err, stats) => {
    if (err) return next(err);

    db.all(recentSql, [], (err, recent) => {
      if (err) return next(err);

      res.json({
        success: true,
        analytics: {
          totalPolicies: stats.total_policies || 0,
          avgInnovationScore: stats.avg_innovation || 0,
          avgViabilityScore: stats.avg_viability || 0,
          lastPolicyCreated: stats.last_policy_created || null,
          recentPolicies: recent || []
        }
      });
    });
  });
}

module.exports = {
  getAnalytics
};
