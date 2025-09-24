import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { getBrainwritingsByUserId } from "@/lib/brainwriting";

// 一覧取得
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const brainwritingList = await getBrainwritingsByUserId(session.user.id);

    return NextResponse.json(brainwritingList);
  } catch (error) {
    console.error("ブレインライティング一覧取得エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
