import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  getBrainwritingInputsByBrainwritingId: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { getBrainwritingInputsByBrainwritingId } from "@/lib/brainwriting";
import { validateIdRequest } from "@/lib/api/utils";

describe("GET /api/brainwritings/[id]/inputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new Request("http://localhost:3000/api/brainwritings/1/inputs");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new Request("http://localhost:3000/api/brainwritings/invalid/inputs");

    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("正常に入力データを取得できる", async () => {
    const mockInputs = [
      {
        id: 1,
        sheetId: 1,
        brainwritingId: 1,
        roundNumber: 1,
        content: "テスト入力1",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        sheetId: 2,
        brainwritingId: 1,
        roundNumber: 1,
        content: "テスト入力2",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingInputsByBrainwritingId).mockResolvedValue(mockInputs as any);

    const request = new Request("http://localhost:3000/api/brainwritings/1/inputs");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.inputs).toEqual(mockInputs);
    expect(getBrainwritingInputsByBrainwritingId).toHaveBeenCalledWith(1);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getBrainwritingInputsByBrainwritingId).mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost:3000/api/brainwritings/1/inputs");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});
