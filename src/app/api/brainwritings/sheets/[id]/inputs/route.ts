import { NextRequest, NextResponse } from "next/server";
import { getBrainwritingInputsBySheetId } from "@/lib/brainwriting";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { id: sheetId } = validateResult;

    const inputs = await getBrainwritingInputsBySheetId(sheetId);
    return NextResponse.json(inputs);
  } catch (error) {
    console.error("シート入力取得エラー:", error);
    return apiErrors.serverError();
  }
}
