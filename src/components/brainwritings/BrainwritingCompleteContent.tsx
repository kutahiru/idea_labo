"use client";

import BrainwritingInfo from "@/components/brainwritings/BrainwritingInfo";
import XPostButton from "@/components/brainwritings/XPostButton";
import { BrainwritingListItem } from "@/types/brainwriting";
import { postBrainwritingToX } from "@/lib/x-post";
import { useRouter } from "next/navigation";

interface BrainwritingCompleteContentProps {
  brainwriting: BrainwritingListItem;
}

export default function BrainwritingCompleteContent({
  brainwriting,
}: BrainwritingCompleteContentProps) {
  const router = useRouter();

  const handleShareToX = () => {
    postBrainwritingToX({
      title: brainwriting.title,
      themeName: brainwriting.themeName,
      inviteToken: brainwriting.inviteToken,
    });
  };

  return (
    <div>
      <BrainwritingInfo brainwriting={brainwriting} />

      <div className="mt-8 text-center">
        <div className="mb-6">
          <h1 className="text-primary mb-2 text-3xl font-bold">回答完了</h1>
          <p className="text-gray-600">
            ブレインライティングへの回答が完了しました
            <br />
            次の回答者のためにXに共有をお願いします
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/brainwriting")}
            className="rounded-md bg-gray-500 px-6 py-2 text-white transition-transform hover:scale-105"
          >
            一覧に戻る
          </button>
          <XPostButton buttonName="回答をXに共有" onClick={handleShareToX} />
        </div>
      </div>
    </div>
  );
}
