import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  checkJoinStatus: vi.fn(),
  checkSheetLockStatus: vi.fn(),
  checkUserCount: vi.fn(),
  clearAbandonedSessions: vi.fn(),
  checkTeamJoinable: vi.fn(),
}));

vi.mock("@/utils/brainwriting", () => ({
  USAGE_SCOPE: {
    XPOST: "xpost",
    TEAM: "team",
  },
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import {
  checkJoinStatus,
  checkSheetLockStatus,
  checkUserCount,
  clearAbandonedSessions,
  checkTeamJoinable,
} from "@/lib/brainwriting";
import { validateIdRequest } from "@/lib/api/utils";

describe("GET /api/brainwritings/[id]/join-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/join-status?usageScope=xpost");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/invalid/join-status?usageScope=xpost");

    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("usageScopeが未指定の場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/join-status");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBe("usageScopeが必要です");
  });

  it("X投稿版の場合に正常に参加状況を取得できる", async () => {
    const mockJoinStatus = { isJoined: true };
    const mockLockStatus = { isLocked: false };
    const mockUserStatus = { currentUserCount: 3, maxUserCount: 6 };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(clearAbandonedSessions).mockResolvedValue(undefined as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(checkJoinStatus).mockResolvedValue(mockJoinStatus as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(checkSheetLockStatus).mockResolvedValue(mockLockStatus as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(checkUserCount).mockResolvedValue(mockUserStatus as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/join-status?usageScope=xpost");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual({
      ...mockJoinStatus,
      ...mockLockStatus,
      ...mockUserStatus,
    });
    expect(clearAbandonedSessions).toHaveBeenCalledWith(1);
    expect(checkJoinStatus).toHaveBeenCalledWith(1, "user-123");
    expect(checkSheetLockStatus).toHaveBeenCalledWith(1, "user-123");
    expect(checkUserCount).toHaveBeenCalledWith(1);
  });

  it("チーム版の場合に正常に参加状況を取得できる", async () => {
    const mockJoinStatus = { isJoined: false };
    const mockUserStatus = { currentUserCount: 2, maxUserCount: 6 };
    const mockTeamJoinable = { isJoinable: true };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(checkJoinStatus).mockResolvedValue(mockJoinStatus as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(checkUserCount).mockResolvedValue(mockUserStatus as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(checkTeamJoinable).mockResolvedValue(mockTeamJoinable as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/join-status?usageScope=team");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual({
      ...mockJoinStatus,
      ...mockUserStatus,
      ...mockTeamJoinable,
    });
    expect(checkJoinStatus).toHaveBeenCalledWith(1, "user-123");
    expect(checkUserCount).toHaveBeenCalledWith(1);
    expect(checkTeamJoinable).toHaveBeenCalledWith(1, "user-123");
    expect(clearAbandonedSessions).not.toHaveBeenCalled();
    expect(checkSheetLockStatus).not.toHaveBeenCalled();
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkJoinStatus).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/join-status?usageScope=xpost");

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});
