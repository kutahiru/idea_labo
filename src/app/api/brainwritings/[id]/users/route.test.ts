import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  getBrainwritingUsersByBrainwritingId: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
  apiErrors: {
    invalidId: () => {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    },
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { getBrainwritingUsersByBrainwritingId } from "@/lib/brainwriting";
import { checkAuth } from "@/lib/api/utils";

describe("GET /api/brainwritings/[id]/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/users", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/invalid/users", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("正常に参加者一覧を取得できる", async () => {
    const mockUsers = [
      {
        brainwritingId: 1,
        userId: "user-123",
        joinedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        brainwritingId: 1,
        userId: "user-456",
        joinedAt: "2024-01-02T00:00:00.000Z",
      },
    ];

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingUsersByBrainwritingId).mockResolvedValue(mockUsers as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/users", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.users).toEqual(mockUsers);
    expect(getBrainwritingUsersByBrainwritingId).toHaveBeenCalledWith(1);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(getBrainwritingUsersByBrainwritingId).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/users", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});
