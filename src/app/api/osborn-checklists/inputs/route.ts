import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/api/utils";
import { upsertOsbornChecklistInput } from "@/lib/osborn-checklist";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";

/**
 * オズボーンのチェックリストの入力データを保存するPOST APIエンドポイント
 *
 * ユーザーがオズボーンの9つの視点に対して入力したアイデアを保存します。
 * 既に入力データが存在する場合は更新（upsert）します。
 *
 * エンドポイント: POST /api/osborn-checklists/inputs
 *
 * オズボーンの9つのチェックリストタイプ：
 * - substitute（代用したら）
 * - combine（組み合わせたら）
 * - adapt（応用したら）
 * - modify（変更したら）
 * - putToOtherUses（他の使い道）
 * - eliminate（削除したら）
 * - rearrange（並び替えたら）
 * - reverse（逆にしたら）
 * - magnify（拡大したら）
 *
 * リクエストボディ:
 * ```json
 * {
 *   "osbornChecklistId": 123,
 *   "checklistType": "substitute",
 *   "content": "プラスチックを木材に代用"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 456,
 *   "osborn_checklist_id": 123,
 *   "checklist_type": "substitute",
 *   "content": "プラスチックを木材に代用",
 *   "created_at": "2024-01-01T00:00:00Z",
 *   "updated_at": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに入力データを含む）
 * @returns 保存された入力データを含むJSONレスポンス、またはエラーレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得
    const body = await request.json();
    const { osbornChecklistId, checklistType, content } = body;

    // バリデーション
    if (!osbornChecklistId || typeof osbornChecklistId !== "number") {
      return NextResponse.json({ error: "オズボーンのチェックリストIDが無効です" }, { status: 400 });
    }

    if (!checklistType || !Object.values(OSBORN_CHECKLIST_TYPES).includes(checklistType)) {
      return NextResponse.json({ error: "チェックリストタイプが無効です" }, { status: 400 });
    }

    // 入力データを保存
    const result = await upsertOsbornChecklistInput(
      osbornChecklistId,
      authResult.userId,
      checklistType,
      content || ""
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("オズボーンのチェックリスト入力保存エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
