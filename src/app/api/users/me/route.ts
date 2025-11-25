import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/user";
import { userFormDataSchema } from "@/schemas/user";
import { checkAuth, apiErrors } from "@/lib/api/utils";

/**
 * ログイン中のユーザー情報を取得するGET APIエンドポイント
 *
 * 認証されたユーザー自身のプロフィール情報を取得します。
 * セッションから取得したユーザーIDを使用してユーザー情報を取得します。
 *
 * エンドポイント: GET /api/users/me
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": "user-123",
 *   "name": "田中太郎",
 *   "email": "tanaka@example.com",
 *   "image": "https://example.com/avatar.jpg",
 *   "created_at": "2024-01-01T00:00:00Z",
 *   "updated_at": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @returns ユーザー情報を含むJSONレスポンス、またはエラーレスポンス
 */
export async function GET() {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // ユーザー情報を取得
    const user = await getUserById(authResult.userId);
    if (!user) {
      return apiErrors.notFound("ユーザー");
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error);
    return apiErrors.serverError();
  }
}

/**
 * ログイン中のユーザー情報を更新するPUT APIエンドポイント
 *
 * 認証されたユーザー自身のプロフィール情報を更新します。
 * 名前のみ変更可能で、Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: PUT /api/users/me
 *
 * リクエストボディ:
 * ```json
 * {
 *   "name": "田中花子"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": "user-123",
 *   "name": "田中花子",
 *   "email": "tanaka@example.com",
 *   "image": "https://example.com/avatar.jpg",
 *   "created_at": "2024-01-01T00:00:00Z",
 *   "updated_at": "2024-01-02T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに更新データを含む）
 * @returns 更新後のユーザー情報を含むJSONレスポンス、またはエラーレスポンス
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = userFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    // ユーザー情報を更新
    const result = await updateUser(authResult.userId, validationResult.data);

    if (!result) {
      return apiErrors.notFound("ユーザー");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("ユーザー情報更新エラー:", error);
    return apiErrors.serverError();
  }
}
