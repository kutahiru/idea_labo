import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import {
  getOsbornChecklistById,
  getAIGenerationByOsbornChecklistId,
  createAIGeneration,
} from "@/lib/osborn-checklist";
import { generateOsbornIdeas } from "@/lib/osborn-ai-worker";

// Lambda Function URLの設定確認
console.log("🔍 [診断] Lambda設定:", {
  NODE_ENV: process.env.NODE_ENV,
  LAMBDA_FUNCTION_URL: process.env.LAMBDA_FUNCTION_URL ? "✓" : "✗",
  LAMBDA_SECRET_TOKEN: process.env.LAMBDA_SECRET_TOKEN ? "✓" : "✗",
});

/**
 * オズボーンのチェックリストのAI生成を開始するPOST APIエンドポイント
 *
 * OpenAI APIを使用して、オズボーンの9つの視点からアイデアを自動生成します。
 * バックグラウンドで非同期処理を実行し、即座にレスポンスを返します。
 *
 * エンドポイント: POST /api/osborn-checklists/[id]/ai-generate
 *
 * 実行環境による動作の違い：
 * - 開発環境（development）: ローカルで直接AI生成関数を実行
 * - 本番環境（production）: AWS Lambda Function URLを呼び出し
 *
 * 処理フロー：
 * 1. オズボーンのチェックリストの存在確認
 * 2. 既存のAI生成レコード確認（処理中/完了の場合は409エラー）
 * 3. AI生成レコードをDBに作成（status: pending）
 * 4. バックグラウンドでAI生成を開始（非同期）
 * 5. 即座にレスポンスを返す
 *
 * レスポンス例（成功時）:
 * ```json
 * {
 *   "generationId": 789,
 *   "status": "pending",
 *   "message": "AI生成を開始しました"
 * }
 * ```
 *
 * レスポンス例（既に処理中の場合）:
 * ```json
 * {
 *   "error": "AI生成は既に実行中です"
 * }
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: オズボーンのチェックリストID）
 * @returns AI生成開始結果を含むJSONレスポンス、またはエラーレスポンス（409: 処理中/完了済み）
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // OpenAIモデルの環境変数チェック
    if (!process.env.OPENAI_MODEL) {
      throw new Error("OPENAI_MODEL environment variable is not set");
    }

    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: osbornChecklistId } = validateResult;

    // オズボーンのチェックリストを取得
    const osbornChecklist = await getOsbornChecklistById(osbornChecklistId, userId);
    if (!osbornChecklist) {
      return apiErrors.notFound("オズボーンのチェックリスト");
    }

    // 既に処理中または完了している場合はエラー
    const existingGeneration = await getAIGenerationByOsbornChecklistId(osbornChecklistId);

    if (existingGeneration) {
      if (
        existingGeneration.generation_status === "processing" ||
        existingGeneration.generation_status === "pending"
      ) {
        return NextResponse.json({ error: "AI生成は既に実行中です" }, { status: 409 });
      }
      if (existingGeneration.generation_status === "completed") {
        return NextResponse.json({ error: "AI生成は既に完了しています" }, { status: 409 });
      }
    }

    // AI生成レコードをDBに作成（status: pending）
    const aiGeneration = await createAIGeneration(osbornChecklistId);

    // 開発環境ではローカルで実行、本番環境ではLambda Function URLを呼び出し
    if (process.env.NODE_ENV === "development") {
      // ローカル環境での直接実行（非同期）
      generateOsbornIdeas({
        generationId: aiGeneration.id,
        osbornChecklistId,
        userId,
      }).catch(error => {
        console.error("ローカルAI生成エラー:", error);
      });
    } else {
      // 本番環境でのLambda Function URL呼び出し
      const lambdaFunctionUrl = process.env.LAMBDA_FUNCTION_URL;
      const secretToken = process.env.LAMBDA_SECRET_TOKEN;

      if (!lambdaFunctionUrl) {
        console.error("❌ LAMBDA_FUNCTION_URL環境変数が設定されていません");
        // 環境変数未設定でもユーザーにはエラーを返さない
      } else if (!secretToken) {
        console.error("❌ LAMBDA_SECRET_TOKEN環境変数が設定されていません");
      } else {
        console.log("🔍 Lambda Function URL呼び出し開始:", {
          url: lambdaFunctionUrl,
          generationId: aiGeneration.id,
          osbornChecklistId,
        });

        // Lambda Function URLを非同期で呼び出し（レスポンスを待たない）
        fetch(lambdaFunctionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-secret": secretToken,
          },
          body: JSON.stringify({
            generationId: aiGeneration.id,
            osbornChecklistId,
            userId,
          }),
        }).then(response => {
          if (!response.ok) {
            response.text().then(errorText => {
              console.error("❌ Lambda Function URL呼び出しエラー:", {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
              });
            });
          } else {
            console.log("✅ Lambda Function URL呼び出し成功");
          }
        }).catch(error => {
          console.error("❌ Lambda Function URL呼び出し例外:", {
            error,
            errorName: error instanceof Error ? error.name : "Unknown",
            errorMessage: error instanceof Error ? error.message : String(error),
          });
        });
      }
    }

    // 即座にレスポンスを返す
    return NextResponse.json({
      generationId: aiGeneration.id,
      status: "pending",
      message: "AI生成を開始しました",
    });
  } catch (error) {
    console.error("AI生成レコード作成エラー:", error);
    return apiErrors.serverError();
  }
}
