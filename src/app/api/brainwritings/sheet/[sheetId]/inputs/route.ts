import { NextRequest, NextResponse } from "next/server";
import { getBrainwritingInputsBySheetId } from "@/lib/brainwriting";
import { checkAuth, apiErrors } from "@/lib/api/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { sheetId } = await params;
    const sheetIdNum = parseInt(sheetId);

    if (isNaN(sheetIdNum)) {
      return apiErrors.invalidId();
    }

    const inputs = await getBrainwritingInputsBySheetId(sheetIdNum);
    return NextResponse.json(inputs);
  } catch (error) {
    console.error("シート入力取得エラー:", error);
    return apiErrors.serverError();
  }
}
