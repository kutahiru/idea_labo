// ボタンの共通コンポーネント

interface CreateButtonProps {
  onClick: () => void;
  className?: string;
}

export function CreateButton({ onClick, className = "" }: CreateButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`menu-link group bg-primary inline-flex items-center rounded-md px-25 py-2 text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`}
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
    </button>
  );
}
