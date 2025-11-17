/**
 * リソースの作成・更新・削除を行う汎用的なCRUD操作機能を提供するカスタムフック
 */
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { parseJsonSafe, parseJson } from "@/lib/client-utils";

interface UseResourceSubmitOptions {
  apiPath: string;
  resourceName: string;
  editingData: { id: number } | null;
  onSuccess?: (isEdit: boolean, result?: unknown) => void;
  additionalData?: Record<string, unknown>; // 追加するデータ
}

interface UseResourceDeleteOptions {
  apiPath: string;
  resourceName: string;
  onSuccess?: () => void;
}

export function useResourceSubmit<T>({
  apiPath,
  resourceName,
  editingData,
  onSuccess,
  additionalData,
}: UseResourceSubmitOptions) {
  const router = useRouter();

  return async (data: T) => {
    try {
      const url = editingData ? `${apiPath}/${editingData.id}` : apiPath;
      const method = editingData ? "PUT" : "POST";
      const body = additionalData ? { ...data, ...additionalData } : data;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, {
          error: `${editingData ? "更新" : "作成"}に失敗しました`,
        });
        throw new Error(errorData.error || `${editingData ? "更新" : "作成"}に失敗しました`);
      }

      const result = await parseJson(response);

      toast.success(`${resourceName}が${editingData ? "更新" : "作成"}されました`);

      // コールバック関数が設定されていれば実行
      if (onSuccess) {
        onSuccess(!!editingData, result);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(`${resourceName}${editingData ? "更新" : "作成"}エラー:`, error);
      toast.error(
        `エラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`
      );
    }
  };
}

export function useResourceDelete({
  apiPath,
  resourceName,
  onSuccess,
}: UseResourceDeleteOptions) {
  const router = useRouter();

  return async (item: { id: number }) => {
    if (!confirm("本当に削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`${apiPath}/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, {
          error: "削除に失敗しました",
        });
        throw new Error(errorData.error || "削除に失敗しました");
      }

      toast.success(`${resourceName}が削除されました`);

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(`${resourceName}削除エラー:`, error);
      toast.error(
        `エラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`
      );
    }
  };
}
