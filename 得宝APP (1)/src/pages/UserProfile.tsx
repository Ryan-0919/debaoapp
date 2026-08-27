import { useState } from "react";
import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import BottomSheet from "@/components/BottomSheet";
import { ChevronRight, Camera } from "lucide-react";

interface Props { nav: NavContextType }

type FieldKey = "nickname" | "phone" | "goal" | "stage" | "school";

interface Field {
  key: FieldKey;
  label: string;
  editable: boolean;
  inputType?: "text" | "select";
  options?: string[];
}

const FIELDS: Field[] = [
  { key: "nickname", label: "昵称", editable: true, inputType: "text" },
  { key: "phone", label: "手机号", editable: false },
  { key: "goal", label: "备考目标", editable: true, inputType: "text" },
  {
    key: "stage", label: "备考阶段", editable: true, inputType: "select",
    options: ["客观题备考阶段", "客观题精讲阶段", "客观题冲刺阶段", "主观题备考阶段", "主观题冲刺阶段"],
  },
  { key: "school", label: "学校/单位", editable: true, inputType: "text" },
];

const AVATAR_COLORS = ["#4C4BEA", "#C0385A", "#3A7A46", "#A87000", "#1A5FA8", "#1A8B8B"];

export default function UserProfile({ nav }: Props) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    nickname: "李明远",
    phone: "138****8888",
    goal: "2024年法律职业资格考试",
    stage: "客观题精讲阶段",
    school: "未填写",
  });
  const [editing, setEditing] = useState<Field | null>(null);
  const [draft, setDraft] = useState("");
  const [avatarColor, setAvatarColor] = useState("#4C4BEA");
  const [showAvatar, setShowAvatar] = useState(false);
  const [saved, setSaved] = useState(false);

  const openEdit = (field: Field) => {
    if (!field.editable) return;
    setDraft(values[field.key]);
    setEditing(field);
  };

  const confirmEdit = () => {
    if (!editing) return;
    setValues((v) => ({ ...v, [editing.key]: draft.trim() || v[editing.key] }));
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="账号资料" onBack={nav.goBack} />

      <div className="flex-1 overflow-y-auto pb-8">
        {saved && (
          <div className="mx-4 mt-3 bg-[#EAF6EF] border border-[#5DA765]/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#5DA765] flex items-center justify-center text-white text-[10px] font-bold flex-none">✓</span>
            <p className="text-[13px] text-[#3A7A46] font-medium">已保存修改</p>
          </div>
        )}

        {/* Avatar */}
        <div className="bg-white mx-4 mt-4 rounded-xl px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-none">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[24px] font-bold shadow"
                style={{ background: avatarColor }}
              >
                {values.nickname[0] ?? "我"}
              </div>
              <button
                onClick={() => setShowAvatar(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#4C4BEA] rounded-full flex items-center justify-center shadow active:bg-[#3D3CC8]"
              >
                <Camera size={11} color="white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-[#171925]">{values.nickname}</p>
              <p className="text-[12px] text-[#707684] mt-0.5">{values.goal}</p>
              <button onClick={() => setShowAvatar(true)} className="mt-1.5 text-[12px] text-[#4C4BEA]">
                更换头像颜色
              </button>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="bg-white mx-4 mt-3 rounded-xl overflow-hidden">
          {FIELDS.map((f, i) => (
            <button
              key={f.key}
              onClick={() => openEdit(f)}
              disabled={!f.editable}
              className={`w-full flex items-center px-4 py-3.5 text-left ${
                i < FIELDS.length - 1 ? "border-b border-[#E5E7ED]" : ""
              } ${f.editable ? "active:bg-[#F4F5F7]" : ""}`}
            >
              <span className="text-[14px] text-[#707684] w-24 flex-none">{f.label}</span>
              <span className={`flex-1 text-[14px] ${values[f.key] === "未填写" ? "text-[#C0C5D0]" : "text-[#171925]"}`}>
                {values[f.key]}
              </span>
              {f.editable ? (
                <ChevronRight size={16} color="#C0C5D0" className="flex-none" />
              ) : (
                <span className="text-[11px] text-[#C0C5D0] flex-none">不可修改</span>
              )}
            </button>
          ))}
        </div>

        {/* Account security */}
        <div className="mx-4 mt-3">
          <p className="text-[12px] text-[#707684] mb-1.5">账号安全</p>
          <div className="bg-white rounded-xl overflow-hidden">
            {[
              { label: "修改密码", desc: "上次修改：90天前", danger: false },
              { label: "绑定微信", desc: "已绑定", danger: false },
              { label: "注销账号", desc: "删除所有数据", danger: true },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={`flex items-center px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}
              >
                <div className="flex-1">
                  <p className={`text-[14px] ${item.danger ? "text-[#FF7252]" : "text-[#171925]"}`}>{item.label}</p>
                  <p className="text-[11px] text-[#707684] mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={16} color="#C0C5D0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit field sheet */}
      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={`修改${editing?.label ?? ""}`}>
        {editing && (
          <div className="px-5 pb-6">
            {editing.inputType === "select" ? (
              <div className="space-y-2 mb-6">
                {editing.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDraft(opt)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-[14px] active:opacity-80 ${
                      draft === opt
                        ? "border-[#4C4BEA] bg-[#F0F0FF] text-[#4C4BEA] font-semibold"
                        : "border-[#E5E7ED] text-[#5F6574]"
                    }`}
                  >
                    {opt}
                    {draft === opt && <span className="text-[16px]">✓</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-[#F4F5F7] rounded-xl px-4 py-3 border border-transparent focus-within:border-[#4C4BEA]">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoFocus
                    maxLength={30}
                    className="w-full bg-transparent text-[15px] text-[#171925] outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#C0C5D0] mt-1.5 text-right">{draft.length} / 30</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 h-12 border border-[#E5E7ED] rounded-xl text-[14px] text-[#5F6574] active:bg-[#F4F5F7]"
              >
                取消
              </button>
              <button
                onClick={confirmEdit}
                className="flex-1 h-12 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-xl active:bg-[#3D3CC8]"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Avatar color picker */}
      <BottomSheet open={showAvatar} onClose={() => setShowAvatar(false)} title="选择头像颜色">
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[24px] font-bold shadow flex-none"
              style={{ background: avatarColor }}
            >
              {values.nickname[0] ?? "我"}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#171925]">{values.nickname}</p>
              <p className="text-[12px] text-[#707684] mt-0.5">选择你喜欢的颜色</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center mb-6">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAvatarColor(c)}
                className="w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                style={{
                  background: c,
                  outline: avatarColor === c ? `3px solid ${c}` : "none",
                  outlineOffset: 3,
                }}
              >
                {avatarColor === c && <span className="text-white text-[16px] font-bold">✓</span>}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAvatar(false)}
            className="w-full h-12 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-xl active:bg-[#3D3CC8]"
          >
            确认
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
