"use client";

import IdeaFrameworkInfo from "@/components/shared/IdeaFrameworkInfo";
import { XPostButton } from "@/components/shared/Button";
import { BrainwritingListItem } from "@/types/brainwriting";
import { postBrainwritingToX } from "@/lib/x-post";
import { useRouter } from "next/navigation";

interface BrainwritingCompleteContentProps {
  brainwriting: BrainwritingListItem;
  remainingUserCount: number;
}

/**
 * ブレインライティングの回答完了画面を表示するコンポーネント
 * 回答完了メッセージ、Xへの共有ボタン、トップページへの戻るボタンを提供
 * @param brainwriting - ブレインライティングの情報
 * @param remainingUserCount - 残りの回答者数
 */
export default function BrainwritingCompleteContent({
  brainwriting,
  remainingUserCount,
}: BrainwritingCompleteContentProps) {
  const router = useRouter();

  const handleShareToX = () => {
    postBrainwritingToX({ brainwriting, isOwner: false, remainingUserCount });
  };

  return (
    <div>
      <IdeaFrameworkInfo ideaFramework={brainwriting} />

      <div className="mt-2 text-center">
        <div className="mb-6">
          <h1 className="text-primary mb-2 text-3xl font-bold">回答完了</h1>
          <p className="mt-4 text-muted">
            ブレインライティングへの回答が完了しました
            <br />
            ご協力ありがとうございました
            <br />
            {remainingUserCount === 0
              ? "回答が完了したことをXに共有しましょう"
              : "次の回答者のためにXに共有をお願いします"}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer rounded-md bg-gray-500 px-6 py-2 text-white transition-transform hover:scale-105"
          >
            トップページに戻る
          </button>
          <XPostButton buttonName="共有" onClick={handleShareToX} />
        </div>
      </div>
    </div>
  );
}
