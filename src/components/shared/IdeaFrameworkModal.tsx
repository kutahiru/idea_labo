"use client";

import { useState, ReactNode } from "react";
import { z } from "zod";
import { BaseIdeaFormData } from "@/schemas/idea-framework";
import { motion } from "framer-motion";

interface IdeaFrameworkModalChildrenProps<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
}

interface IdeaFrameworkModalProps<T extends BaseIdeaFormData> {
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  initialData?: T;
  mode: "create" | "edit";
  schema: z.ZodSchema<T>;
  children?: ReactNode | ((props: IdeaFrameworkModalChildrenProps<T>) => ReactNode); // フレームワーク固有のフィールド
}

export default function IdeaFrameworkModal<T extends BaseIdeaFormData>({
  onClose,
  onSubmit,
  initialData,
  mode,
  schema,
  children,
}: IdeaFrameworkModalProps<T>) {
  const [formData, setFormData] = useState<T>(initialData as T);

  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // バリデーション
  const validateForm = (): boolean => {
    const result = schema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof T, string>> = {};

      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof T;
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

  // フォーム送信
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

  // 入力値変更
  const handleInputChange = (field: keyof T, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
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
          {/* タイトル */}
          <div>
            <label htmlFor="title" className={labelClasses}>
              タイトル *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={e => handleInputChange("title" as keyof T, e.target.value)}
              className={inputClasses}
              placeholder="タイトルを入力"
              disabled={isSubmitting}
            />
            {errors.title && <p className={errorClasses}>{errors.title}</p>}
          </div>

          {/* テーマ */}
          <div>
            <label htmlFor="themeName" className={labelClasses}>
              テーマ *
            </label>
            <input
              id="themeName"
              type="text"
              value={formData.themeName}
              onChange={e => handleInputChange("themeName" as keyof T, e.target.value)}
              className={inputClasses}
              placeholder="テーマを入力"
              disabled={isSubmitting}
            />
            {errors.themeName && <p className={errorClasses}>{errors.themeName}</p>}
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className={labelClasses}>
              説明
            </label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={e => handleInputChange("description" as keyof T, e.target.value)}
              rows={4}
              className="font-noto-sans-jp focus:border-primary focus:ring-primary/10 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 transition-all duration-200 outline-none focus:bg-white focus:ring-2"
              placeholder="説明（任意）"
              disabled={isSubmitting}
            />
            {errors.description && <p className={errorClasses}>{errors.description}</p>}
          </div>

          {/* フレームワーク固有のフィールド */}
          {typeof children === "function"
            ? children({ formData, setFormData, errors, isSubmitting })
            : children}

          {/* ボタン */}
          <div className="flex justify-end space-x-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="font-noto-sans-jp transform rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-200 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 font-noto-sans-jp transform rounded-lg px-8 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>保存中...</span>
                </div>
              ) : mode === "create" ? (
                "確定"
              ) : (
                "更新"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
