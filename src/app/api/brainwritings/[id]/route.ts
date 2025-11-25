import { NextRequest, NextResponse } from "next/server";
import {
  getBrainwritingDetailById,
  updateBrainwriting,
  deleteBrainwriting,
} from "@/lib/brainwriting";
import { brainwritingFormDataSchema } from "@/schemas/brainwriting";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

/**
 * ブレインライティングの詳細情報を取得するGET APIエンドポイント
 *
 * 指定されたIDのブレインライティング情報を取得します。
 * 認証されたユーザーが作成したブレインライティングのみアクセス可能です。
 *
 * エンドポイント: GET /api/brainwritings/[id]
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 123,
 *   "title": "新商品アイデア出し",
 *   "theme_name": "2024年春の新商品",
 *   "description": "若年層向けの商品開発",
 *   "usage_scope": "team",
 *   "user_id": 1,
 *   "created_at": "2024-01-01T00:00:00Z",
 *   "updated_at": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns ブレインライティング詳細を含むJSONレスポンス、またはエラーレスポンス
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id } = validateResult;

    // ブレインライティング詳細を取得
    const brainwritingDetail = await getBrainwritingDetailById(id, userId);

    if (!brainwritingDetail) {
      return apiErrors.notFound("ブレインライティング");
    }

    return NextResponse.json(brainwritingDetail);
  } catch (error) {
    console.error("ブレインライティング取得エラー:", error);
    return apiErrors.serverError();
  }
}

/**
 * ブレインライティングの情報を更新するPUT APIエンドポイント
 *
 * 指定されたIDのブレインライティング情報を更新します。
 * タイトル、テーマ、説明などを変更できます。
 * Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: PUT /api/brainwritings/[id]
 *
 * リクエストボディ:
 * ```json
 * {
 *   "title": "新商品アイデア出し（改訂版）",
 *   "themeName": "2024年夏の新商品",
 *   "description": "若年層向けの商品開発（更新）"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 123,
 *   "title": "新商品アイデア出し（改訂版）",
 *   "theme_name": "2024年夏の新商品",
 *   "description": "若年層向けの商品開発（更新）",
 *   "updated_at": "2024-01-02T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに更新データを含む）
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns 更新後のブレインライティング情報を含むJSONレスポンス、またはエラーレスポンス
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingId } = validateResult;

    // リクエストボディを取得・検証
    const body = await request.json();
    const parsedBody = brainwritingFormDataSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiErrors.invalidData(parsedBody.error.issues);
    }

    // ブレインライティングを更新
    const result = await updateBrainwriting(brainwritingId, userId, parsedBody.data);

    if (!result) {
      return apiErrors.notFound("ブレインライティング");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("ブレインライティング更新エラー:", error);
    return apiErrors.serverError();
  }
}

/**
 * ブレインライティングを削除するDELETE APIエンドポイント
 *
 * 指定されたIDのブレインライティングを削除します。
 * 関連するシート、参加者、入力データも全て削除されます（カスケード削除）。
 * 認証されたユーザーが作成したブレインライティングのみ削除可能です。
 *
 * エンドポイント: DELETE /api/brainwritings/[id]
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
 * @param params - ルートパラメータ（id: ブレインライティングID）
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

    const { userId, id: brainwritingId } = validateResult;

    // ブレインライティングを削除
    const result = await deleteBrainwriting(brainwritingId, userId);

    if (!result) {
      return apiErrors.notFound("ブレインライティング");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("ブレインライティング削除エラー:", error);
    return apiErrors.serverError();
  }
}
