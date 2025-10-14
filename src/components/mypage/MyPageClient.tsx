"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { UserFormData } from "@/schemas/user";
import { AnimatePresence } from "framer-motion";
import UserEditModal from "./UserEditModal";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Pencil } from "lucide-react";

interface MyPageClientProps {
  initialData: UserProfile;
}

export default function MyPageClient({ initialData }: MyPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(initialData);
  const router = useRouter();
  const { update } = useSession();

  // 編集モーダルを開く
  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // ユーザー情報更新
  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新に失敗しました");
      }

      const result = await response.json();
      
      // セッションを更新
      await update({ name: result.name });
      
      setUser(result);
      toast.success("ユーザー情報を更新しました");
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error("更新エラー:", error);
      toast.error(error instanceof Error ? error.message : "更新に失敗しました");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* ユーザー情報カード */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-primary px-8 py-6">
          <h2 className="text-2xl font-semibold text-white text-center">
            プロフィール
          </h2>
        </div>

        {/* 内容 */}
        <div className="p-8 space-y-6">
          {/* 名前 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              名前
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
              {user.name}
            </div>
          </div>

          {/* 編集ボタン */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleOpenEditModal}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 inline-flex items-center"
            >
              <Pencil className="mr-2 h-5 w-5" />
              編集
            </button>
          </div>
        </div>
      </div>

      {/* モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <UserEditModal
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            initialData={{ name: user.name }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
