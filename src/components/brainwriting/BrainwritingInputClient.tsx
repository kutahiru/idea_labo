"use client";

import BrainwritingInfo from "@/components/brainwriting/BrainwritingInfo";
import BrainwritingSheet from "@/components/brainwriting/BrainwritingSheet";
import { BrainwritingDetail } from "@/types/brainwriting";
import { convertToRowData, handleBrainwritingDataChange } from "@/utils/brainwriting";

interface BrainwritingInputClientProps {
  brainwritingDetail: BrainwritingDetail;
  currentUserId: string;
}

export default function BrainwritingInputClient({
  brainwritingDetail,
  currentUserId,
}: BrainwritingInputClientProps) {
  const { sheets, inputs, users, ...brainwriting } = brainwritingDetail;
  const sheet = sheets[0];

  const handleDataChange = async (
    rowIndex: number,
    ideaIndex: number,
    value: string,
    sheetId: number
  ) => {
    await handleBrainwritingDataChange(brainwritingDetail.id, rowIndex, ideaIndex, value, sheetId);
  };

  // inputsを行データ形式に変換する
  const brainwritingRows = convertToRowData(inputs, users);

  // 現在のユーザーの行インデックスを計算（参加順）
  const activeRowIndex = users.findIndex(u => u.user_id === currentUserId);

  return (
    <div>
      <BrainwritingInfo brainwriting={brainwriting} />

      <BrainwritingSheet
        brainwritingRows={brainwritingRows}
        activeRowIndex={activeRowIndex >= 0 ? activeRowIndex : undefined}
        isAllReadOnly={false}
        onDataChange={(rowIndex, ideaIndex, value) =>
          handleDataChange(rowIndex, ideaIndex, value, sheet.id)
        }
      />

      <div className="mt-6 text-center">
        <button
          onClick={() => window.history.back()}
          className="rounded-md bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
