"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { BrainwritingFormData } from "@/types/brainwriting";
import { brainwritingFormDataSchema } from "@/schemas/brainwriting";
import { XIcon } from "@/components/layout/Icons";

interface BrainwritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BrainwritingFormData) => Promise<void>;
  initialData?: Partial<BrainwritingFormData>;
  mode: "create" | "edit";
}

export default function BrainwritingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: BrainwritingModalProps) {
  const [formData, setFormData] = useState<BrainwritingFormData>({
    title: "",
    themeName: "",
    description: "",
    usageScope: "xpost",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BrainwritingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // モーダルが開かれた時の初期化
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: initialData?.id,
        title: initialData?.title || "",
        themeName: initialData?.themeName || "",
        description: initialData?.description || "",
        usageScope: initialData?.usageScope || "xpost",
        createdAt: initialData?.createdAt,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  // バリデーション
  const validateForm = (): boolean => {
    const result = brainwritingFormDataSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof BrainwritingFormData, string>> = {};

      // Zodのエラーを型安全にマップ
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof BrainwritingFormData;
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
      console.error("ブレインライティング保存エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 入力値変更
  const handleInputChange = (field: keyof BrainwritingFormData, value: string) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* モーダル本体 */}
      <div className="relative max-h-[90vh] w-[600px] overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl">
        {/* ヘッダー */}
        <div className="from-primary to-primary-hover w-full rounded-t-2xl bg-gradient-to-r px-8 py-6">
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
              onChange={e => handleInputChange("title", e.target.value)}
              className={inputClasses}
              placeholder="プロジェクトのタイトルを入力"
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
              onChange={e => handleInputChange("themeName", e.target.value)}
              className={inputClasses}
              placeholder="発想のテーマを入力"
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
              onChange={e => handleInputChange("description", e.target.value)}
              rows={4}
              className="font-noto-sans-jp focus:border-primary focus:ring-primary/10 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 transition-all duration-200 outline-none focus:bg-white focus:ring-2"
              placeholder="プロジェクトの詳細説明（任意）"
              disabled={isSubmitting}
            />
            {errors.description && <p className={errorClasses}>{errors.description}</p>}
          </div>

          {/* 利用方法 */}
          <div>
            <label className={labelClasses}>利用方法</label>
            <div className="flex space-x-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="xpost"
                  checked={formData.usageScope === "xpost"}
                  onChange={e => handleInputChange("usageScope", e.target.value as "xpost")}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div
                  className={`flex w-full items-center justify-center rounded-lg border-2 px-4 py-3 transition-all duration-200 ${
                    formData.usageScope === "xpost"
                      ? "bg-primary border-primary text-white shadow-lg"
                      : "hover:border-primary border-gray-200 bg-white text-gray-700 hover:shadow-md"
                  }`}
                >
                  <div className="text-center">
                    <XIcon className="mx-auto mb-1" size={20} />
                    <span className="font-noto-sans-jp text-sm font-medium">X投稿</span>
                  </div>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="team"
                  checked={formData.usageScope === "team"}
                  onChange={e => handleInputChange("usageScope", e.target.value as "team")}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div
                  className={`flex w-full items-center justify-center rounded-lg border-2 px-4 py-3 transition-all duration-200 ${
                    formData.usageScope === "team"
                      ? "bg-primary border-primary text-white shadow-lg"
                      : "hover:border-primary border-gray-200 bg-white text-gray-700 hover:shadow-md"
                  }`}
                >
                  <div className="text-center">
                    <Users size={20} className="mx-auto mb-1" />
                    <span className="font-noto-sans-jp text-sm font-medium">チーム利用</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="font-noto-sans-jp rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="from-primary to-primary-hover font-noto-sans-jp transform rounded-lg bg-gradient-to-r px-8 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>
    </div>
  );
}
