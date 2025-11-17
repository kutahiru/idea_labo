import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  joinBrainwriting: vi.fn(),
}));

vi.mock("@/lib/appsync-events/brainwriting-events", () => ({
  publishBrainwritingEvent: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
  apiErrors: {
    invalidId: () => {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    },
  },
}));

import { joinBrainwriting } from "@/lib/brainwriting";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { checkAuth } from "@/lib/api/utils";

describe("POST /api/brainwritings/join", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/join", {
      method: "POST",
      body: JSON.stringify({
        brainwritingId: 1,
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("無効なbrainwritingIdで400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/join", {
      method: "POST",
      body: JSON.stringify({
        brainwritingId: "invalid",
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("無効なIDです");
  });

  it("brainwritingIdが未指定で400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/join", {
      method: "POST",
      body: JSON.stringify({
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("usageScopeが未指定で400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/join", {
      method: "POST",
      body: JSON.stringify({
        brainwritingId: 1,
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("usageScopeが必要です");
  });

  it("正常に参加できる", async () => {
    const mockResult = {
      data: {
        id: 1,
        brainwritingId: 1,
        userId: "user-123",
        joinedAt: "2024-01-01T00:00:00.000Z",
      },
      sheetId: 5,
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(joinBrainwriting).mockResolvedValue(mockResult as any);
    vi.mocked(publishBrainwritingEvent).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/join", {
      method: "POST",
      body: JSON.stringify({
        brainwritingId: 1,
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("参加しました");
    expect(data.data).toEqual(mockResult.data);
    expect(data.sheetId).toBe(5);
    expect(joinBrainwriting).toHaveBeenCalledWith(1, "user-123", "xpost");
    expect(publishBrainwritingEvent).toHaveBeenCalledWith(1, "USER_JOINED");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(joinBrainwriting).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/join", {
      method: "POST",
      body: JSON.stringify({
        brainwritingId: 1,
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});
