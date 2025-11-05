"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { IdeaFormData } from "@/schemas/idea";
import { IdeaCategoryListItem } from "@/types/idea-category";
import { ideaFormDataSchema } from "@/schemas/idea";
import { ModalActions } from "@/components/shared/ModalActions";

interface CreateIdeaModalProps {
  onClose: () => void;
  onSubmit: (data: IdeaFormData & { categoryId: number }) => Promise<void>; // 外部からの送信処理（必須）
  categories?: IdeaCategoryListItem[]; // showCategoryField=falseの場合は不要
  initialData?: IdeaFormData & { id?: number };
  mode: "create" | "edit";
  fixedCategoryId?: number; // カテゴリ固定時のID
  showCategoryField: boolean; // カテゴリフィールドの表示/非表示（必須）
}

export default function CreateIdeaModal({
  onClose,
  onSubmit,
  categories,
  initialData,
  mode,
  fixedCategoryId,
  showCategoryField,
}: CreateIdeaModalProps) {
  const [formData, setFormData] = useState<IdeaFormData & { categoryId: number | null }>({
    name: initialData?.name || "",
    description: initialData?.description || null,
    priority: initialData?.priority || "medium",
    categoryId: fixedCategoryId || null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IdeaFormData | "categoryId", string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  // 選択されたカテゴリを取得（メモ化で無駄なfind実行を防止）
  const selectedCategory = useMemo(() => {
    if (!formData.categoryId || !categories) return null;
    return categories.find(cat => cat.id === formData.categoryId) ?? null;
  }, [categories, formData.categoryId]);

  // フィルタリングされたカテゴリ（メモ化で無駄なfilter実行を防止）
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (query === "") return categories;
    return categories.filter(category => category.name.toLowerCase().includes(query.toLowerCase()));
  }, [categories, query]);

  // 入力値変更
  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const { categoryId, ...ideaData } = formData;
    const result = ideaFormDataSchema.safeParse(ideaData);

    const newErrors: Partial<Record<keyof IdeaFormData | "categoryId", string>> = {};

    if (!categoryId) {
      newErrors.categoryId = "カテゴリを選択してください";
    }

    if (!result.success) {
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof IdeaFormData;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //フォーム送信時のページリロードを防止

    // カテゴリIDの決定（固定カテゴリがあればそれを優先）
    const finalCategoryId = fixedCategoryId || formData.categoryId;

    if (!validateForm() || !finalCategoryId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, categoryId: finalCategoryId });
      onClose();
    } catch (error) {
      console.error("アイデア送信エラー:", error);
      // エラーハンドリングは外部のonSubmit（useResourceSubmit）で行われる
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
              {mode === "edit" ? "アイデアを編集" : "アイデアを登録"}
            </h1>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          {/* カテゴリ選択（オートコンプリート） */}
          {showCategoryField && (
            <div>
              <label className={labelClasses}>カテゴリ *</label>
              <Combobox
                value={selectedCategory}
                onChange={category => {
                  if (category) {
                    handleInputChange("categoryId", category.id);
                    setQuery("");
                  }
                }}
                disabled={isSubmitting}
              >
                <div className="relative">
                  <div className="relative">
                    <ComboboxInput
                      className={inputClasses}
                      displayValue={(category: IdeaCategoryListItem | null) => category?.name || ""}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="カテゴリを検索または選択してください"
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </ComboboxButton>
                  </div>

                  <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg focus:outline-none">
                    {filteredCategories.length === 0 && query !== "" ? (
                      <div className="relative cursor-default px-4 py-2 text-gray-500 select-none">
                        該当するカテゴリが見つかりません
                      </div>
                    ) : (
                      filteredCategories.map(category => (
                        <ComboboxOption
                          key={category.id}
                          value={category}
                          className="data-[focus]:bg-primary/10 data-[focus]:text-primary relative cursor-pointer py-2 pr-4 pl-10 text-gray-900 select-none"
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
                              >
                                {category.name}
                              </span>
                              {selected && (
                                <span className="text-primary absolute inset-y-0 left-0 flex items-center pl-3">
                                  <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                              )}
                            </>
                          )}
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                </div>
              </Combobox>
              {errors.categoryId && <p className={errorClasses}>{errors.categoryId}</p>}
            </div>
          )}

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
