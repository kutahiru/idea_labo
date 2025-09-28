/**
 * ブレインライティングの利用方法
 */
export const USAGE_SCOPE = {
  XPOST: "xpost",
  TEAM: "team",
} as const;

/**
 * 利用方法のラベルマップ
 */
export const USAGE_SCOPE_LABELS = {
  [USAGE_SCOPE.XPOST]: "X投稿",
  [USAGE_SCOPE.TEAM]: "チーム利用",
} as const;

/**
 * 利用方法の型
 */
export type UsageScope = typeof USAGE_SCOPE[keyof typeof USAGE_SCOPE];

/**
 * ブレインライティングのusageScopeを日本語ラベルに変換する
 */
export const getUsageScopeLabel = (usageScope: UsageScope): string => {
  return USAGE_SCOPE_LABELS[usageScope];
};