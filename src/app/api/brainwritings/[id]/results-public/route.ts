import { updateBrainwritingIsResultsPublic } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const brainwritingId = parseInt(id);

    if (isNaN(brainwritingId)) {
      return apiErrors.invalidId();
    }

    const body = await request.json();
    const { isResultsPublic } = body;

    if (typeof isResultsPublic !== "boolean") {
      return apiErrors.invalidData("isResultsPublicはboolean型である必要があります");
    }

    await updateBrainwritingIsResultsPublic(brainwritingId, authResult.userId, isResultsPublic);

    return NextResponse.json({ success: true, isResultsPublic });
  } catch (error) {
    console.error("結果公開の状態更新エラー:", error);
    return apiErrors.serverError();
  }
}
