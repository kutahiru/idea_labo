import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/api/utils";
import { mandalartFormDataSchema } from "../../../schemas/mandalart";
import { createMandalart } from "@/lib/mandalart";

/**
 * マンダラートを新規作成するPOST APIエンドポイント
 *
 * 認証済みユーザーが新しいマンダラートを作成します。
 * タイトル、テーマ、説明を指定できます。
 * Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: POST /api/mandalarts
 *
 * リクエストボディ:
 * ```json
 * {
 *   "title": "目標達成マンダラート",
 *   "themeName": "年間目標",
 *   "description": "2024年の目標を整理"
 * }
 * ```
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
 *   "updatedAt": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに作成データを含む）
 * @returns 作成されたマンダラート情報を含むJSONレスポンス（ステータス201）、またはエラーレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = mandalartFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "入力データが無効です",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await createMandalart(authResult.userId, validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("マンダラート作成エラー", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
