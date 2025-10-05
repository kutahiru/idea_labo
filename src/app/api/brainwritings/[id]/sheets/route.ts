import { NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { getBrainwritingSheetsByBrainwritingId } from "@/lib/brainwriting";

interface SheetsParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: SheetsParams) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const brainwritingId = parseInt(id);

    if (isNaN(brainwritingId)) {
      return apiErrors.invalidId();
    }

    const sheets = await getBrainwritingSheetsByBrainwritingId(brainwritingId);

    return NextResponse.json({ sheets });
  } catch (error) {
    console.error("シート情報取得エラー:", error);
    return apiErrors.serverError();
  }
}
