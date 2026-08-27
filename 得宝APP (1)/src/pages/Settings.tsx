import { useState } from "react";
import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { ChevronRight } from "lucide-react";
import Dialog from "@/components/Dialog";

interface Props { nav: NavContextType }

export default function Settings({ nav }: Props) {
  const [logoutDialog, setLogoutDialog] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="设置与隐私" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {[
          { group: "通知", items: [{ label: "学习提醒", desc: "每日学习计划提醒" }, { label: "课程更新通知" }, { label: "订单通知" }] },
          { group: "隐私", items: [{ label: "账号与安全" }, { label: "隐私政策" }] },
          { group: "关于", items: [{ label: "版本信息", desc: "v2.4.1" }, { label: "用户协议" }, { label: "联系客服" }] },
        ].map(({ group, items }) => (
          <div key={group} className="mx-4 mt-3">
            <p className="text-[12px] text-[#707684] mb-1.5">{group}</p>
            <div className="bg-white rounded-lg overflow-hidden">
              {items.map(({ label, desc }, i) => (
                <div
                  key={label}
                  className={`flex items-center px-4 py-3.5 ${i < items.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}
                >
                  <div className="flex-1">
                    <p className="text-[14px] text-[#171925]">{label}</p>
                    {desc && <p className="text-[12px] text-[#707684] mt-0.5">{desc}</p>}
                  </div>
                  <ChevronRight size={16} color="#C0C5D0" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mx-4 mt-4">
          <button
            onClick={() => setLogoutDialog(true)}
            className="w-full h-12 bg-white rounded-lg text-[15px] text-[#FF7252] font-medium active:bg-[#FFF5F5]"
          >
            退出登录
          </button>
        </div>
      </div>

      <Dialog
        open={logoutDialog}
        title="确认退出登录"
        description="退出后需要重新登录才能访问您的学习数据。"
        confirmText="退出登录"
        cancelText="取消"
        onConfirm={() => { setLogoutDialog(false); nav.goBack(); }}
        onCancel={() => setLogoutDialog(false)}
        danger
      />
    </div>
  );
}
