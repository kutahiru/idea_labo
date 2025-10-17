import { NextRequest, NextResponse } from "next/server";
import { getBrainwritingInputsBySheetId } from "@/lib/brainwriting";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  try {
    const { sheetId } = await params;
    const sheetIdNum = parseInt(sheetId);

    if (isNaN(sheetIdNum)) {
      return NextResponse.json({ error: "Invalid sheet ID" }, { status: 400 });
    }

    const inputs = await getBrainwritingInputsBySheetId(sheetIdNum);
    return NextResponse.json(inputs);
  } catch (error) {
    console.error("Error fetching inputs:", error);
    return NextResponse.json({ error: "Failed to fetch inputs" }, { status: 500 });
  }
}
