// Zodスキーマから型定義をインポート
export type { BrainwritingListItem, BrainwritingFormData } from "@/schemas/brainwriting";
import type { BrainwritingListItem } from "@/schemas/brainwriting";

// データベーステーブルの型定義
export interface BrainwritingSheetData {
  id: number;
  brainwriting_id: number;
  current_user_id: string | null;
  lock_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface BrainwritingInputData {
  id: number;
  brainwriting_id: number;
  brainwriting_sheet_id: number;
  input_user_id: string;
  input_user_name: string | null;
  row_index: number;
  column_index: number;
  content: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BrainwritingUserData {
  id: number;
  brainwriting_id: number;
  user_id: string;
  user_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BrainwritingDetail extends BrainwritingListItem {
  sheets: BrainwritingSheetData[];
  inputs: BrainwritingInputData[];
  users: BrainwritingUserData[];
}
