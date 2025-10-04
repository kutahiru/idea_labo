// X(Twitter)投稿関連のユーティリティ

export interface BrainwritingData {
  title: string;
  themeName: string;
  inviteToken?: string | null;
}

// ブレインライティングをX投稿用にフォーマット
export function formatBrainwritingForX(brainwriting: BrainwritingData): string {
  let content = `🧠 ブレインライティング\n`;
  content += `📝 テーマ: ${brainwriting.themeName}\n`;
  content += `💡 タイトル: ${brainwriting.title}\n\n`;

  content += `皆さんのアイデアをお待ちしています！\n`;
  content += `ぜひご協力ください🙏\n`;

  // 招待URLを追加
  if (brainwriting.inviteToken) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/brainwriting/invite/${brainwriting.inviteToken}`;
    content += `\n🔗 参加はこちら: ${inviteUrl}\n`;
  }

  content += `\n#ブレインライティング #アイデア発想 #アイデア研究所`;
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
