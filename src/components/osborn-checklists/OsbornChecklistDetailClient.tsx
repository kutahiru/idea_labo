"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { OsbornChecklistDetail } from "@/types/osborn-checklist";
import { OsbornChecklistType } from "@/schemas/osborn-checklist";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import OsbornChecklistGrid from "./OsbornChecklistGrid";
import { XPostButton } from "../shared/Button";
import ResultsPublicToggle from "../shared/ResultsPublicToggle";
import { postOsbornChecklistToX } from "@/lib/x-post";
import { parseJsonSafe } from "@/lib/client-utils";
import { useOsbornChecklistAI } from "@/hooks/useOsbornChecklistAI";
import { useResultsPublic } from "@/hooks/useResultsPublic";
import AIAutoInputButton from "../shared/AIAutoInputButton";

interface OsbornChecklistDetailClientProps {
  osbornChecklistDetail: OsbornChecklistDetail;
}

/**
 * オズボーンのチェックリスト詳細ページのクライアントコンポーネント
 * @param props.osbornChecklistDetail - オズボーンのチェックリストの詳細情報
 */
export default function OsbornChecklistDetailClient({
  osbornChecklistDetail,
}: OsbornChecklistDetailClientProps) {
  const router = useRouter();
  const { inputs, aiGeneration, ...osbornChecklist } = osbornChecklistDetail;
  const [currentInputs, setCurrentInputs] = useState(inputs);

  // 結果公開の状態管理
  const { isResultsPublic, isUpdating, handleUpdateIsResultsPublic } = useResultsPublic({
    apiEndpoint: `/api/osborn-checklists/${osbornChecklist.id}/results-public`,
    initialValue: osbornChecklist.isResultsPublic ?? false,
  });

  // propsのinputsが更新されたら、currentInputsも更新
  useEffect(() => {
    setCurrentInputs(inputs);
  }, [inputs]);

  // データ再取得関数
  const handleRefresh = useCallback(async () => {
    router.refresh();
  }, [router]);

  // 入力内容を保存
  const handleInputChange = async (checklistType: OsbornChecklistType, value: string) => {
    try {
      const response = await fetch("/api/osborn-checklists/inputs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          osbornChecklistId: osbornChecklist.id,
          checklistType,
          content: value,
        }),
      });

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, { error: "保存に失敗しました" });
        toast.error(errorData.error || "保存に失敗しました");
        return;
      }

      // 保存成功後、currentInputsも更新（AIバリデーション用）
      setCurrentInputs(prev => {
        const existingIndex = prev.findIndex(input => input.checklist_type === checklistType);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], content: value };
          return updated;
        }
        return prev;
      });
    } catch (error) {
      console.error("オズボーンのチェックリスト入力保存エラー:", error);
      toast.error("ネットワークエラーが発生しました");
    }
  };

  // AI自動入力のカスタムhook
  const { isGenerating, handleAIGenerate } = useOsbornChecklistAI({
    osbornChecklistId: osbornChecklist.id,
    currentInputs,
    aiGeneration: aiGeneration || null,
    onRefresh: handleRefresh,
  });

  // Xにチェックリストの結果を投稿
  const handleXPost = () => {
    postOsbornChecklistToX({ osbornChecklist });
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={osbornChecklist} />

      <AIAutoInputButton isGenerating={isGenerating} onGenerate={handleAIGenerate} />

      {/* X投稿ボタンと結果公開トグル */}
      <div className="mt-8 mb-6 flex items-center justify-center gap-6">
        <XPostButton buttonName="公開" onClick={handleXPost} disabled={!isResultsPublic} />
        <ResultsPublicToggle
          isResultsPublic={isResultsPublic}
          isUpdating={isUpdating}
          onToggle={handleUpdateIsResultsPublic}
        />
      </div>

      <div>
        <OsbornChecklistGrid
          osbornChecklistId={osbornChecklist.id}
          inputs={currentInputs}
          onInputChange={handleInputChange}
          readOnly={isGenerating}
        />
      </div>
    </div>
  );
}
