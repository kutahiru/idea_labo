/**
 * AppSync Events の Namespace 定義
 */
export const NAMESPACES = {
  BRAINWRITING: "brainwriting",
  MANDALART: "mandalart",
  OSBORN: "osborn",
} as const;

export type Namespace = typeof NAMESPACES[keyof typeof NAMESPACES];
