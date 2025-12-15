"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MandalartDetail } from "@/types/mandalart";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import MandalartGrid from "./MandalartGrid";
import { XPostButton } from "../shared/Button";
import ResultsPublicToggle from "../shared/ResultsPublicToggle";
import { postMandalartToX } from "@/lib/x-post";
import { parseJsonSafe } from "@/lib/client-utils";
import { useMandalartAI } from "@/hooks/useMandalartAI";
import { useResultsPublic } from "@/hooks/useResultsPublic";
import AIAutoInputButton from "../shared/AIAutoInputButton";

interface MandalartDetailClientProps {
  mandalartDetail: MandalartDetail;
}

/**
 * マンダラート詳細・編集画面のクライアントコンポーネント
 *
 * 9×9のマンダラートグリッドを表示し、各セルの編集、自動保存機能を提供します。
 * X投稿機能と結果公開/非公開の切り替え機能を持ちます。
 * 結果が公開状態のときのみX投稿が可能です。
 *
 * 主な機能：
 * - マンダラートグリッドの表示と編集
 * - セルの入力内容を自動保存（blur/Enter時）
 * - X（旧Twitter）への投稿
 * - 結果の公開/非公開トグル
 *
 * @param mandalartDetail - マンダラートの詳細情報（テーマ名、入力データを含む）
 */
export default function MandalartDetailClient({ mandalartDetail }: MandalartDetailClientProps) {
  const router = useRouter();
  const { inputs, aiGeneration, ...mandalart } = mandalartDetail;
  const [currentInputs, setCurrentInputs] = useState(inputs);

  // 結果公開の状態管理
  const { isResultsPublic, isUpdating, handleUpdateIsResultsPublic } = useResultsPublic({
    apiEndpoint: `/api/mandalarts/${mandalart.id}/results-public`,
    initialValue: mandalart.isResultsPublic ?? false,
  });

  // propsのinputsが更新されたら、currentInputsも更新
  useEffect(() => {
    setCurrentInputs(inputs);
  }, [inputs]);

  // データ再取得関数(AI生成後に利用)
  const handleRefresh = useCallback(async () => {
    router.refresh();
  }, [router]);

  // AI自動入力のカスタムhook
  const { isGenerating, handleAIGenerate } = useMandalartAI({
    mandalartId: mandalart.id,
    currentInputs,
    aiGeneration: aiGeneration || null,
    onRefresh: handleRefresh,
  });

  const handleInputChange = async (
    sectionRowIndex: number,
    sectionColumnIndex: number,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) => {
    try {
      const response = await fetch("/api/mandalarts/inputs", {
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

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, { error: "保存に失敗しました" });
        toast.error(errorData.error || "保存に失敗しました");
        return;
      }

      // 保存成功後、currentInputsも更新（AIバリデーション用）
      setCurrentInputs(prev =>
        prev.map(input =>
          input.section_row_index === sectionRowIndex &&
          input.section_column_index === sectionColumnIndex &&
          input.row_index === rowIndex &&
          input.column_index === columnIndex
            ? { ...input, content: value }
            : input
        )
      );
    } catch (error) {
      console.error("マンダラート入力保存エラー:", error);
      toast.error("ネットワークエラーが発生しました");
    }
  };

  // X投稿ボタンのクリックハンドラー
  const handleXPost = () => {
    postMandalartToX({ mandalart });
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={mandalart} />

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
        <MandalartGrid
          themeName={mandalart.themeName}
          inputs={currentInputs}
          onInputChange={handleInputChange}
          readOnly={isGenerating}
        />
      </div>
    </div>
  );
}
