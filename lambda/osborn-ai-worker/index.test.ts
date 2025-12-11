/**
 * Lambda関数の統合テスト
 *
 * テストの流れ：
 * 1. テストデータをDBに作成
 * 2. Lambda handler を実行
 * 3. 結果を検証
 * 4. テストデータを削除（afterEach）
 *
 * 注意: このテストはOpenAI APIキーが必要です。
 * 環境変数 OPENAI_API_KEY が設定されていない場合はスキップされます。
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import type { Context } from "aws-lambda";

// OpenAI APIキーがない場合は早期リターン
const SKIP_INTEGRATION_TESTS = !process.env.OPENAI_API_KEY;

if (SKIP_INTEGRATION_TESTS) {
  describe("osborn-ai-worker Lambda function", () => {
    it.skip("統合テストはOPENAI_API_KEYが設定されている場合のみ実行されます", () => {});
  });
} else {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { handler } = require("./index");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    createTestUser,
    deleteTestUser,
    createTestOsbornChecklist,
    createTestAIGeneration,
    createTestInput,
    deleteTestOsbornChecklist,
    getTestDb,
    closeTestDb,
    osborn_ai_generations,
    osborn_checklist_inputs,
    TEST_USER_ID,
  } = require("./test-helpers");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { eq } = require("drizzle-orm");

  // テストで作成したチェックリストIDを保持
  const createdChecklistIds: number[] = [];

  beforeAll(async () => {
    // 全テスト開始前にテストユーザーを作成
    await createTestUser();
  });

  afterEach(async () => {
    // 各テスト後にテストデータをクリーンアップ
    for (const id of createdChecklistIds) {
      await deleteTestOsbornChecklist(id);
    }
    createdChecklistIds.length = 0;
  });

  afterAll(async () => {
    // 全テスト終了後にテストユーザーを削除
    await deleteTestUser();
    // DB接続をクローズ
    await closeTestDb();
  });

  describe("osborn-ai-worker Lambda function", () => {
  it("正常系: 適切なテーマでAI生成が成功する", async () => {
    // テストデータ作成
    const checklist = await createTestOsbornChecklist({
      userId: TEST_USER_ID,
      themeName: "スマートフォン",
      description: "新しい活用方法を考える",
    });
    createdChecklistIds.push(checklist.id);

    const generation = await createTestAIGeneration(checklist.id);

    // Lambda handler を実行
    const result = await handler(
      {
        generationId: generation.id,
        osbornChecklistId: checklist.id,
        userId: TEST_USER_ID,
      },
      {} as Context,
      () => {}
    );

    // 結果を検証
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.ideas).toBeDefined();

    // DBの状態を検証
    const db = getTestDb();

    // AI生成レコードが「完了」になっているか
    const [updatedGeneration] = await db
      .select()
      .from(osborn_ai_generations)
      .where(eq(osborn_ai_generations.id, generation.id));

    expect(updatedGeneration.generation_status).toBe("completed");
    expect(updatedGeneration.generation_result).toBeDefined();

    // 9つのアイデアが保存されているか
    const inputs = await db
      .select()
      .from(osborn_checklist_inputs)
      .where(eq(osborn_checklist_inputs.osborn_checklist_id, checklist.id));

    expect(inputs.length).toBe(9);

    // 各アイデアにコンテンツがあるか
    for (const input of inputs) {
      expect(input.content).toBeTruthy();
      expect(input.content!.length).toBeGreaterThan(0);
    }
  }, 60000); // OpenAI API呼び出しがあるため60秒のタイムアウト

  it("異常系: 不適切なテーマでAI生成が失敗する", async () => {
    // テストデータ作成（意味のないテーマ）
    const checklist = await createTestOsbornChecklist({
      userId: TEST_USER_ID,
      themeName: "あああああああ",
      description: "無意味な文字列",
    });
    createdChecklistIds.push(checklist.id);

    const generation = await createTestAIGeneration(checklist.id);

    // Lambda handler を実行
    const result = await handler(
      {
        generationId: generation.id,
        osbornChecklistId: checklist.id,
        userId: TEST_USER_ID,
      },
      {} as Context,
      () => {}
    );

    // 結果を検証（400エラー）
    expect(result.statusCode).toBe(400);

    // DBの状態を検証
    const db = getTestDb();
    const [updatedGeneration] = await db
      .select()
      .from(osborn_ai_generations)
      .where(eq(osborn_ai_generations.id, generation.id));

    expect(updatedGeneration.generation_status).toBe("failed");
    expect(updatedGeneration.error_message).toContain("テーマが適切ではありません");
  }, 60000);

  it("異常系: 存在しないosbornChecklistIdでエラーになる", async () => {
    const nonExistentId = 999999;

    // テストデータ作成（AI生成レコードのみ）
    const checklist = await createTestOsbornChecklist({
      userId: TEST_USER_ID,
    });
    createdChecklistIds.push(checklist.id);

    const generation = await createTestAIGeneration(checklist.id);

    // 存在しないIDでLambda handler を実行
    await expect(
      handler(
        {
          generationId: generation.id,
          osbornChecklistId: nonExistentId,
          userId: TEST_USER_ID,
        },
        {} as Context,
        () => {}
      )
    ).rejects.toThrow("オズボーンのチェックリストが見つかりません");
  }, 60000);

  it("正常系: 既に入力があるセルはスキップされる", async () => {
    // テストデータ作成
    const checklist = await createTestOsbornChecklist({
      userId: TEST_USER_ID,
      themeName: "ノートパソコン",
    });
    createdChecklistIds.push(checklist.id);

    // 既存の入力を作成（transferのみ）
    const existingContent = "既存のアイデア：持ち運びしやすいバッグに入れる";
    await createTestInput({
      osbornChecklistId: checklist.id,
      checklistType: "transfer",
      content: existingContent,
    });

    const generation = await createTestAIGeneration(checklist.id);

    // Lambda handler を実行
    const result = await handler(
      {
        generationId: generation.id,
        osbornChecklistId: checklist.id,
        userId: TEST_USER_ID,
      },
      {} as Context,
      () => {}
    );

    // 結果を検証
    expect(result.statusCode).toBe(200);

    // DBの状態を検証
    const db = getTestDb();
    const inputs = await db
      .select()
      .from(osborn_checklist_inputs)
      .where(eq(osborn_checklist_inputs.osborn_checklist_id, checklist.id));

    expect(inputs.length).toBe(9);

    // transferの入力は既存のものがそのまま残っているか
    const transferInput = inputs.find((i) => i.checklist_type === "transfer");
    expect(transferInput?.content).toBe(existingContent);

    // 他の8つは新しく生成されているか
    const otherInputs = inputs.filter((i) => i.checklist_type !== "transfer");
    expect(otherInputs.length).toBe(8);
    for (const input of otherInputs) {
      expect(input.content).toBeTruthy();
      expect(input.content).not.toBe(existingContent);
    }
  }, 60000);
});
}
