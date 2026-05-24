const MODES_BY_PLAN = {
  free: ["standard"],
  starter: ["standard", "casual"],
  pro: ["standard", "casual", "academic", "aggressive"],
  business: ["standard", "casual", "academic", "aggressive"],
};

export const canUseMode = (plan, mode) => (MODES_BY_PLAN[plan] || []).includes(mode);
export const canUploadFile = (plan) => ["pro", "business"].includes(plan);
export const modeRequiresPlan = (mode) =>
  ({ standard: "free", casual: "starter", academic: "pro", aggressive: "pro" })[mode];

