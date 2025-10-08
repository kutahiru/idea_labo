import { auth } from "@/app/lib/auth";
import { getIdeasByCategoryId } from "@/lib/idea";
import { checkCategoryOwnership } from "@/lib/idea-category";
import IdeaPageClient from "@/components/ideas/IdeaPageClient";
import { LoginRequiredMessage } from "@/components/shared/Message";

export default async function IdeaCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    return <div className="py-8 text-center">カテゴリが見つかりません</div>;
  }

  // カテゴリの所有者確認
  const isOwner = await checkCategoryOwnership(categoryId, session.user.id);
  if (!isOwner) {
    return <div className="py-8 text-center">カテゴリが見つかりません</div>;
  }

  const ideas = await getIdeasByCategoryId(categoryId, session.user.id);

  return <IdeaPageClient initialData={ideas} categoryId={categoryId} />;
}
