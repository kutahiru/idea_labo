"use client";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ label, checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
          disabled ? "cursor-not-allowed" : ""
        } ${checked ? "bg-primary" : "bg-gray-400"}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${checked ? "text-primary" : "text-gray-500"}`}>
        {checked ? "有効" : "無効"}
      </span>
    </div>
  );
}
