import { BrainwritingInputData } from "@/types/brainwriting";
import { handleBrainwritingDataChange } from "@/utils/brainwriting";

/**
 * ブレインライティングのセルデータ変更処理を提供するカスタムフック
 * @param brainwritingId - ブレインライティングのID
 * @param setCurrentInputs - 入力データのstate更新関数
 * @returns handleDataChange - セルのデータ変更を行う関数
 */
export function useBrainwritingDataChange(
  brainwritingId: number,
  setCurrentInputs: React.Dispatch<React.SetStateAction<BrainwritingInputData[]>>
) {
  /**
   * セルのデータ変更をAPIに保存してstateを更新する
   * @param rowIndex - 行インデックス（0-5）
   * @param ideaIndex - 列インデックス（0-2）
   * @param value - 入力値
   * @param sheetId - シートID
   */
  const handleDataChange = async (
    rowIndex: number,
    ideaIndex: number,
    value: string,
    sheetId: number
  ) => {
    await handleBrainwritingDataChange(brainwritingId, rowIndex, ideaIndex, value, sheetId);

    // stateを更新
    setCurrentInputs(prevInputs => {
      return prevInputs.map(input => {
        if (
          input.brainwriting_sheet_id === sheetId &&
          input.row_index === rowIndex &&
          input.column_index === ideaIndex
        ) {
          return { ...input, content: value || null };
        }
        return input;
      });
    });
  };

  return { handleDataChange };
}
