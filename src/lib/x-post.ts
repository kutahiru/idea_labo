// X(Twitter)投稿関連のユーティリティ

export interface BrainwritingData {
  title: string;
  themeName: string;
}

export interface BrainwritingInput {
  content: string | null;
}

// ブレインライティングをX投稿用にフォーマット
export function formatBrainwritingForX(
  brainwriting: BrainwritingData,
  inputs?: BrainwritingInput[]
): string {
  let content = `🧠 ブレインライティング結果\n`;
  content += `📝 テーマ: ${brainwriting.themeName}\n`;
  content += `💡 タイトル: ${brainwriting.title}\n\n`;

  // 全てのアイデアを収集
  const allIdeas: string[] = [];
  inputs?.forEach(input => {
    if (input.content && input.content.trim()) {
      allIdeas.push(input.content.trim());
    }
  });

  if (allIdeas.length > 0) {
    content += `💭 生まれたアイデア:\n`;
    allIdeas.slice(0, 6).forEach((idea, index) => {
      content += `${index + 1}. ${idea}\n`;
    });

    if (allIdeas.length > 6) {
      content += `...他${allIdeas.length - 6}個のアイデア\n`;
    }
  } else {
    content += `💭 アイデア募集中...\n`;
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
export function postBrainwritingToX(
  brainwriting: BrainwritingData,
  inputs?: BrainwritingInput[]
): void {
  const content = formatBrainwritingForX(brainwriting, inputs);
  openXPost(content);
}
