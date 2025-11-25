import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { osbornChecklistFormDataSchema } from "@/schemas/osborn-checklist";
import { createOsbornChecklist } from "@/lib/osborn-checklist";

/**
 * オズボーンのチェックリストを新規作成するPOST APIエンドポイント
 *
 * 認証済みユーザーが新しいオズボーンのチェックリストを作成します。
 * タイトル、テーマ、説明を指定できます。
 * Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: POST /api/osborn-checklists
 *
 * リクエストボディ:
 * ```json
 * {
 *   "title": "新商品アイデア",
 *   "themeName": "2024年春の新商品",
 *   "description": "若年層向けの商品開発"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 123,
 *   "userId": "user-123",
 *   "title": "新商品アイデア",
 *   "themeName": "2024年春の新商品",
 *   "description": "若年層向けの商品開発",
 *   "publicToken": "abc123",
 *   "isResultsPublic": false,
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "updatedAt": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに作成データを含む）
 * @returns 作成されたオズボーンのチェックリスト情報を含むJSONレスポンス（ステータス201）、またはエラーレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = osbornChecklistFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    const result = await createOsbornChecklist(authResult.userId, validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("オズボーンのチェックリスト作成エラー:", error);
    return apiErrors.serverError();
  }
}
