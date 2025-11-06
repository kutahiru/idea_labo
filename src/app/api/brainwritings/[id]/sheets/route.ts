import { NextResponse } from "next/server";
import { validateIdRequest, apiErrors } from "@/lib/api/utils";
import { getBrainwritingSheetsByBrainwritingId } from "@/lib/brainwriting";

interface SheetsParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: SheetsParams) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { id: brainwritingId } = validateResult;

    const sheets = await getBrainwritingSheetsByBrainwritingId(brainwritingId);

    return NextResponse.json({ sheets });
  } catch (error) {
    console.error("シート情報取得エラー:", error);
    return apiErrors.serverError();
  }
}
