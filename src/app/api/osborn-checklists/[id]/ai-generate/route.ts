import { NextRequest, NextResponse } from "next/server";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import {
  getOsbornChecklistById,
  getAIGenerationByOsbornChecklistId,
  createAIGeneration,
} from "@/lib/osborn-checklist";
import { generateOsbornIdeas } from "@/lib/osborn-ai-worker";

// Lambda クライアントの初期化（本番環境のみ）
const lambdaClient = process.env.NODE_ENV !== "development"
  ? new LambdaClient({
      region: process.env.AWS_REGION || "ap-northeast-1",
    })
  : null;

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // OpenAIモデルの環境変数チェック
    if (!process.env.OPENAI_MODEL) {
      throw new Error("OPENAI_MODEL environment variable is not set");
    }

    // 認証チェックとIDバリデーション
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

    // 開発環境ではローカルで実行、本番環境ではLambdaを起動
    if (process.env.NODE_ENV === "development") {
      // ローカル環境での直接実行（非同期）
      // バックグラウンドで実行（await しない）
      generateOsbornIdeas({
        generationId: aiGeneration.id,
        osbornChecklistId,
        userId,
      }).catch(error => {
        console.error("ローカルAI生成エラー:", error);
      });
    } else {
      // 本番環境でのLambda起動
      const lambdaFunctionName = process.env.LAMBDA_FUNCTION_NAME || "osborn-ai-worker";

      try {
        const command = new InvokeCommand({
          FunctionName: lambdaFunctionName,
          InvocationType: "Event", // 非同期実行
          Payload: JSON.stringify({
            generationId: aiGeneration.id,
            osbornChecklistId,
            userId,
          }),
        });

        await lambdaClient!.send(command);
      } catch (error) {
        console.error("Lambda起動エラー:", error);
        // Lambda起動に失敗してもユーザーにはエラーを返さず、ステータスはpendingのまま
        // 後でリトライ可能にするため
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
