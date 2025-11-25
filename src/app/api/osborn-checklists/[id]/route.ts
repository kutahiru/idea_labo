import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { deleteOsbornChecklist, updateOsbornChecklist } from "@/lib/osborn-checklist";
import { osbornChecklistFormDataSchema } from "@/schemas/osborn-checklist";

/**
 * オズボーンのチェックリストの情報を更新するPUT APIエンドポイント
 *
 * 指定されたIDのオズボーンのチェックリスト情報を更新します。
 * タイトル、テーマ、説明を変更できます。
 * Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: PUT /api/osborn-checklists/[id]
 *
 * リクエストボディ:
 * ```json
 * {
 *   "title": "新商品アイデア（改訂版）",
 *   "themeName": "2024年春の新商品",
 *   "description": "若年層向けの商品開発（更新）"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 123,
 *   "userId": "user-123",
 *   "title": "新商品アイデア（改訂版）",
 *   "themeName": "2024年春の新商品",
 *   "description": "若年層向けの商品開発（更新）",
 *   "publicToken": "abc123",
 *   "isResultsPublic": false,
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "updatedAt": "2024-01-02T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに更新データを含む）
 * @param params - ルートパラメータ（id: オズボーンのチェックリストID）
 * @returns 更新後のオズボーンのチェックリスト情報を含むJSONレスポンス、またはエラーレスポンス
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: osbornChecklistId } = validateResult;

    //リクエストボディを取得・検証
    const body = await request.json();
    const parsedBody = osbornChecklistFormDataSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiErrors.invalidData(parsedBody.error.issues);
    }

    // オズボーンを更新
    const result = await updateOsbornChecklist(osbornChecklistId, userId, parsedBody.data);

    if (!result) {
      return apiErrors.notFound("オズボーンのチェックリスト");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("オズボーンのチェックリスト更新エラー:", error);
    return apiErrors.serverError();
  }
}

/**
 * オズボーンのチェックリストを削除するDELETE APIエンドポイント
 *
 * 指定されたIDのオズボーンのチェックリストを削除します。
 * 関連する入力データやAI生成データも全て削除されます（カスケード削除）。
 * 認証されたユーザーが作成したオズボーンのチェックリストのみ削除可能です。
 *
 * エンドポイント: DELETE /api/osborn-checklists/[id]
 *
 * レスポンス例:
 * ```json
 * {
 *   "message": "削除が完了しました",
 *   "id": 123
 * }
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: オズボーンのチェックリストID）
 * @returns 削除結果を含むJSONレスポンス、またはエラーレスポンス
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: osbornChecklistId } = validateResult;

    const result = await deleteOsbornChecklist(osbornChecklistId, userId);

    if (!result) {
      return apiErrors.notFound("オズボーンのチェックリスト");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("オズボーンのチェックリスト削除エラー:", error);
    return apiErrors.serverError();
  }
}
