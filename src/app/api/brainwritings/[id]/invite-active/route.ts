import { updateBrainwritingIsInviteActive } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingId } = validateResult;

    const body = await request.json();
    const { isInviteActive } = body;

    if (typeof isInviteActive !== "boolean") {
      return apiErrors.invalidData("isInviteActiveはboolean型である必要があります");
    }

    await updateBrainwritingIsInviteActive(brainwritingId, userId, isInviteActive);

    return NextResponse.json({ success: true, isInviteActive });
  } catch (error) {
    console.error("招待URLの状態更新エラー:", error);
    return apiErrors.serverError();
  }
}
