"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { UserFormData, userFormDataSchema } from "@/schemas/user";
import { parseJsonSafe, parseJson } from "@/lib/client-utils";

interface AddUserClientProps {
  currentName: string;
  redirectUrl: string;
}

export default function AddUserClient({
  currentName,
  redirectUrl,
}: AddUserClientProps) {
  const router = useRouter();
  const { update } = useSession();
  const [formData, setFormData] = useState<UserFormData>({
    name: currentName,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 入力値変更
  const handleInputChange = (value: string) => {
    setFormData({ name: value });
    if (errors.name) {
      setErrors({});
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const result = userFormDataSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof UserFormData, string>> = {};

      result.error.issues.forEach((issue) => {
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
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, {
          error: "ユーザー名の更新に失敗しました",
        });
        throw new Error(errorData.error || "ユーザー名の更新に失敗しました");
      }

      const result = await parseJson<{ name: string }>(response);

      // セッションを更新
      await update({ name: result.name });

      toast.success("ユーザー名を設定しました");
      router.push(redirectUrl);
    } catch (error) {
      console.error("ユーザー名更新エラー:", error);
      toast.error(
        error instanceof Error ? error.message : "ユーザー名の更新に失敗しました"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          ユーザー名 *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all duration-200"
          placeholder="ユーザー名を入力"
          maxLength={50}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary w-full rounded-lg py-3 font-medium text-white transition-all hover:shadow-lg disabled:bg-gray-400 disabled:hover:shadow-none"
      >
        {isSubmitting ? "設定中..." : "設定して始める"}
      </button>
    </form>
  );
}
