"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/layout/Icons";
import toast from "react-hot-toast";
import { generateInviteUrl } from "@/lib/invite-url";

interface InviteLinkCopyProps {
  inviteToken: string;
}

export default function InviteLinkCopy({ inviteToken }: InviteLinkCopyProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = generateInviteUrl(inviteToken);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("招待リンクをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("コピーエラー:", error);
      toast.error("コピーに失敗しました");
    }
  };

  return (
    <div className="mx-auto mb-6 max-w-4xl rounded-lg border border-gray-200 bg-gray-50 p-4">
      <label className="mb-2 block text-sm font-medium text-gray-700">招待リンク</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inviteUrl}
          readOnly
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
        />
        <button
          onClick={handleCopy}
          className="bg-primary flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              コピー済み
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              コピー
            </>
          )}
        </button>
      </div>
    </div>
  );
}
