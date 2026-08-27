import { NavContextType } from "@/types";
import { ORDERS, PRODUCTS } from "@/data";
import TopBar from "@/components/TopBar";
import { CheckCircle } from "lucide-react";

interface Props { nav: NavContextType; orderId: string }

export default function OrderDetail({ nav, orderId }: Props) {
  const order = ORDERS.find((o) => o.id === orderId) ?? ORDERS[0];
  const product = PRODUCTS.find((p) => p.id === order.productId) ?? PRODUCTS[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="订单详情" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Status */}
        <div className="bg-white mx-4 mt-4 rounded-lg px-4 py-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            order.status === "已完成" ? "bg-[#EAF6EF]" : "bg-[#FFF5DD]"
          }`}>
            <CheckCircle size={22} color={order.status === "已完成" ? "#5DA765" : "#A87000"} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#171925]">{order.status}</p>
            <p className="text-[12px] text-[#707684] mt-0.5">
              {order.status === "已完成" ? "课程权限已自动开通" : "课程将于开课日自动激活"}
            </p>
          </div>
        </div>

        {/* Product info */}
        <div className="bg-white mx-4 mt-3 rounded-lg overflow-hidden">
          <div className="flex gap-3 p-4 border-b border-[#E5E7ED]">
            <img
              src={product.image}
              alt={product.name}
              className="w-[80px] h-[56px] object-cover rounded bg-[#E5E7ED] flex-none"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#171925] leading-snug">{product.name}</p>
              <p className="text-[12px] text-[#707684] mt-1">{product.type}</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-[13px] text-[#5F6574]">实付金额</span>
            <span className="text-[16px] font-bold text-[#4C4BEA]">¥{order.amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Order info */}
        <div className="bg-white mx-4 mt-3 rounded-lg overflow-hidden">
          {[
            { label: "订单编号", value: order.orderNo },
            { label: "下单时间", value: order.date },
            { label: "支付方式", value: "微信支付" },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i < arr.length - 1 ? "border-b border-[#E5E7ED]" : ""
              }`}
            >
              <span className="text-[13px] text-[#707684]">{label}</span>
              <span className="text-[13px] text-[#171925]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-none bg-white border-t border-[#E5E7ED] px-4 py-3 flex gap-2">
        <button
          onClick={() => nav.navigate({ type: "product-detail", productId: order.productId })}
          className="flex-1 h-11 border border-[#E5E7ED] rounded-lg text-[14px] text-[#5F6574] active:bg-[#F4F5F7]"
        >
          查看商品
        </button>
        {order.courseId && (
          <button
            onClick={() => nav.navigate({ type: "course-detail", courseId: order.courseId! })}
            className="flex-1 h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]"
          >
            进入课程
          </button>
        )}
      </div>
    </div>
  );
}
