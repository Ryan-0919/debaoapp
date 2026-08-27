import { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  // No body overflow manipulation needed — app renders in a fixed container

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E5E7ED]">
          <span className="text-[16px] font-semibold text-[#171925]">{title}</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F4F5F7]">
            <X size={18} color="#707684" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
}
