import { NavContextType } from "@/types";
import { PRODUCTS, COURSES } from "@/data";
import { CheckCircle } from "lucide-react";

interface Props {
  nav: NavContextType;
  productName: string;
  productId?: string;
}

export default function PurchaseSuccess({ nav, productName, productId }: Props) {
  // Find the associated course for this product
  const course = productId
    ? COURSES.find((c) => c.productId === productId)
    : null;

  const product = productId ? PRODUCTS.find((p) => p.id === productId) : null;
  const autoStart = product?.autoStart ?? true;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F5F7] px-8">
      <div className="w-20 h-20 bg-[#EAF6EF] rounded-full flex items-center justify-center mb-5">
        <CheckCircle size={40} color="#5DA765" />
      </div>
      <h2 className="text-[20px] font-bold text-[#171925] mb-2">购买成功</h2>
      <p className="text-[14px] text-[#5F6574] text-center leading-relaxed mb-3">
        {productName}
      </p>

      <div
        className={`rounded-lg px-4 py-3 mb-8 w-full max-w-[280px] ${
          autoStart ? "bg-[#EAF6EF]" : "bg-[#FFF5DD]"
        }`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle size={15} color={autoStart ? "#5DA765" : "#A87000"} />
          <p
            className="text-[13px] font-medium"
            style={{ color: autoStart ? "#5DA765" : "#A87000" }}
          >
            {autoStart ? "课程权限已自动开通" : "课程将于开课日自动激活"}
          </p>
        </div>
        <p className="text-[12px] text-[#707684] mt-1 ml-5 leading-relaxed">
          {autoStart
            ? "可在「我的课程」中立即开始学习"
            : "开课后将收到通知，届时可进入课程"}
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        {course ? (
          <button
            onClick={() => nav.navigate({ type: "course-detail", courseId: course.id })}
            className="w-full h-12 bg-[#4C4BEA] text-white text-[15px] font-semibold rounded-lg active:bg-[#3D3CC8]"
          >
            进入课程
          </button>
        ) : (
          <button
            onClick={() => nav.switchTab("courses")}
            className="w-full h-12 bg-[#4C4BEA] text-white text-[15px] font-semibold rounded-lg active:bg-[#3D3CC8]"
          >
            查看我的课程
          </button>
        )}
        <button
          onClick={() => nav.navigate({ type: "order-list" })}
          className="w-full h-12 border border-[#E5E7ED] bg-white text-[14px] text-[#5F6574] rounded-lg active:bg-[#F4F5F7]"
        >
          查看订单
        </button>
        <button
          onClick={() => nav.switchTab("home")}
          className="text-[13px] text-[#4C4BEA] mt-1"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
