import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { upsertMandalartInput } from "@/lib/mandalart";
import { mandalartInputSchema } from "@/schemas/mandalart";

/**
 * マンダラートの入力データを保存するPOST APIエンドポイント
 *
 * ユーザーがマンダラートのセルに入力したデータを保存します。
 * 既に入力データが存在する場合は更新（upsert）します。
 * Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: POST /api/mandalarts/inputs
 *
 * マンダラートは9×9のグリッド構造で、各セルは以下のインデックスで識別されます：
 * - sectionRowIndex, sectionColumnIndex: 3×3のセクション位置（0-2）
 * - rowIndex, columnIndex: セクション内のセル位置（0-2）
 *
 * リクエストボディ:
 * ```json
 * {
 *   "mandalartId": 123,
 *   "sectionRowIndex": 1,
 *   "sectionColumnIndex": 1,
 *   "rowIndex": 0,
 *   "columnIndex": 1,
 *   "content": "新しいアイデア"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 456,
 *   "mandalart_id": 123,
 *   "section_index": 4,
 *   "cell_index": 1,
 *   "content": "新しいアイデア",
 *   "created_at": "2024-01-01T00:00:00Z",
 *   "updated_at": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに入力データを含む）
 * @returns 保存された入力データを含むJSONレスポンス、またはエラーレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();

    // Zodスキーマでバリデーション
    const validationResult = mandalartInputSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues[0].message);
    }

    const { mandalartId, sectionRowIndex, sectionColumnIndex, rowIndex, columnIndex, content } =
      validationResult.data;

    const result = await upsertMandalartInput(
      mandalartId,
      authResult.userId,
      sectionRowIndex,
      sectionColumnIndex,
      rowIndex,
      columnIndex,
      content
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("マンダラート入力保存エラー:", error);

    // アクセス拒否エラーのハンドリング
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return apiErrors.forbidden();
    }

    return apiErrors.serverError();
  }
}
