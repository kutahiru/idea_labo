"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { UserFormData } from "@/schemas/user";
import { userFormDataSchema } from "@/schemas/user";
import { ModalActions } from "@/components/shared/ModalActions";

interface UserEditModalProps {
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData: UserFormData;
}

export default function UserEditModal({ onClose, onSubmit, initialData }: UserEditModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData.name || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 入力値変更
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const result = userFormDataSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof UserFormData, string>> = {};

      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof UserFormData;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });

      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("フォーム送信エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 共通スタイルクラス
  const inputClasses =
    "w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 outline-none text-gray-800 font-noto-sans-jp focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all duration-200";
  const labelClasses = "block text-gray-700 text-sm font-semibold font-noto-sans-jp mb-2";
  const errorClasses = "mt-1 text-sm text-red-500";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* オーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* モーダル本体 */}
      <motion.div
        className="relative max-h-[90vh] w-[600px] overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ヘッダー */}
        <div className="bg-primary w-full rounded-t-2xl px-8 py-6">
          <div className="flex items-center justify-center">
            <h1 className="font-noto-sans-jp text-3xl font-semibold text-white">ユーザー名編集</h1>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          {/* 名前 */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              名前 *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              className={inputClasses}
              placeholder="名前を入力"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.name && <p className={errorClasses}>{errors.name}</p>}
          </div>

          {/* ボタン */}
          <ModalActions onClose={onClose} isSubmitting={isSubmitting} mode="edit" />
        </form>
      </motion.div>
    </motion.div>
  );
}
