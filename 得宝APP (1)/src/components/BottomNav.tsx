import { Tab } from "@/types";
import { Home, BookOpen, ShoppingBag, Play, User } from "lucide-react";

interface Props {
  active: Tab;
  onSwitch: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }> }[] = [
  { id: "home", label: "首页", Icon: Home as any },
  { id: "questions", label: "题库", Icon: BookOpen as any },
  { id: "mall", label: "商城", Icon: ShoppingBag as any },
  { id: "courses", label: "课程", Icon: Play as any },
  { id: "profile", label: "我的", Icon: User as any },
];

export default function BottomNav({ active, onSwitch }: Props) {
  return (
    <div className="flex-none bg-white border-t border-[#E5E7ED] pb-safe">
      <div className="flex">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onSwitch(id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                color={isActive ? "#4C4BEA" : "#707684"}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#4C4BEA" : "#707684" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
