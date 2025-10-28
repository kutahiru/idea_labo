"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { generateInviteUrl } from "@/lib/token";
import ToggleSwitch from "@/components/shared/ToggleSwitch";

interface InviteLinkCopyProps {
  inviteToken: string;
  brainwritingId: number;
  isInviteActive: boolean;
}

export default function InviteLinkCopy({
  inviteToken,
  brainwritingId,
  isInviteActive: initialIsInviteActive,
}: InviteLinkCopyProps) {
  const inviteUrl = generateInviteUrl(inviteToken);
  const [isInviteActive, setIsInviteActive] = useState(initialIsInviteActive);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("招待リンクをコピーしました");
    } catch (error) {
      console.error("コピーエラー:", error);
      toast.error("コピーに失敗しました");
    }
  };

  const handleUpdateIsInviteActive = async (newValue: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/brainwritings/${brainwritingId}/invite-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isInviteActive: newValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "招待リンクの状態更新に失敗しました");
        return;
      }

      setIsInviteActive(newValue);
      toast.success(newValue ? "招待リンクを有効にしました" : "招待リンクを無効にしました");
    } catch (error) {
      console.error("招待リンクの状態更新エラー:", error);
      toast.error("招待リンクの状態更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto mb-6 max-w-4xl rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">招待リンク</label>
        <ToggleSwitch
          label="招待リンク"
          checked={isInviteActive}
          onChange={handleUpdateIsInviteActive}
          disabled={isUpdating}
        />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inviteUrl}
          readOnly
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
        />
        <button
          onClick={handleCopy}
          disabled={!isInviteActive}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-transform ${
            !isInviteActive ? "cursor-not-allowed bg-gray-400" : "bg-primary hover:scale-105"
          }`}
        >
          <Copy className="h-4 w-4" />
          コピー
        </button>
        <Link
          href={inviteUrl}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-transform ${
            !isInviteActive
              ? "pointer-events-none cursor-not-allowed bg-gray-400"
              : "bg-primary hover:scale-105"
          }`}
        >
          <ExternalLink className="h-4 w-4" />
          開く
        </Link>
      </div>
    </div>
  );
}
