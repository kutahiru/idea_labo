import { updateOsbornChecklistIsResultsPublic } from "@/lib/osborn-checklist";
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
    const osbornChecklistId = parseInt(id);

    if (isNaN(osbornChecklistId)) {
      return apiErrors.invalidId();
    }

    const body = await request.json();
    const { isResultsPublic } = body;

    if (typeof isResultsPublic !== "boolean") {
      return apiErrors.invalidData("isResultsPublicはboolean型である必要があります");
    }

    await updateOsbornChecklistIsResultsPublic(osbornChecklistId, authResult.userId, isResultsPublic);

    return NextResponse.json({ success: true, isResultsPublic });
  } catch (error) {
    console.error("結果公開の状態更新エラー:", error);
    return apiErrors.serverError();
  }
}
