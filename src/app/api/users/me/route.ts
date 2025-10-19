import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/user";
import { userFormDataSchema } from "@/schemas/user";
import { checkAuth, apiErrors } from "@/lib/api/utils";

/** ユーザー情報取得 */
export async function GET() {
  try {
    // 認証チェック
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

/** ユーザー情報更新 */
export async function PUT(request: NextRequest) {
  try {
    // 認証チェック
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
