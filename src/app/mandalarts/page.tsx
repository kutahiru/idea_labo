import { auth } from "@/app/lib/auth";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { getMandalartsByUserId } from "@/lib/mandalart";
import MandalartPageClient from "../../components/mandalart/MandalartPageClient";

export default async function page() {
  const session = await auth();

  //認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const mandalarts = await getMandalartsByUserId(session.user.id);

  return <MandalartPageClient initialData={mandalarts} />;
}
