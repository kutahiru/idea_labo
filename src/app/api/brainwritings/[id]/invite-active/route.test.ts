import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  updateBrainwritingIsInviteActive: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    invalidData: (message: string) => {
      return NextResponse.json({ error: message }, { status: 400 });
    },
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { updateBrainwritingIsInviteActive } from "@/lib/brainwriting";
import { validateIdRequest } from "@/lib/api/utils";

describe("PATCH /api/brainwritings/[id]/invite-active", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/invite-active", {
      method: "PATCH",
      body: JSON.stringify({ isInviteActive: true }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/invalid/invite-active", {
      method: "PATCH",
      body: JSON.stringify({ isInviteActive: true }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("isInviteActiveがboolean型でない場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/invite-active", {
      method: "PATCH",
      body: JSON.stringify({ isInviteActive: "true" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBe("isInviteActiveはboolean型である必要があります");
  });

  it("正常に招待URL状態を更新できる（true）", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateBrainwritingIsInviteActive).mockResolvedValue(undefined as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/invite-active", {
      method: "PATCH",
      body: JSON.stringify({ isInviteActive: true }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.success).toBe(true);
    expect(data.isInviteActive).toBe(true);
    expect(updateBrainwritingIsInviteActive).toHaveBeenCalledWith(1, "user-123", true);
  });

  it("正常に招待URL状態を更新できる（false）", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateBrainwritingIsInviteActive).mockResolvedValue(undefined as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/invite-active", {
      method: "PATCH",
      body: JSON.stringify({ isInviteActive: false }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.success).toBe(true);
    expect(data.isInviteActive).toBe(false);
    expect(updateBrainwritingIsInviteActive).toHaveBeenCalledWith(1, "user-123", false);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(updateBrainwritingIsInviteActive).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1/invite-active", {
      method: "PATCH",
      body: JSON.stringify({ isInviteActive: true }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});
