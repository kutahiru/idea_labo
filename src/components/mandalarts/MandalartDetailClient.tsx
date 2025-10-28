"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MandalartDetail } from "@/types/mandalart";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import MandalartGrid from "./MandalartGrid";
import { XPostButton } from "../shared/Button";
import ToggleSwitch from "../shared/ToggleSwitch";
import { postMandalartToX } from "@/lib/x-post";

interface MandalartDetailClientProps {
  mandalartDetail: MandalartDetail;
}

export default function MandalartDetailClient({ mandalartDetail }: MandalartDetailClientProps) {
  const { inputs, ...mandalart } = mandalartDetail;
  const [isResultsPublic, setIsResultsPublic] = useState(mandalart.isResultsPublic ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = async (
    sectionRowIndex: number,
    sectionColumnIndex: number,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) => {
    try {
      await fetch("/api/mandalarts/inputs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mandalartId: mandalart.id,
          sectionRowIndex,
          sectionColumnIndex,
          rowIndex,
          columnIndex,
          content: value,
        }),
      });
    } catch (error) {
      console.error("マンダラート入力保存エラー:", error);
    }
  };

  // X投稿ボタンのクリックハンドラー
  const handleXPost = () => {
    postMandalartToX({ mandalart });
  };

  // 結果公開の有効無効更新
  const handleUpdateIsResultsPublic = async (newValue: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/mandalarts/${mandalart.id}/results-public`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isResultsPublic: newValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "結果公開の状態更新に失敗しました");
        return;
      }

      setIsResultsPublic(newValue);
      toast.success(newValue ? "結果を公開しました" : "結果を非公開にしました");
    } catch (error) {
      console.error("結果公開の状態更新エラー:", error);
      toast.error("結果公開の状態更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={mandalart} />

      {/* X投稿ボタンと結果公開トグル */}
      <div className="mt-8 mb-6 flex items-center justify-center gap-6">
        <XPostButton buttonName="公開" onClick={handleXPost} disabled={!isResultsPublic} />
        <div className="group bg-primary/10 relative rounded-lg px-4 py-3">
          <ToggleSwitch
            label="結果公開"
            checked={isResultsPublic}
            onChange={handleUpdateIsResultsPublic}
            disabled={isUpdating}
          />
          <div className="bg-primary invisible absolute top-full left-1/2 z-10 mt-2 w-max max-w-80 -translate-x-1/2 rounded-lg p-3 text-sm text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
            <div className="bg-primary absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
            <p className="whitespace-pre-line">
              結果を公開すると、
              <br />
              公開リンクから誰でも結果を閲覧できます
            </p>
          </div>
        </div>
      </div>

      <div>
        <MandalartGrid
          themeName={mandalart.themeName}
          inputs={inputs}
          onInputChange={handleInputChange}
          readOnly={false}
        />
      </div>
    </div>
  );
}
