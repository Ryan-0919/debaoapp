import { NavContextType } from "@/types";
import { ProgressBar } from "@/components/ui";
import { Play, ChevronRight, Bell, Settings, FileText, BookOpen, Star, AlertCircle, ClipboardList, ShoppingBag, Pen, User as UserIcon } from "lucide-react";

interface Props { nav: NavContextType }

export default function Profile({ nav }: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F5F7] pb-6">
      {/* Account summary – frameless */}
      <div className="bg-white px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav.navigate({ type: "user-profile" })}
            className="w-12 h-12 rounded-full bg-[#4C4BEA] flex items-center justify-center text-white text-[18px] font-bold flex-none"
          >
            李
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-[#171925]">李明远</p>
            <p className="text-[12px] text-[#707684] mt-0.5">备考中 · 2024客观题</p>
          </div>
          <button
            onClick={() => nav.navigate({ type: "user-profile" })}
            className="text-[12px] text-[#4C4BEA] border border-[#E5E7ED] px-3 h-7 rounded-full"
          >
            编辑资料
          </button>
        </div>
      </div>

      {/* Continue learning */}
      <div className="bg-white mt-3 mx-4 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=120&h=68&fit=crop&auto=format"
            alt="课程"
            className="w-[72px] h-[48px] rounded object-cover bg-[#E5E7ED] flex-none"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#171925] truncate">民法精讲课（2024版）</p>
            <p className="text-[11px] text-[#707684] mt-0.5 truncate">第18讲：物权变动的公示与公信原则</p>
            <ProgressBar value={42} className="mt-1.5" />
          </div>
          <button
            onClick={() => nav.navigate({ type: "course-detail", courseId: "c1" })}
            className="flex-none bg-[#C9F456] text-[#171925] text-[12px] font-semibold px-3 h-8 rounded-lg flex items-center gap-1 active:bg-[#B8E040]"
          >
            <Play size={12} color="#171925" fill="#171925" />
            继续
          </button>
        </div>
      </div>

      {/* Learning assets */}
      <div className="bg-white mt-3 mx-4 rounded-lg">
        <div className="flex divide-x divide-[#E5E7ED]">
          {[
            { label: "已开课程", value: "2" },
            { label: "本周学习", value: "4.2h" },
            { label: "当前进度", value: "42%" },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 flex flex-col items-center py-4">
              <span className="text-[20px] font-bold text-[#4C4BEA]">{value}</span>
              <span className="text-[11px] text-[#707684] mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly focus */}
      <div className="bg-white mt-3 mx-4 rounded-lg px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#171925]">本周重点</p>
            <p className="text-[12px] text-[#707684] mt-1">当前薄弱学科：<span className="text-[#FF7252] font-medium">民事诉讼法</span></p>
            <p className="text-[12px] text-[#707684] mt-0.5">待复习错题：<span className="text-[#171925] font-medium">28</span> 道</p>
          </div>
          <button
            onClick={() => nav.navigate({ type: "learning-report" })}
            className="text-[12px] text-[#4C4BEA] flex items-center gap-0.5 mt-0.5"
          >
            查看报告 <ChevronRight size={13} color="#4C4BEA" />
          </button>
        </div>
      </div>

      {/* Study & content */}
      <SectionGroup title="学习与内容">
        <Row icon={<ClipboardList size={18} color="#4C4BEA" />} bg="#F0F0FF" label="学习计划" onClick={() => nav.navigate({ type: "learning-plan" })} />
        <Row icon={<FileText size={18} color="#3A7A46" />} bg="#EAF6EF" label="学习报告" onClick={() => nav.navigate({ type: "learning-report" })} />
        <Row icon={<BookOpen size={18} color="#1A5FA8" />} bg="#EDF5FF" label="做题记录" onClick={() => nav.navigate({ type: "question-records" })} />
        <Row icon={<AlertCircle size={18} color="#D2691E" />} bg="#FFF1E8" label="错题本" onClick={() => nav.navigate({ type: "mistake-book" })} />
        <Row icon={<Star size={18} color="#A87000" />} bg="#FFF5DD" label="收藏夹" onClick={() => nav.navigate({ type: "favorites" })} last />
      </SectionGroup>

      {/* Courses & service */}
      <SectionGroup title="课程与服务">
        <Row icon={<Play size={18} color="#4C4BEA" />} bg="#F0F0FF" label="我的课程" onClick={() => nav.switchTab("courses")} />
        <Row icon={<ShoppingBag size={18} color="#C0385A" />} bg="#FFF0F5" label="订单与已购" onClick={() => nav.navigate({ type: "order-list" })} />
        <Row icon={<Pen size={18} color="#1A8B8B" />} bg="#EAF7F7" label="批改服务" onClick={() => nav.navigate({ type: "grading" })} last />
      </SectionGroup>

      {/* App management */}
      <SectionGroup title="应用管理">
        <Row icon={<Bell size={18} color="#A87000" />} bg="#FFF5DD" label="消息通知" onClick={() => nav.navigate({ type: "notifications" })} />
        <Row icon={<Settings size={18} color="#707684" />} bg="#F4F5F7" label="设置与隐私" onClick={() => nav.navigate({ type: "settings" })} last />
      </SectionGroup>
    </div>
  );
}

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 mx-4">
      <p className="text-[12px] text-[#707684] px-1 mb-1.5">{title}</p>
      <div className="bg-white rounded-lg overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ icon, bg, label, onClick, last }: { icon: React.ReactNode; bg: string; label: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#F4F5F7] ${last ? "" : "border-b border-[#E5E7ED]"}`}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style={{ background: bg }}>
        {icon}
      </div>
      <span className="flex-1 text-left text-[14px] text-[#171925]">{label}</span>
      <ChevronRight size={16} color="#C0C5D0" />
    </button>
  );
}
