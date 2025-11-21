import { BaseIdeaListItem } from "../schemas/idea-framework";
import { OsbornChecklistType } from "../schemas/osborn-checklist";

/**
 * 一覧表示用の型定義
 * 他のアイデアと共通の定義はBaseIdeaListItemに実装
 */
export interface OsbornChecklistListItem extends BaseIdeaListItem {
  publicToken?: string | null;
  isResultsPublic?: boolean;
}

export interface OsbornChecklistInputData {
  id: number;
  osborn_checklist_id: number;
  checklist_type: OsbornChecklistType;
  content: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OsbornChecklistDetail extends OsbornChecklistListItem {
  inputs: OsbornChecklistInputData[];
  aiGeneration: {
    status: string;
    errorMessage: string | null;
  } | null;
}
