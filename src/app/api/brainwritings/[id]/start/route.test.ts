import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  createSheetsForTeam: vi.fn(),
  checkJoinStatus: vi.fn(),
}));

vi.mock("@/lib/appsync-events/brainwriting-events", () => ({
  publishBrainwritingEvent: vi.fn(),
}));

vi.mock("@/lib/appsync-events/event-types", () => ({
  BRAINWRITING_EVENT_TYPES: {
    BRAINWRITING_STARTED: "BRAINWRITING_STARTED",
  },
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    forbidden: (message: string) => {
      return NextResponse.json({ error: message }, { status: 403 });
    },
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { createSheetsForTeam, checkJoinStatus } from "@/lib/brainwriting";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { validateIdRequest } from "@/lib/api/utils";

describe("POST /api/brainwritings/[id]/start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/start", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/invalid/start", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("参加していない場合に403を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkJoinStatus).mockResolvedValue({
      isJoined: false,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/start", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(403);
    const data = await response!.json();
    expect(data.error).toBe("参加していません");
  });

  it("正常にブレインライティングを開始できる", async () => {
    const mockSheets = [
      { id: 1, brainwritingId: 1, sheetNumber: 1 },
      { id: 2, brainwritingId: 1, sheetNumber: 2 },
    ];

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkJoinStatus).mockResolvedValue({
      isJoined: true,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createSheetsForTeam).mockResolvedValue(mockSheets as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(publishBrainwritingEvent).mockResolvedValue(undefined as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/start", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockSheets);
    expect(checkJoinStatus).toHaveBeenCalledWith(1, "user-123");
    expect(createSheetsForTeam).toHaveBeenCalledWith(1);
    expect(publishBrainwritingEvent).toHaveBeenCalledWith(1, "BRAINWRITING_STARTED");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkJoinStatus).mockResolvedValue({
      isJoined: true,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    vi.mocked(createSheetsForTeam).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/start", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});
