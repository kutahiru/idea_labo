import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { upsertMandalartInput } from "@/lib/mandalart";

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const {
      mandalartId,
      sectionRowIndex,
      sectionColumnIndex,
      rowIndex,
      columnIndex,
      content,
    } = body;

    if (
      typeof mandalartId !== "number" ||
      typeof sectionRowIndex !== "number" ||
      typeof sectionColumnIndex !== "number" ||
      typeof rowIndex !== "number" ||
      typeof columnIndex !== "number" ||
      typeof content !== "string"
    ) {
      return apiErrors.invalidData();
    }

    const result = await upsertMandalartInput(
      mandalartId,
      sectionRowIndex,
      sectionColumnIndex,
      rowIndex,
      columnIndex,
      content
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("マンダラート入力保存エラー:", error);
    return apiErrors.serverError();
  }
}
