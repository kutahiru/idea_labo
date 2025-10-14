/**
 * X(Twitter)投稿関連
 */
import { generateInviteUrl } from "@/lib/invite-url";

export interface BrainwritingData {
  title: string;
  themeName: string;
  inviteToken: string;
}

// ブレインライティングをX投稿用にフォーマット
export function formatBrainwritingForX(brainwriting: BrainwritingData): string {
  let content = `🧠 ブレインライティング\n`;
  content += `📝 テーマ: ${brainwriting.themeName}\n`;

  content += `皆さんのアイデアをお待ちしています！\n`;
  content += `ご協力お願いします🙏\n`;

  // 招待URLを追加
  const inviteUrl = generateInviteUrl(brainwriting.inviteToken);
  content += `\n🔗 参加はこちら: ${inviteUrl}\n`;

  content += `\n#アイデア研究所`;
  return content;
}

// X投稿画面を開く
export function openXPost(content: string): void {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
  window.open(tweetUrl, "_blank");
}

// ブレインライティングをXに投稿
export function postBrainwritingToX(brainwriting: BrainwritingData): void {
  const content = formatBrainwritingForX(brainwriting);
  openXPost(content);
}
