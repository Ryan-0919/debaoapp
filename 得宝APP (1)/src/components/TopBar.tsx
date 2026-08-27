import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  transparent?: boolean;
  children?: ReactNode;
}

export default function TopBar({ title, onBack, right, transparent, children }: Props) {
  return (
    <div
      className={`flex-none flex items-center h-[52px] px-4 ${
        transparent ? "" : "bg-white border-b border-[#E5E7ED]"
      }`}
    >
      <div className="w-10 flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center -ml-1.5 rounded-full active:bg-[#F4F5F7]"
          >
            <ChevronLeft size={22} color="#171925" strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {children ?? (
          <span className="text-[16px] font-semibold text-[#171925] truncate">{title}</span>
        )}
      </div>
      <div className="w-10 flex items-center justify-end">{right}</div>
    </div>
  );
}
