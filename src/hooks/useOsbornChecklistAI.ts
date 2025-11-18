import { useState } from "react";
import toast from "react-hot-toast";
import { OsbornChecklistType, OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";
import { OsbornChecklistInputData } from "@/types/osborn-checklist";
import { parseJsonSafe } from "@/lib/client-utils";

interface UseOsbornChecklistAIOptions {
  osbornChecklistId: number;
  currentInputs: OsbornChecklistInputData[];
  onInputChange: (checklistType: OsbornChecklistType, value: string, skipIfNotEmpty?: boolean) => Promise<void>;
}

export function useOsbornChecklistAI({
  osbornChecklistId,
  currentInputs,
  onInputChange,
}: UseOsbornChecklistAIOptions) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (isGenerating) return;

    // 全ての項目が既に入力されているかチェック
    const allChecklistTypes = Object.values(OSBORN_CHECKLIST_TYPES);
    const filledInputs = currentInputs.filter(
      input => input.content && input.content.trim() !== ""
    );

    if (filledInputs.length === allChecklistTypes.length) {
      toast.error("全ての項目が既に入力されています");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("AIでアイデアを生成中...");

    try {
      const response = await fetch(`/api/osborn-checklists/${osbornChecklistId}/ai-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, { error: "AI生成に失敗しました" });
        toast.error(errorData.error || "AI生成に失敗しました");
        return;
      }

      const data = await response.json();
      const { ideas } = data;

      // 各アイデアを順番に保存（skipIfNotEmpty=trueで既存の入力がある場合はDB側でスキップ）
      for (const [checklistType, content] of Object.entries(ideas)) {
        await onInputChange(checklistType as OsbornChecklistType, content as string, true);
      }

      toast.success("AIでアイデアを生成しました！");
    } catch (error) {
      console.error("AI生成エラー:", error);
      toast.error("AI生成中にエラーが発生しました");
    } finally {
      toast.dismiss(loadingToast);
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    handleAIGenerate,
  };
}
