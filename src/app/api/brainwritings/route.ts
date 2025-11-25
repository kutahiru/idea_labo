import { NextRequest, NextResponse } from "next/server";
import { createBrainwriting } from "@/lib/brainwriting";
import { brainwritingFormDataSchema } from "@/schemas/brainwriting";
import { apiErrors, checkAuth } from "@/lib/api/utils";

/**
 * ブレインライティングを新規作成するPOST APIエンドポイント
 *
 * 認証済みユーザーが新しいブレインライティングを作成します。
 * タイトル、テーマ、説明、利用範囲（X投稿版/チーム版）を指定できます。
 * Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: POST /api/brainwritings
 *
 * リクエストボディ:
 * ```json
 * {
 *   "title": "新商品アイデア出し",
 *   "themeName": "2024年春の新商品",
 *   "description": "若年層向けの商品開発",
 *   "usageScope": "team" | "xpost"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 123,
 *   "title": "新商品アイデア出し",
 *   "theme_name": "2024年春の新商品",
 *   "description": "若年層向けの商品開発",
 *   "usage_scope": "team",
 *   "user_id": "user-123",
 *   "created_at": "2024-01-01T00:00:00Z",
 *   "updated_at": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに作成データを含む）
 * @returns 作成されたブレインライティング情報を含むJSONレスポンス（ステータス201）、またはエラーレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = brainwritingFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    // ブレインライティングを作成
    const result = await createBrainwriting(authResult.userId, validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("ブレインライティング作成エラー:", error);
    return apiErrors.serverError();
  }
}
