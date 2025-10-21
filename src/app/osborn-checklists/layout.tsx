import OsbornChecklistHelpButton from "@/components/osborn-checklists/OsbornChecklistHelpButton";

export default function OsbornLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">オズボーンのチェックリスト</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>

      <OsbornChecklistHelpButton />
    </div>
  );
}
