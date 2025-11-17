import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  unlockSheet: vi.fn(),
  rotateSheetToNextUser: vi.fn(),
  getBrainwritingSheetWithBrainwriting: vi.fn(),
}));

vi.mock("@/lib/appsync-events/brainwriting-events", () => ({
  publishBrainwritingEvent: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

vi.mock("@/utils/brainwriting", () => ({
  USAGE_SCOPE: {
    TEAM: "team",
    XPOST: "xpost",
  },
}));

import {
  unlockSheet,
  rotateSheetToNextUser,
  getBrainwritingSheetWithBrainwriting,
} from "@/lib/brainwriting";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { validateIdRequest } from "@/lib/api/utils";

describe("POST /api/brainwritings/sheets/[id]/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/1/complete", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/invalid/complete", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("シートが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingSheetWithBrainwriting).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/999/complete", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("シートが見つかりません");
  });

  it("TEAM版で正常にローテーション処理できる", async () => {
    const mockSheetData = {
      id: 1,
      brainwritingId: 1,
      sheetNumber: 1,
      currentUserId: "user-123",
      createdAt: "2024-01-01T00:00:00.000Z",
      brainwriting: {
        id: 1,
        userId: "owner-123",
        title: "テストブレインライティング",
        usageScope: "team",
      },
    };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingSheetWithBrainwriting).mockResolvedValue(mockSheetData as any);
    vi.mocked(rotateSheetToNextUser).mockResolvedValue(undefined);
    vi.mocked(publishBrainwritingEvent).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/1/complete", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(rotateSheetToNextUser).toHaveBeenCalledWith(1, "user-123");
    expect(publishBrainwritingEvent).toHaveBeenCalledWith(1, "SHEET_ROTATED");
    expect(unlockSheet).not.toHaveBeenCalled();
  });

  it("XPOST版で正常にロック解除できる", async () => {
    const mockSheetData = {
      id: 1,
      brainwritingId: 1,
      sheetNumber: 1,
      currentUserId: "user-123",
      createdAt: "2024-01-01T00:00:00.000Z",
      brainwriting: {
        id: 1,
        userId: "owner-123",
        title: "テストブレインライティング",
        usageScope: "xpost",
      },
    };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingSheetWithBrainwriting).mockResolvedValue(mockSheetData as any);
    vi.mocked(unlockSheet).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/1/complete", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(unlockSheet).toHaveBeenCalledWith(1, "user-123");
    expect(rotateSheetToNextUser).not.toHaveBeenCalled();
    expect(publishBrainwritingEvent).not.toHaveBeenCalled();
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getBrainwritingSheetWithBrainwriting).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/sheets/1/complete", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});
