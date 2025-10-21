import z from "zod";
import { baseIdeaSchema } from "./idea-framework";

/**
 * オズボーンのチェックリストの9つの視点
 */
export const OSBORN_CHECKLIST_TYPES = {
  /** 転用 */
  TRANSFER: "transfer",
  /** 応用 */
  APPLY: "apply",
  /** 変更 */
  MODIFY: "modify",
  /** 拡大 */
  MAGNIFY: "magnify",
  /** 縮小 */
  MINIFY: "minify",
  /** 代用 */
  SUBSTITUTE: "substitute",
  /** 再配置 */
  REARRANGE: "rearrange",
  /** 逆転 */
  REVERSE: "reverse",
  /** 結合 */
  COMBINE: "combine",
} as const;

export type OsbornChecklistType =
  (typeof OSBORN_CHECKLIST_TYPES)[keyof typeof OSBORN_CHECKLIST_TYPES];

/**
 * チェックリストの種類と日本語名のマッピング
 */
export const OSBORN_CHECKLIST_NAMES: Record<OsbornChecklistType, string> = {
  [OSBORN_CHECKLIST_TYPES.TRANSFER]: "転用",
  [OSBORN_CHECKLIST_TYPES.APPLY]: "応用",
  [OSBORN_CHECKLIST_TYPES.MODIFY]: "変更",
  [OSBORN_CHECKLIST_TYPES.MAGNIFY]: "拡大",
  [OSBORN_CHECKLIST_TYPES.MINIFY]: "縮小",
  [OSBORN_CHECKLIST_TYPES.SUBSTITUTE]: "代用",
  [OSBORN_CHECKLIST_TYPES.REARRANGE]: "再配置",
  [OSBORN_CHECKLIST_TYPES.REVERSE]: "逆転",
  [OSBORN_CHECKLIST_TYPES.COMBINE]: "結合",
} as const;

/**
 * チェックリストの種類と説明文のマッピング
 * 見やすいから改行は敢えて。
 */
// prettier-ignore
export const OSBORN_CHECKLIST_DESCRIPTIONS: Record<OsbornChecklistType, string> = {
  [OSBORN_CHECKLIST_TYPES.TRANSFER]:
`他の用途に転用できないか？
例：コーヒーカップを鉛筆立てに、古着をクッションカバーに`,
  [OSBORN_CHECKLIST_TYPES.APPLY]:
`他のアイデアを応用できないか？
例：自然界の仕組みを製品に、他業界の成功事例を自社に`,
  [OSBORN_CHECKLIST_TYPES.MODIFY]:
`形・色・音・匂いなどを変更できないか？
例：形を丸く、色を明るく、香りを加える`,
  [OSBORN_CHECKLIST_TYPES.MAGNIFY]:
`大きく・長く・厚く・強くできないか？
例：機能を増やす、サイズを拡大、回数を増やす`,
  [OSBORN_CHECKLIST_TYPES.MINIFY]:
`小さく・短く・薄く・軽くできないか？
例：コンパクト化、簡略化、短縮化`,
  [OSBORN_CHECKLIST_TYPES.SUBSTITUTE]:
`他のもので代用できないか？
例：材料を変える、別の手段を使う、場所を変える`,
  [OSBORN_CHECKLIST_TYPES.REARRANGE]:
`順序・パターン・レイアウトを変えられないか？
例：手順を逆に、配置を変更、組み合わせを変える`,
  [OSBORN_CHECKLIST_TYPES.REVERSE]:
`逆にできないか？
例：上下反転、プラスをマイナスに、主従を入れ替える`,
  [OSBORN_CHECKLIST_TYPES.COMBINE]:
`組み合わせられないか？
例：機能を統合、アイデアを融合、異分野を掛け合わせる`,
} as const;

// オズボーンのチェックリストは特別な項目がないため、ベーススキーマをそのまま使用
export const osbornChecklistFormDataSchema = baseIdeaSchema;

// 型定義をZodスキーマから生成
export type OsbornChecklistFormData = z.infer<typeof osbornChecklistFormDataSchema>;
