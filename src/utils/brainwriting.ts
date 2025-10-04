import { BrainwritingInputData, BrainwritingUserData } from "@/types/brainwriting";

/**
 * ブレインライティングの利用方法
 */
export const USAGE_SCOPE = {
  XPOST: "xpost",
  TEAM: "team",
} as const;

/**
 * 利用方法のラベルマップ
 */
export const USAGE_SCOPE_LABELS = {
  [USAGE_SCOPE.XPOST]: "X投稿",
  [USAGE_SCOPE.TEAM]: "チーム利用",
} as const;

/**
 * 利用方法の型
 */
export type UsageScope = (typeof USAGE_SCOPE)[keyof typeof USAGE_SCOPE];

/**
 * ブレインライティングのusageScopeを日本語ラベルに変換する
 */
export const getUsageScopeLabel = (usageScope: UsageScope): string => {
  return USAGE_SCOPE_LABELS[usageScope];
};

/**
 * 入力データを行データ形式に変換する
 */
export const convertToRowData = (
  sheetInputs: BrainwritingInputData[],
  users: BrainwritingUserData[]
) => {
  const rowsMap = new Map<number, { name: string; ideas: string[] }>();

  //brainwriting_inputsを元に生成
  sheetInputs?.forEach(input => {
    if (input.row_index >= 0 && input.column_index >= 0 && input.column_index < 3) {
      if (!rowsMap.has(input.row_index)) {
        rowsMap.set(input.row_index, {
          name: input.input_user_name || "",
          ideas: ["", "", ""],
        });
      }

      const row = rowsMap.get(input.row_index)!;
      row.ideas[input.column_index] = input.content || "";
    }
  });

  // 6行全体を常に表示するため、不足している行を追加
  for (let i = 0; i < 6; i++) {
    if (!rowsMap.has(i)) {
      rowsMap.set(i, {
        name: users[i]?.user_name || `参加者${i + 1}`,
        ideas: ["", "", ""],
      });
    }
  }

  // Map を配列に変換（row_index順でソート）
  return Array.from(rowsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row);
};

/**
 * ブレインライティングの入力データを保存する
 */
export const handleBrainwritingDataChange = async (
  brainwritingId: number,
  rowIndex: number,
  ideaIndex: number,
  value: string,
  sheetId: number
) => {
  try {
    const response = await fetch(`/api/brainwritings/input`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brainwritingId: brainwritingId,
        brainwritingSheetId: sheetId,
        rowIndex: rowIndex,
        columnIndex: ideaIndex,
        content: value,
      }),
    });

    if (!response.ok) {
      throw new Error("保存に失敗しました");
    }

    console.log(`保存成功: 行${rowIndex + 1}, アイデア${ideaIndex + 1}: ${value}`);
  } catch (error) {
    console.error("保存エラー:", error);
    alert("保存に失敗しました。再度お試しください。");
  }
};
