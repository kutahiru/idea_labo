"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MandalartDetail } from "@/types/mandalart";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import MandalartGrid from "./MandalartGrid";
import { XPostButton } from "../shared/Button";
import ToggleSwitch from "../shared/ToggleSwitch";
import { postMandalartToX } from "@/lib/x-post";
import { parseJsonSafe } from "@/lib/client-utils";
import { Loader2, HelpCircle } from "lucide-react";
import { useMandalartAI } from "@/hooks/useMandalartAI";

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
  const [isResultsPublic, setIsResultsPublic] = useState(mandalart.isResultsPublic ?? false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentInputs, setCurrentInputs] = useState(inputs);

  // propsのinputsが更新されたら、currentInputsも更新
  useEffect(() => {
    setCurrentInputs(inputs);
  }, [inputs]);

  // データ再取得関数
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
        const error = await parseJsonSafe(response, { error: "結果公開の状態更新に失敗しました" });
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

      {/* AI自動入力ボタン */}
      <div className="mt-8 mb-6 flex justify-center">
        <div className="flex items-center gap-1">
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className={`inline-flex items-center rounded-md px-6 py-2 text-base font-medium text-white shadow-lg transition-all duration-300 ${
              isGenerating
                ? "cursor-not-allowed bg-muted"
                : "menu-link cursor-pointer bg-primary hover:scale-105 hover:shadow-xl"
            }`}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? "生成中..." : "AIで自動入力"}
          </button>
          <div className="group relative">
            <HelpCircle className="text-primary/40 hover:text-primary mt-0.5 h-5 w-5 cursor-help transition-colors" />
            <div className="bg-primary invisible absolute top-7 left-0 z-10 w-max max-w-80 rounded-lg p-3 text-sm text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 md:max-w-110">
              <div className="bg-primary absolute -top-1 left-3 h-2 w-2 rotate-45"></div>
              <p className="whitespace-pre-line">
                AIがテーマを元にアイデアを自動生成します。
                {"\n"}
                既に入力済みの項目は上書きされず、
                {"\n"}
                未入力の項目のみが更新されます。
              </p>
            </div>
          </div>
        </div>
      </div>

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
          inputs={currentInputs}
          onInputChange={handleInputChange}
          readOnly={isGenerating}
        />
      </div>
    </div>
  );
}
