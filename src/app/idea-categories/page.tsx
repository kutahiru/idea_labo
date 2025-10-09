import IdeaCategoryPageClient from "@/components/idea-categories/IdeaCategoryPageClient";
import { auth } from "@/app/lib/auth";
import { getIdeaCategoriesByUserId } from "@/lib/idea-category";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { IdeaCategoryListItem } from "@/types/idea-category";

export default async function IdeaCategoryPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const ideaCategories = await getIdeaCategoriesByUserId(session.user.id);

  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">アイデアカテゴリ</h1>
      </div>
      <IdeaCategoryPageClient initialData={ideaCategories} />
    </div>
  );
}
