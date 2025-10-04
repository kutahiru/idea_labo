import BrainwritingPageClient from "@/components/brainwritings/BrainwritingPageClient";
import { auth } from "@/app/lib/auth";
import { getBrainwritingsByUserId } from "@/lib/brainwriting";

export default async function BrainwritingPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <div className="py-8 text-center">ログインが必要です</div>;
  }

  const brainwritings = await getBrainwritingsByUserId(session.user.id);

  return <BrainwritingPageClient initialData={brainwritings} />;
}
