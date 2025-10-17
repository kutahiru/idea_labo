import { NextRequest, NextResponse } from "next/server";
import { getBrainwritingUsersByBrainwritingId } from "@/lib/brainwriting";
import { checkAuth, apiErrors } from "@/lib/api/utils";

// 参加者一覧取得
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return apiErrors.invalidId();
    }

    // 参加者一覧を取得
    const users = await getBrainwritingUsersByBrainwritingId(id);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("参加者一覧取得エラー:", error);
    return apiErrors.serverError();
  }
}
