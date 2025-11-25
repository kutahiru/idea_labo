import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { deleteMandalart, getMandalartDetailById, updateMandalart } from "@/lib/mandalart";
import { mandalartFormDataSchema } from "@/schemas/mandalart";

/**
 * マンダラートの詳細情報を取得するGET APIエンドポイント
 *
 * 指定されたIDのマンダラート情報（入力データを含む）を取得します。
 * 認証されたユーザーが作成したマンダラートのみアクセス可能です。
 *
 * エンドポイント: GET /api/mandalarts/[id]
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 123,
 *   "userId": "user-123",
 *   "title": "目標達成マンダラート",
 *   "themeName": "年間目標",
 *   "description": "2024年の目標を整理",
 *   "publicToken": "abc123",
 *   "isResultsPublic": false,
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "inputs": [
 *     {
 *       "id": 1,
 *       "mandalart_id": 123,
 *       "section_index": 4,
 *       "cell_index": 0,
 *       "content": "中心テーマ",
 *       "created_at": "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: マンダラートID）
 * @returns マンダラート詳細（入力データを含む）を含むJSONレスポンス、またはエラーレスポンス
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: mandalartId } = validateResult;

    const mandalartDetail = await getMandalartDetailById(mandalartId, userId);

    if (!mandalartDetail) {
      return apiErrors.notFound("マンダラート");
    }

    return NextResponse.json(mandalartDetail);
  } catch (error) {
    console.log("マンダラート取得エラー", error);
    return apiErrors.serverError();
  }
}

/**
 * マンダラートの情報を更新するPUT APIエンドポイント
 *
 * 指定されたIDのマンダラート情報を更新します。
 * タイトル、テーマ、説明を変更できます。
 * Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: PUT /api/mandalarts/[id]
 *
 * リクエストボディ:
 * ```json
 * {
 *   "title": "目標達成マンダラート（改訂版）",
 *   "themeName": "年間目標2024",
 *   "description": "2024年の目標を整理（更新）"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 123,
 *   "userId": "user-123",
 *   "title": "目標達成マンダラート（改訂版）",
 *   "themeName": "年間目標2024",
 *   "description": "2024年の目標を整理（更新）",
 *   "publicToken": "abc123",
 *   "isResultsPublic": false,
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "updatedAt": "2024-01-02T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに更新データを含む）
 * @param params - ルートパラメータ（id: マンダラートID）
 * @returns 更新後のマンダラート情報を含むJSONレスポンス、またはエラーレスポンス
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: mandalartId } = validateResult;

    //リクエストボディを取得・検証
    const body = await request.json();
    const parsedBody = mandalartFormDataSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiErrors.invalidData(parsedBody.error.issues);
    }

    // マンダラートを更新
    const result = await updateMandalart(mandalartId, userId, parsedBody.data);

    if (!result) {
      return apiErrors.notFound("マンダラート");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("マンダラート更新エラー:", error);
    return apiErrors.serverError();
  }
}

/**
 * マンダラートを削除するDELETE APIエンドポイント
 *
 * 指定されたIDのマンダラートを削除します。
 * 関連する入力データも全て削除されます（カスケード削除）。
 * 認証されたユーザーが作成したマンダラートのみ削除可能です。
 *
 * エンドポイント: DELETE /api/mandalarts/[id]
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
 * @param params - ルートパラメータ（id: マンダラートID）
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

    const { userId, id: mandalartId } = validateResult;

    const result = await deleteMandalart(mandalartId, userId);

    if (!result) {
      return apiErrors.notFound("マンダラート");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("マンダラート削除エラー:", error);
    return apiErrors.serverError();
  }
}
