/**
 * X(Twitter)投稿関連
 */
import { generateInviteUrl, generateMandalartPublicUrl, generateOsbornChecklistPublicUrl } from "@/lib/token";
import { BrainwritingListItem } from "../types/brainwriting";
import { MandalartListItem } from "../types/mandalart";
import { OsbornChecklistListItem } from "../types/osborn-checklist";

export interface PostBrainwritingToXParams {
  brainwriting: BrainwritingListItem;
  isOwner: boolean;
  /** 残りの回答者数 */
  remainingUserCount?: number;
}

// ブレインライティングをXに投稿
export function postBrainwritingToX({
  brainwriting,
  isOwner,
  remainingUserCount,
}: PostBrainwritingToXParams): void {
  const content = formatBrainwritingForX(brainwriting, isOwner, remainingUserCount);
  openXPost(content);
}

// ブレインライティングをX投稿用にフォーマット
function formatBrainwritingForX(
  brainwriting: BrainwritingListItem,
  isOwner: boolean,
  remainingUserCount?: number
): string {
  const inviteUrl = generateInviteUrl(brainwriting.inviteToken);
  const truncatedTheme =
    brainwriting.themeName.length > 30
      ? brainwriting.themeName.slice(0, 30) + "..."
      : brainwriting.themeName;

  if (isOwner) {
    // 作成者
    return `🧠ブレインライティング
📝テーマ:${truncatedTheme}
皆さんのアイデアをお待ちしています！
ご協力お願いします🙏

🔗参加はこちら: ${inviteUrl}

#アイデア研究所`;
  } else {
    // 参加者
    let statusMessage = "回答しました！";
    if (remainingUserCount !== undefined) {
      statusMessage +=
        remainingUserCount === 0
          ? "\n全ての回答が集まりました！"
          : `\nあと${remainingUserCount}名お願いします！`;
    }

    return `${statusMessage}
🧠ブレインライティング
📝テーマ:${truncatedTheme}

🔗参加はこちら: ${inviteUrl}

#アイデア研究所`;
  }
}

// X投稿画面を開く
function openXPost(content: string): void {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
  window.open(tweetUrl, "_blank");
}

export interface PostMandalartToXParams {
  mandalart: MandalartListItem;
}

// マンダラートをXに投稿
export function postMandalartToX({ mandalart }: PostMandalartToXParams): void {
  const content = formatMandalartForX(mandalart);
  openXPost(content);
}

// マンダラートをX投稿用にフォーマット
function formatMandalartForX(mandalart: MandalartListItem): string {
  const publicUrl = generateMandalartPublicUrl(mandalart.publicToken);
  const truncatedTheme =
    mandalart.themeName.length > 30
      ? mandalart.themeName.slice(0, 30) + "..."
      : mandalart.themeName;

  return `📊マンダラート
📝テーマ:${truncatedTheme}
アイデアを整理しました！

🔗結果はこちら: ${publicUrl}

#アイデア研究所`;
}

export interface PostOsbornChecklistToXParams {
  osbornChecklist: OsbornChecklistListItem;
}

// オズボーンのチェックリストをXに投稿
export function postOsbornChecklistToX({ osbornChecklist }: PostOsbornChecklistToXParams): void {
  const content = formatOsbornChecklistForX(osbornChecklist);
  openXPost(content);
}

// オズボーンのチェックリストをX投稿用にフォーマット
function formatOsbornChecklistForX(osbornChecklist: OsbornChecklistListItem): string {
  const publicUrl = generateOsbornChecklistPublicUrl(osbornChecklist.publicToken);
  const truncatedTheme =
    osbornChecklist.themeName.length > 30
      ? osbornChecklist.themeName.slice(0, 30) + "..."
      : osbornChecklist.themeName;

  return `✅オズボーンのチェックリスト
📝テーマ:${truncatedTheme}
アイデアを整理しました！

🔗結果はこちら: ${publicUrl}

#アイデア研究所`;
}
