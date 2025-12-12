/**
 * Lambda関数のローカルテストスクリプト
 * 
 * 使い方:
 * 1. テスト用のオズボーンのチェックリストをDBに作成
 * 2. このスクリプトの EVENT オブジェクトに実際のIDを設定
 * 3. npm run test:local を実行
 */

import * as dotenv from "dotenv";
import * as path from "path";
import type { Context, Callback } from "aws-lambda";
import { handler } from "./index";

// .env.local を読み込み
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Lambda関数で必要な環境変数をマッピング
process.env.APPSYNC_EVENTS_URL = process.env.NEXT_PUBLIC_APPSYNC_EVENTS_URL;
process.env.APPSYNC_API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

// テストイベントデータ
// TODO: 実際のDBレコードのIDに変更してください
const EVENT = {
  generationId: 1, // ai_generations テーブルのID
  osbornChecklistId: 1, // osborn_checklists テーブルのID
  userId: "test-user-id", // 実際のユーザーID
};

async function runTest() {
  console.log("=== Lambda関数ローカルテスト開始 ===");
  console.log("テストイベント:", JSON.stringify(EVENT, null, 2));
  console.log("\n環境変数:");
  console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "✓" : "✗");
  console.log("- OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✓" : "✗");
  console.log("- OPENAI_MODEL:", process.env.OPENAI_MODEL);
  console.log("- APPSYNC_EVENTS_URL:", process.env.APPSYNC_EVENTS_URL ? "✓" : "✗");
  console.log("- APPSYNC_API_KEY:", process.env.APPSYNC_API_KEY ? "✓" : "✗");
  console.log("");

  try {
    const startTime = Date.now();

    // Lambda handler を呼び出し
    const mockContext: Context = {
      callbackWaitsForEmptyEventLoop: true,
      functionName: "osborn-ai-worker-local",
      functionVersion: "$LATEST",
      invokedFunctionArn: "arn:aws:lambda:local:000000000000:function:osborn-ai-worker-local",
      memoryLimitInMB: "512",
      awsRequestId: "local-test-request-id",
      logGroupName: "/aws/lambda/osborn-ai-worker-local",
      logStreamName: "local/test",
      getRemainingTimeInMillis: () => 180000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    };
    const mockCallback: Callback = () => {};

    const result = await handler(EVENT, mockContext, mockCallback);

    const duration = Date.now() - startTime;
    
    console.log("\n=== テスト成功 ===");
    console.log("実行時間:", duration, "ms");
    console.log("結果:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n=== テスト失敗 ===");
    console.error("エラー:", error);
    process.exit(1);
  }
}

runTest();
