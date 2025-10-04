import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { unlockSheet } from "@/lib/brainwriting";

interface CompleteParams {
  params: Promise<{ sheetId: string }>;
}

// シートのロックを解除
export async function POST(request: NextRequest, { params }: CompleteParams) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { sheetId } = await params;
    const brainwritingSheetId = parseInt(sheetId);

    if (isNaN(brainwritingSheetId)) {
      return apiErrors.invalidId();
    }

    await unlockSheet(brainwritingSheetId, authResult.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("シート完了エラー:", error);
    return apiErrors.serverError();
  }
}
