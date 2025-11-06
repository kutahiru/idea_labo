import { NextResponse } from "next/server";
import { validateIdRequest, apiErrors } from "@/lib/api/utils";
import { getBrainwritingInputsByBrainwritingId } from "@/lib/brainwriting";

interface InputsParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: InputsParams) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { id: brainwritingId } = validateResult;

    const inputs = await getBrainwritingInputsByBrainwritingId(brainwritingId);

    return NextResponse.json({ inputs });
  } catch (error) {
    console.error("入力データ取得エラー:", error);
    return apiErrors.serverError();
  }
}
