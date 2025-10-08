import BrainwritingPageClient from "@/components/brainwritings/BrainwritingPageClient";
import { auth } from "@/app/lib/auth";
import { getBrainwritingsByUserId } from "@/lib/brainwriting";
import { LoginRequiredMessage } from "@/components/shared/Message";

export default async function BrainwritingPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const brainwritings = await getBrainwritingsByUserId(session.user.id);

  return <BrainwritingPageClient initialData={brainwritings} />;
}
