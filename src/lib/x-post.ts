/**
 * X(Twitter)投稿関連
 */
import { generateInviteUrl } from "@/lib/invite-url";
import { BrainwritingListItem } from "../types/brainwriting";

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
