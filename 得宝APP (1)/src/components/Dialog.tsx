import { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  children?: ReactNode;
}

export default function Dialog({
  open, title, description, confirmText = "确认", cancelText = "取消",
  onConfirm, onCancel, danger, children
}: Props) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl overflow-hidden w-full max-w-[320px]">
        <div className="p-6">
          <p className="text-[16px] font-semibold text-[#171925] mb-2">{title}</p>
          {description && <p className="text-[14px] text-[#5F6574] leading-relaxed">{description}</p>}
          {children}
        </div>
        <div className="flex border-t border-[#E5E7ED]">
          <button
            onClick={onCancel}
            className="flex-1 h-12 text-[15px] text-[#5F6574] font-medium active:bg-[#F4F5F7]"
          >
            {cancelText}
          </button>
          <div className="w-px bg-[#E5E7ED]" />
          <button
            onClick={onConfirm}
            className="flex-1 h-12 text-[15px] font-semibold active:bg-[#F4F5F7]"
            style={{ color: danger ? "#FF7252" : "#4C4BEA" }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
