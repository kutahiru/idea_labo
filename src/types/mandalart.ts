import { BaseIdeaListItem } from "../schemas/idea-framework";

/**
 * 一覧表示用の型定義
 * 他のアイデアと共通の定義はBaseIdeaListItemに実装
 */
export interface MandalartListItem extends BaseIdeaListItem {
  publicToken?: string | null;
  isResultsPublic?: boolean;
}

export interface MandalartInputData {
  id: number;
  mandalart_id: number;
  section_row_index: number;
  section_column_index: number;
  row_index: number;
  column_index: number;
  content: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MandalartDetail extends MandalartListItem {
  inputs: MandalartInputData[];
  aiGeneration?: {
    status: string;
    errorMessage: string | null;
  } | null;
}
