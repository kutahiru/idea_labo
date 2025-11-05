import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";

export async function checkAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }) };
  }
  return { userId: session.user.id };
}

export const apiErrors = {
  notFound: (frameworkName: string) =>
    NextResponse.json({ error: `${frameworkName}が見つかりません` }, { status: 404 }),
  serverError: () => NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 }),
  invalidId: () => NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
  invalidData: (details?: unknown) =>
    NextResponse.json(
      details ? { error: "入力データが無効です", details } : { error: "入力データが無効です" },
      { status: 400 }
    ),
  forbidden: (message?: string) =>
    NextResponse.json({ error: message || "アクセス権限がありません" }, { status: 403 }),
};

/**
 * レスポンスのJSONを安全にパース（エラー時はデフォルト値を返す）
 * エラーレスポンスの処理に使用
 */
export async function parseJsonSafe<T>(response: Response, defaultValue: T): Promise<T> {
  return response.json().catch(() => defaultValue);
}

/**
 * レスポンスのJSONを安全にパース（エラー時は例外をスロー）
 * 成功レスポンスの処理に使用
 */
export async function parseJson<T>(
  response: Response,
  errorMessage: string = "データの読み込みに失敗しました"
): Promise<T> {
  try {
    return await response.json();
  } catch (error) {
    console.error("JSONパースエラー:", error);
    throw new Error(errorMessage);
  }
}
