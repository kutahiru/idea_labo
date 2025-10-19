import { BaseIdeaListItem } from "../schemas/idea-framework";

/**
 * 一覧表示用の型定義
 * 他のアイデアと共通の定義はBaseIdeaListItemに実装
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MandalartListItem extends BaseIdeaListItem {}

export interface MandalartInputData {
  id: number;
  mandalart_id: number;
  row_index: number;
  column_index: number;
  content: string | null;
  created_at: Date;
  updated_at: Date;
}
