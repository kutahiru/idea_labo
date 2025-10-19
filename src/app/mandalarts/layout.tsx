export default function MandalartLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">マンダラート</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>
    </div>
  );
}
