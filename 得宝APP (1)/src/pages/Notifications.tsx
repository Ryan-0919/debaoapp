import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { Bell, BookOpen, ShoppingBag } from "lucide-react";

interface Props { nav: NavContextType }

const NOTIFS = [
  { icon: "study", title: "学习提醒", body: "您已连续3天未完成今日学习计划，距考试还有42天，继续加油！", time: "10分钟前", read: false },
  { icon: "course", title: "课程更新", body: "民法精讲课第19讲「不动产登记」已上线，点击继续学习。", time: "1小时前", read: false },
  { icon: "order", title: "订单通知", body: "您的订单 DB2024031200001 已支付成功，课程权限已自动开通。", time: "2024年3月12日", read: true },
  { icon: "study", title: "错题复习提醒", body: "您有28道错题待复习，建议今天完成民法错题巩固。", time: "昨天 09:00", read: true },
];

const icons: Record<string, React.ReactNode> = {
  study: <Bell size={18} color="#4C4BEA" />,
  course: <BookOpen size={18} color="#3A7A46" />,
  order: <ShoppingBag size={18} color="#C0385A" />,
};

const iconBgs: Record<string, string> = {
  study: "#F0F0FF",
  course: "#EAF6EF",
  order: "#FFF0F5",
};

export default function Notifications({ nav }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="消息通知" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
          {NOTIFS.map((n, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 py-3.5 ${
                !n.read ? "bg-[#FAFAFE]" : ""
              } ${i < NOTIFS.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-none mt-0.5"
                style={{ background: iconBgs[n.icon] }}
              >
                {icons[n.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-[13px] font-semibold ${n.read ? "text-[#5F6574]" : "text-[#171925]"}`}>
                    {n.title}
                  </p>
                  <span className="text-[10px] text-[#C0C5D0] flex-none ml-2">{n.time}</span>
                </div>
                <p className="text-[12px] text-[#707684] leading-relaxed">{n.body}</p>
              </div>
              {!n.read && <span className="w-2 h-2 bg-[#4C4BEA] rounded-full flex-none mt-1.5" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
