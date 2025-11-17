import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  getBrainwritingInputsBySheetId: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { getBrainwritingInputsBySheetId } from "@/lib/brainwriting";
import { validateIdRequest } from "@/lib/api/utils";

describe("GET /api/brainwritings/sheets/[id]/inputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/1/inputs", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/invalid/inputs", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("正常にシート別入力データを取得できる", async () => {
    const mockInputs = [
      {
        id: 1,
        brainwritingId: 1,
        brainwritingSheetId: 1,
        userId: "user-123",
        rowIndex: 0,
        columnIndex: 0,
        content: "入力1",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        brainwritingId: 1,
        brainwritingSheetId: 1,
        userId: "user-123",
        rowIndex: 0,
        columnIndex: 1,
        content: "入力2",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingInputsBySheetId).mockResolvedValue(mockInputs as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/1/inputs", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockInputs);
    expect(getBrainwritingInputsBySheetId).toHaveBeenCalledWith(1);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getBrainwritingInputsBySheetId).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/1/inputs", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});
