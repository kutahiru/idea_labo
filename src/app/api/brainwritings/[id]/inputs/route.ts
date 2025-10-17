import { NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { getBrainwritingInputsByBrainwritingId } from "@/lib/brainwriting";

interface InputsParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: InputsParams) {
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

    const inputs = await getBrainwritingInputsByBrainwritingId(brainwritingId);

    return NextResponse.json({ inputs });
  } catch (error) {
    console.error("入力データ取得エラー:", error);
    return apiErrors.serverError();
  }
}
