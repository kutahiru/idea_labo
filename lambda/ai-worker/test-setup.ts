/**
 * Vitestのセットアップファイル
 * テスト実行前に環境変数を読み込む
 */

import * as dotenv from "dotenv";
import * as path from "path";

// .env.local を読み込み
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Lambda関数で必要な環境変数をマッピング
process.env.APPSYNC_EVENTS_URL = process.env.NEXT_PUBLIC_APPSYNC_EVENTS_URL;
process.env.APPSYNC_API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

// 環境変数のチェック
const requiredEnvVars = [
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "APPSYNC_EVENTS_URL",
  "APPSYNC_API_KEY",
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.warn("⚠️ 統合テスト用の環境変数が設定されていません:", missingEnvVars.join(", "));
  console.warn("   統合テストはスキップされます");
} else {
  console.log("✅ テスト環境変数の読み込み完了");
}
