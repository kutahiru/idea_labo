import Link from "next/link";
import BrainwritingIndex from "@/components/brainwriting/BrainwritingIndex";
import { auth } from "@/app/lib/auth";
import { getBrainwritingsByUserId } from "@/lib/brainwriting";

export default async function BrainwritingPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <div className="py-8 text-center">ログインが必要です</div>;
  }

  const brainwritings = await getBrainwritingsByUserId(session.user.id);

  return (
    <div>
      <div className="flex justify-center">
        <Link
          href="/brainwriting/new"
          className="group bg-primary inline-flex items-center rounded-md px-25 py-2 text-base font-medium text-white hover:scale-105"
        >
          <svg
            className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </Link>
      </div>
      <div className="mt-4">
        <BrainwritingIndex initialData={brainwritings} />
      </div>
    </div>
  );
}
