import { updateBrainwritingIsInviteActive } from "@/lib/brainwriting";
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
    const { isInviteActive } = body;

    if (typeof isInviteActive !== "boolean") {
      return apiErrors.invalidData("isInviteActiveはboolean型である必要があります");
    }

    await updateBrainwritingIsInviteActive(brainwritingId, authResult.userId, isInviteActive);

    return NextResponse.json({ success: true, isInviteActive });
  } catch (error) {
    console.error("招待URLの状態更新エラー:", error);
    return apiErrors.serverError();
  }
}
