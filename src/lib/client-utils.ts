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
