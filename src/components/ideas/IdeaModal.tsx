"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { IdeaFormData } from "@/schemas/idea";
import { ideaFormDataSchema } from "@/schemas/idea";
import { ModalActions } from "@/components/shared/ModalActions";

interface IdeaModalProps {
  onClose: () => void;
  onSubmit: (data: IdeaFormData) => Promise<void>;
  initialData?: IdeaFormData;
  mode: "create" | "edit";
}

export default function IdeaModal({ onClose, onSubmit, initialData, mode }: IdeaModalProps) {
  const [formData, setFormData] = useState<IdeaFormData>({
    name: initialData?.name || "",
    description: initialData?.description || null,
    priority: initialData?.priority || "medium",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IdeaFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 入力値変更
  const handleInputChange = (field: keyof IdeaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const result = ideaFormDataSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof IdeaFormData, string>> = {};

      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof IdeaFormData;
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
            <h1 className="font-noto-sans-jp text-3xl font-semibold text-white">
              {mode === "create" ? "新規作成" : "編集"}
            </h1>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          {/* アイデア名 */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              アイデア名 *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              className={inputClasses}
              placeholder="アイデア名を入力"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && <p className={errorClasses}>{errors.name}</p>}
          </div>

          {/* 重要度 */}
          <div>
            <label htmlFor="priority" className={labelClasses}>
              重要度 *
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={e => handleInputChange("priority", e.target.value)}
              className={inputClasses}
              disabled={isSubmitting}
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            {errors.priority && <p className={errorClasses}>{errors.priority}</p>}
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className={labelClasses}>
              説明
            </label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={e => handleInputChange("description", e.target.value)}
              rows={6}
              className="font-noto-sans-jp focus:border-primary focus:ring-primary/10 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 transition-all duration-200 outline-none focus:bg-white focus:ring-2"
              placeholder="説明（任意）"
              maxLength={500}
              disabled={isSubmitting}
            />
            {errors.description && <p className={errorClasses}>{errors.description}</p>}
          </div>

          {/* ボタン */}
          <ModalActions onClose={onClose} isSubmitting={isSubmitting} mode={mode} />
        </form>
      </motion.div>
    </motion.div>
  );
}
