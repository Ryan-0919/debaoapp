import { useState } from "react";
import { NavContextType } from "@/types";
import { PRODUCTS } from "@/data";
import TopBar from "@/components/TopBar";
import { Search } from "lucide-react";
import { Tag } from "@/components/ui";

interface Props { nav: NavContextType }

const CATEGORIES = ["全部", "主客一体", "客观题", "主观题"];
const TYPES = ["全部", "视频课程", "直播课程", "音频课程", "书籍"];

export default function Mall({ nav }: Props) {
  const [category, setCategory] = useState("全部");
  const [type, setType] = useState("全部");

  const filtered = PRODUCTS.filter((p) => {
    if (category !== "全部" && p.category !== category) return false;
    if (type !== "全部" && p.type !== type) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="商城" />

      {/* Search */}
      <div className="bg-white px-4 pb-3 border-b border-[#E5E7ED]">
        <div className="flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 h-9">
          <Search size={15} color="#707684" />
          <span className="text-[13px] text-[#C0C5D0]">搜索课程、书籍…</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-[#E5E7ED]">
        <div className="flex px-4 gap-0 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-none px-3 h-10 text-[13px] font-medium border-b-2 transition-colors ${
                category === c
                  ? "border-[#4C4BEA] text-[#4C4BEA]"
                  : "border-transparent text-[#707684]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex px-4 gap-1.5 pb-2.5 overflow-x-auto">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-none px-3 h-7 text-[12px] font-medium rounded-full border transition-colors ${
                type === t
                  ? "bg-[#4C4BEA] text-white border-[#4C4BEA]"
                  : "text-[#5F6574] border-[#E5E7ED]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="mx-4 mt-3 space-y-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => nav.navigate({ type: "product-detail", productId: p.id })}
              className="w-full bg-white rounded-lg overflow-hidden flex active:opacity-80 text-left"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-[110px] h-[80px] object-cover bg-[#E5E7ED] flex-none"
              />
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Tag color="brand">{p.category}</Tag>
                  <Tag color="muted">{p.type}</Tag>
                </div>
                <p className="text-[13px] font-semibold text-[#171925] leading-snug line-clamp-2">
                  {p.name}
                </p>
                <p className="text-[11px] text-[#707684] mt-1 line-clamp-1">{p.brief}</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-[15px] font-bold text-[#4C4BEA]">¥{p.price.toLocaleString()}</span>
                  {p.originalPrice && (
                    <span className="text-[11px] text-[#C0C5D0] line-through">
                      ¥{p.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-[#707684]">已售{p.sold.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center pt-16 text-[#707684]">
              <p className="text-[14px]">暂无符合条件的课程</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
