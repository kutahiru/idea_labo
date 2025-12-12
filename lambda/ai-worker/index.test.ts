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
import { handler } from "./index";
import {
  createTestUser,
  deleteTestUser,
  createTestOsbornChecklist,
  createTestAIGeneration,
  createTestInput,
  deleteTestOsbornChecklist,
  createTestMandalart,
  createTestMandalartAIGeneration,
  createTestMandalartInput,
  deleteTestMandalart,
  getTestDb,
  closeTestDb,
  ai_generations,
  osborn_checklist_inputs,
  mandalart_inputs,
  TEST_USER_ID,
} from "./test-helpers";
import { eq } from "drizzle-orm";

// OpenAI APIキーがない場合は早期リターン
const SKIP_INTEGRATION_TESTS = !process.env.OPENAI_API_KEY;

if (SKIP_INTEGRATION_TESTS) {
  describe("ai-worker Lambda function", () => {
    it.skip("統合テストはOPENAI_API_KEYが設定されている場合のみ実行されます", () => {});
  });
} else {

  // テストで作成したチェックリストIDを保持
  const createdChecklistIds: number[] = [];
  const createdMandalartIds: number[] = [];

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

    for (const id of createdMandalartIds) {
      await deleteTestMandalart(id);
    }
    createdMandalartIds.length = 0;
  });

  afterAll(async () => {
    // 全テスト終了後にテストユーザーを削除
    await deleteTestUser();
    // DB接続をクローズ
    await closeTestDb();
  });

  describe("ai-worker Lambda function", () => {
  describe("オズボーン（後方互換性）", () => {
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

    // 結果を検証（直接Lambda呼び出しは { success: true } を返す）
    expect(result.success).toBe(true);

    // DBの状態を検証
    const db = getTestDb();

    // AI生成レコードが「完了」になっているか
    const [updatedGeneration] = await db
      .select()
      .from(ai_generations)
      .where(eq(ai_generations.id, generation.id));

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

    // 結果を検証（直接Lambda呼び出しでもエラー時は成功を返す - DBステータスで確認）
    expect(result.success).toBe(true);

    // DBの状態を検証
    const db = getTestDb();
    const [updatedGeneration] = await db
      .select()
      .from(ai_generations)
      .where(eq(ai_generations.id, generation.id));

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

    // 存在しないIDでLambda handler を実行（エラーはキャッチされてDBに保存される）
    const result = await handler(
      {
        generationId: generation.id,
        osbornChecklistId: nonExistentId,
        userId: TEST_USER_ID,
      },
      {} as Context,
      () => {}
    );

    // 直接Lambda呼び出しでは成功を返すが、DBステータスでエラーを確認
    expect(result.success).toBe(true);

    // DBの状態を検証
    const db = getTestDb();
    const [updatedGeneration] = await db
      .select()
      .from(ai_generations)
      .where(eq(ai_generations.id, generation.id));

    expect(updatedGeneration.generation_status).toBe("failed");
    expect(updatedGeneration.error_message).toContain("オズボーンのチェックリストが見つかりません");
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

    // 結果を検証（直接Lambda呼び出しは { success: true } を返す）
    expect(result.success).toBe(true);

    // DBの状態を検証
    const db = getTestDb();
    const inputs = await db
      .select()
      .from(osborn_checklist_inputs)
      .where(eq(osborn_checklist_inputs.osborn_checklist_id, checklist.id));

    expect(inputs.length).toBe(9);

    // transferの入力は既存のものがそのまま残っているか
    const transferInput = inputs.find((i: { checklist_type: string }) => i.checklist_type === "transfer");
    expect(transferInput?.content).toBe(existingContent);

    // 他の8つは新しく生成されているか
    const otherInputs = inputs.filter((i: { checklist_type: string }) => i.checklist_type !== "transfer");
    expect(otherInputs.length).toBe(8);
    for (const input of otherInputs) {
      expect(input.content).toBeTruthy();
      expect(input.content).not.toBe(existingContent);
    }
  }, 60000);
  });

  describe("オズボーン（新パラメータ形式）", () => {
    it("正常系: targetType/targetIdでAI生成が成功する", async () => {
      // テストデータ作成
      const checklist = await createTestOsbornChecklist({
        userId: TEST_USER_ID,
        themeName: "タブレット端末",
        description: "新しい使い方を考える",
      });
      createdChecklistIds.push(checklist.id);

      const generation = await createTestAIGeneration(checklist.id);

      // 新形式でLambda handler を実行
      const result = await handler(
        {
          generationId: generation.id,
          targetType: "osborn_checklist",
          targetId: checklist.id,
          userId: TEST_USER_ID,
        },
        {} as Context,
        () => {}
      );

      // 結果を検証
      expect(result.success).toBe(true);

      // DBの状態を検証
      const db = getTestDb();
      const [updatedGeneration] = await db
        .select()
        .from(ai_generations)
        .where(eq(ai_generations.id, generation.id));

      expect(updatedGeneration.generation_status).toBe("completed");
      expect(updatedGeneration.generation_result).toBeDefined();

      // 9つのアイデアが保存されているか
      const inputs = await db
        .select()
        .from(osborn_checklist_inputs)
        .where(eq(osborn_checklist_inputs.osborn_checklist_id, checklist.id));

      expect(inputs.length).toBe(9);
    }, 60000);
  });

  describe("マンダラート", () => {
    it("正常系: 適切なテーマでAI生成が成功する", async () => {
      // テストデータ作成
      const mandalart = await createTestMandalart({
        userId: TEST_USER_ID,
        themeName: "健康的な生活",
        description: "毎日を健康に過ごすための目標",
      });
      createdMandalartIds.push(mandalart.id);

      const generation = await createTestMandalartAIGeneration(mandalart.id);

      // Lambda handler を実行
      const result = await handler(
        {
          generationId: generation.id,
          targetType: "mandalart",
          targetId: mandalart.id,
          userId: TEST_USER_ID,
        },
        {} as Context,
        () => {}
      );

      // 結果を検証
      expect(result.success).toBe(true);

      // DBの状態を検証
      const db = getTestDb();
      const [updatedGeneration] = await db
        .select()
        .from(ai_generations)
        .where(eq(ai_generations.id, generation.id));

      expect(updatedGeneration.generation_status).toBe("completed");
      expect(updatedGeneration.generation_result).toBeDefined();

      // マンダラート入力が保存されているか
      // サブテーマ8個 + 各セクションのアイデア8個×8セクション = 8 + 64 = 72個
      const inputs = await db
        .select()
        .from(mandalart_inputs)
        .where(eq(mandalart_inputs.mandalart_id, mandalart.id));

      expect(inputs.length).toBe(72);

      // 各入力にコンテンツがあるか
      for (const input of inputs) {
        expect(input.content).toBeTruthy();
        expect(input.content!.length).toBeGreaterThan(0);
      }
    }, 90000); // マンダラートは生成量が多いため90秒のタイムアウト

    it("異常系: 不適切なテーマでAI生成が失敗する", async () => {
      // テストデータ作成（意味のないテーマ）
      const mandalart = await createTestMandalart({
        userId: TEST_USER_ID,
        themeName: "あああああああ",
        description: "無意味な文字列",
      });
      createdMandalartIds.push(mandalart.id);

      const generation = await createTestMandalartAIGeneration(mandalart.id);

      // Lambda handler を実行
      const result = await handler(
        {
          generationId: generation.id,
          targetType: "mandalart",
          targetId: mandalart.id,
          userId: TEST_USER_ID,
        },
        {} as Context,
        () => {}
      );

      // 結果を検証
      expect(result.success).toBe(true);

      // DBの状態を検証
      const db = getTestDb();
      const [updatedGeneration] = await db
        .select()
        .from(ai_generations)
        .where(eq(ai_generations.id, generation.id));

      expect(updatedGeneration.generation_status).toBe("failed");
      expect(updatedGeneration.error_message).toContain("テーマが適切ではありません");
    }, 90000);

    it("異常系: 存在しないマンダラートIDでエラーになる", async () => {
      const nonExistentId = 999999;

      // テストデータ作成（AI生成レコードのみ）
      const mandalart = await createTestMandalart({
        userId: TEST_USER_ID,
      });
      createdMandalartIds.push(mandalart.id);

      const generation = await createTestMandalartAIGeneration(mandalart.id);

      // 存在しないIDでLambda handler を実行
      const result = await handler(
        {
          generationId: generation.id,
          targetType: "mandalart",
          targetId: nonExistentId,
          userId: TEST_USER_ID,
        },
        {} as Context,
        () => {}
      );

      // 直接Lambda呼び出しでは成功を返すが、DBステータスでエラーを確認
      expect(result.success).toBe(true);

      // DBの状態を検証
      const db = getTestDb();
      const [updatedGeneration] = await db
        .select()
        .from(ai_generations)
        .where(eq(ai_generations.id, generation.id));

      expect(updatedGeneration.generation_status).toBe("failed");
      expect(updatedGeneration.error_message).toContain("マンダラートが見つかりません");
    }, 60000);

    it("正常系: 既に入力があるセルはスキップされる（穴埋め）", async () => {
      // テストデータ作成
      const mandalart = await createTestMandalart({
        userId: TEST_USER_ID,
        themeName: "プログラミング学習",
        description: "エンジニアとしてのスキルアップ",
      });
      createdMandalartIds.push(mandalart.id);

      // 既存のサブテーマを1つ作成（中央セクション1-1の位置0,0）
      const existingSubTheme = "基礎知識";
      await createTestMandalartInput({
        mandalartId: mandalart.id,
        sectionRowIndex: 1,
        sectionColumnIndex: 1,
        rowIndex: 0,
        columnIndex: 0,
        content: existingSubTheme,
      });

      // 既存のアイデアを1つ作成（左上セクション0-0の位置0,0）
      const existingIdea = "変数と型の理解";
      await createTestMandalartInput({
        mandalartId: mandalart.id,
        sectionRowIndex: 0,
        sectionColumnIndex: 0,
        rowIndex: 0,
        columnIndex: 0,
        content: existingIdea,
      });

      const generation = await createTestMandalartAIGeneration(mandalart.id);

      // Lambda handler を実行
      const result = await handler(
        {
          generationId: generation.id,
          targetType: "mandalart",
          targetId: mandalart.id,
          userId: TEST_USER_ID,
        },
        {} as Context,
        () => {}
      );

      // 結果を検証
      expect(result.success).toBe(true);

      // DBの状態を検証
      const db = getTestDb();
      const inputs = await db
        .select()
        .from(mandalart_inputs)
        .where(eq(mandalart_inputs.mandalart_id, mandalart.id));

      // 72個の入力が保存されているか
      expect(inputs.length).toBe(72);

      // 既存のサブテーマがそのまま残っているか
      const subThemeInput = inputs.find(
        (i) =>
          i.section_row_index === 1 &&
          i.section_column_index === 1 &&
          i.row_index === 0 &&
          i.column_index === 0
      );
      expect(subThemeInput?.content).toBe(existingSubTheme);

      // 既存のアイデアがそのまま残っているか
      const ideaInput = inputs.find(
        (i) =>
          i.section_row_index === 0 &&
          i.section_column_index === 0 &&
          i.row_index === 0 &&
          i.column_index === 0
      );
      expect(ideaInput?.content).toBe(existingIdea);

      // 他の入力は新しく生成されているか
      const otherInputs = inputs.filter(
        (i) =>
          !(i.section_row_index === 1 && i.section_column_index === 1 && i.row_index === 0 && i.column_index === 0) &&
          !(i.section_row_index === 0 && i.section_column_index === 0 && i.row_index === 0 && i.column_index === 0)
      );
      expect(otherInputs.length).toBe(70);
      for (const input of otherInputs) {
        expect(input.content).toBeTruthy();
      }
    }, 90000);
  });
});
}
