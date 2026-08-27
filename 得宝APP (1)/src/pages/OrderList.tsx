import { NavContextType } from "@/types";
import { ORDERS } from "@/data";
import TopBar from "@/components/TopBar";
import { Tag } from "@/components/ui";
import { ChevronRight } from "lucide-react";

interface Props { nav: NavContextType }

export default function OrderList({ nav }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="订单与已购" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
          {ORDERS.map((o, i) => (
            <button
              key={o.id}
              onClick={() => nav.navigate({ type: "order-detail", orderId: o.id })}
              className={`w-full flex items-start gap-3 px-4 py-4 text-left active:bg-[#F4F5F7] ${
                i < ORDERS.length - 1 ? "border-b border-[#E5E7ED]" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[11px] font-medium ${
                      o.status === "已完成" ? "text-[#5DA765]" : "text-[#A87000]"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="text-[14px] font-semibold text-[#171925] leading-snug line-clamp-2">
                  {o.productName}
                </p>
                <p className="text-[11px] text-[#707684] mt-1">{o.date}</p>
                <p className="text-[15px] font-bold text-[#4C4BEA] mt-2">¥{o.amount.toLocaleString()}</p>
              </div>
              <ChevronRight size={16} color="#C0C5D0" className="mt-1 flex-none" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
