import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  getBrainwritingSheetsByBrainwritingId: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { getBrainwritingSheetsByBrainwritingId } from "@/lib/brainwriting";
import { validateIdRequest } from "@/lib/api/utils";

describe("GET /api/brainwritings/[id]/sheets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new Request("http://localhost:3000/api/brainwritings/1/sheets");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new Request("http://localhost:3000/api/brainwritings/invalid/sheets");

    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("正常にシート一覧を取得できる", async () => {
    const mockSheets = [
      {
        id: 1,
        brainwritingId: 1,
        sheetNumber: 1,
        currentUserId: "user-123",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        brainwritingId: 1,
        sheetNumber: 2,
        currentUserId: "user-456",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingSheetsByBrainwritingId).mockResolvedValue(mockSheets as any);

    const request = new Request("http://localhost:3000/api/brainwritings/1/sheets");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.sheets).toEqual(mockSheets);
    expect(getBrainwritingSheetsByBrainwritingId).toHaveBeenCalledWith(1);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getBrainwritingSheetsByBrainwritingId).mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost:3000/api/brainwritings/1/sheets");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});
