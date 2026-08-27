import { ReactNode } from "react";

// ── Tag ──────────────────────────────────────────────────────────────────────
interface TagProps {
  children: ReactNode;
  color?: "brand" | "success" | "error" | "muted" | "action";
}
export function Tag({ children, color = "muted" }: TagProps) {
  const styles = {
    brand: "bg-[#F0F0FF] text-[#4C4BEA]",
    success: "bg-[#EAF6EF] text-[#5DA765]",
    error: "bg-red-50 text-[#FF7252]",
    muted: "bg-[#F4F5F7] text-[#707684]",
    action: "bg-[#C9F456] text-[#171925]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${styles[color]}`}>
      {children}
    </span>
  );
}

// ── Difficulty badge ──────────────────────────────────────────────────────────
export function DiffBadge({ level }: { level: "易" | "中" | "难" }) {
  const map = { 易: "text-[#5DA765] bg-[#EAF6EF]", 中: "text-[#A87000] bg-[#FFF5DD]", 难: "text-[#FF7252] bg-red-50" };
  return <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${map[level]}`}>{level}</span>;
}

// ── StatusDot ─────────────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: "none" | "draft" | "done" }) {
  if (status === "none") return <span className="w-2 h-2 rounded-full bg-[#E5E7ED] inline-block" />;
  if (status === "draft") return <span className="w-2 h-2 rounded-full bg-[#A87000] inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-[#5DA765] inline-block" />;
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
interface ProgressProps { value: number; className?: string; color?: string }
export function ProgressBar({ value, className = "", color = "#4C4BEA" }: ProgressProps) {
  return (
    <div className={`h-1.5 bg-[#E5E7ED] rounded-full overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

// ── IconBadge ─────────────────────────────────────────────────────────────────
interface IconBadgeProps { bg: string; children: ReactNode; size?: number }
export function IconBadge({ bg, children, size = 40 }: IconBadgeProps) {
  return (
    <div
      className="rounded-lg flex items-center justify-center flex-none"
      style={{ width: size, height: size, background: bg }}
    >
      {children}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "action" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}
export function Button({
  children, onClick, variant = "primary", size = "md", disabled, fullWidth, className = ""
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all active:scale-[0.98]";
  const sizes = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-[14px]", lg: "h-12 px-5 text-[15px]" };
  const variants = {
    primary: "bg-[#4C4BEA] text-white active:bg-[#3D3CC8]",
    action: "bg-[#C9F456] text-[#171925] active:bg-[#B8E040]",
    secondary: "bg-[#F0F0FF] text-[#4C4BEA] active:bg-[#E4E4FC]",
    danger: "bg-red-50 text-[#FF7252] active:bg-red-100",
    ghost: "bg-transparent text-[#4C4BEA] active:bg-[#F0F0FF]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-40" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

// ── ListRow ───────────────────────────────────────────────────────────────────
interface ListRowProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onClick?: () => void;
  border?: boolean;
}
export function ListRow({ icon, title, subtitle, right, onClick, border = true }: ListRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 bg-white ${border ? "border-b border-[#E5E7ED]" : ""} ${onClick ? "active:bg-[#F4F5F7] cursor-pointer" : ""}`}
    >
      {icon && <div className="flex-none">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#171925] truncate">{title}</p>
        {subtitle && <p className="text-[12px] text-[#707684] mt-0.5 truncate">{subtitle}</p>}
      </div>
      {right ?? (onClick && <ChevronRight />)}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C5D0" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; action?: string; onAction?: () => void }
export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <span className="text-[15px] font-semibold text-[#171925]">{title}</span>
      {action && (
        <button onClick={onAction} className="text-[13px] text-[#4C4BEA]">{action}</button>
      )}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
interface EmptyProps { icon?: string; title: string; desc?: string; action?: string; onAction?: () => void }
export function EmptyState({ icon = "📋", title, desc, action, onAction }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <span className="text-4xl mb-4">{icon}</span>
      <p className="text-[15px] font-medium text-[#171925] mb-1">{title}</p>
      {desc && <p className="text-[13px] text-[#707684] text-center">{desc}</p>}
      {action && (
        <button onClick={onAction} className="mt-4 px-4 py-2 bg-[#4C4BEA] text-white text-[14px] rounded-lg">
          {action}
        </button>
      )}
    </div>
  );
}

// ── CardSurface ───────────────────────────────────────────────────────────────
export function CardSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg ${className}`}>{children}</div>;
}
