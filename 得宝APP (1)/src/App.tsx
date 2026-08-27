import { useState } from "react";
import { Page, Tab, NavContextType } from "@/types";
import BottomNav from "@/components/BottomNav";

import Home from "@/pages/Home";
import QuestionBank from "@/pages/QuestionBank";
import Mall from "@/pages/Mall";
import Courses from "@/pages/Courses";
import Profile from "@/pages/Profile";
import SubjectiveSelect from "@/pages/SubjectiveSelect";
import SubjectiveAnswer from "@/pages/SubjectiveAnswer";
import ObjectiveAnswer from "@/pages/ObjectiveAnswer";
import ObjectiveReport from "@/pages/ObjectiveReport";
import ProductDetail from "@/pages/ProductDetail";
import PurchaseSuccess from "@/pages/PurchaseSuccess";
import CourseDetail from "@/pages/CourseDetail";
import VideoPlayer from "@/pages/VideoPlayer";
import LiveCourse from "@/pages/LiveCourse";
import AudioPlayer from "@/pages/AudioPlayer";
import LearningReport from "@/pages/LearningReport";
import LearningPlan from "@/pages/LearningPlan";
import MistakeBook from "@/pages/MistakeBook";
import Favorites from "@/pages/Favorites";
import LawSearch from "@/pages/LawSearch";
import AIChat from "@/pages/AIChat";
import OrderList from "@/pages/OrderList";
import OrderDetail from "@/pages/OrderDetail";
import UserProfile from "@/pages/UserProfile";
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import GradingService from "@/pages/GradingService";
import QuestionRecords from "@/pages/QuestionRecords";

const MAIN_TABS: Tab[] = ["home", "questions", "mall", "courses", "profile"];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [pageStack, setPageStack] = useState<Page[]>([{ type: "tab", tab: "home" }]);

  const currentPage = pageStack[pageStack.length - 1];
  const isTabPage = currentPage.type === "tab";

  const nav: NavContextType = {
    navigate: (page) => setPageStack((s) => [...s, page]),
    goBack: () => setPageStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    replace: (page) => setPageStack((s) => [...s.slice(0, -1), page]),
    activeTab,
    switchTab: (tab) => {
      setActiveTab(tab);
      setPageStack([{ type: "tab", tab }]);
    },
    pageStack,
  };

  const renderPage = () => {
    const p = currentPage;

    if (p.type === "tab") {
      switch (p.tab) {
        case "home": return <Home nav={nav} />;
        case "questions": return <QuestionBank nav={nav} />;
        case "mall": return <Mall nav={nav} />;
        case "courses": return <Courses nav={nav} />;
        case "profile": return <Profile nav={nav} />;
      }
    }

    switch (p.type) {
      case "subjective-select": return <SubjectiveSelect nav={nav} subject={p.subject} />;
      case "subjective-answer": return <SubjectiveAnswer nav={nav} questionIndex={p.questionIndex} subjectName={p.subjectName} />;
      case "objective-answer": return <ObjectiveAnswer nav={nav} mode={p.mode} title={p.title} />;
      case "objective-report": return <ObjectiveReport nav={nav} />;
      case "product-detail": return <ProductDetail nav={nav} productId={p.productId} />;
      case "purchase-success": return <PurchaseSuccess nav={nav} productName={p.productName} productId={p.productId} />;
      case "course-detail": return <CourseDetail nav={nav} courseId={p.courseId} />;
      case "video-player": return <VideoPlayer nav={nav} courseId={p.courseId} lessonId={p.lessonId} />;
      case "live-course": return <LiveCourse nav={nav} title={p.title} />;
      case "audio-player": return <AudioPlayer nav={nav} courseId={p.courseId} lessonId={p.lessonId} />;
      case "learning-report": return <LearningReport nav={nav} />;
      case "learning-plan": return <LearningPlan nav={nav} />;
      case "mistake-book": return <MistakeBook nav={nav} />;
      case "favorites": return <Favorites nav={nav} />;
      case "law-search": return <LawSearch nav={nav} />;
      case "ai-chat": return <AIChat nav={nav} />;
      case "order-list": return <OrderList nav={nav} />;
      case "order-detail": return <OrderDetail nav={nav} orderId={p.orderId} />;
      case "user-profile": return <UserProfile nav={nav} />;
      case "settings": return <Settings nav={nav} />;
      case "notifications": return <Notifications nav={nav} />;
      case "grading": return <GradingService nav={nav} />;
      case "question-records": return <QuestionRecords nav={nav} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E9ED] flex items-center justify-center">
      <div
        className="relative flex flex-col bg-[#F4F5F7] overflow-hidden shadow-2xl"
        style={{
          width: "min(390px, 100vw)",
          height: "min(844px, 100vh)",
          fontFamily: "'Noto Sans SC', 'Inter', sans-serif",
        }}
      >
        {/* Status bar simulation */}
        <div className="flex-none bg-white flex items-center justify-between px-5 h-10">
          <span className="text-[12px] font-semibold text-[#171925]">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#171925">
              <rect x="0" y="4" width="3" height="8" rx="0.5" />
              <rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5" />
              <rect x="9" y="0.5" width="3" height="11.5" rx="0.5" />
              <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3" />
            </svg>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" stroke="#171925" strokeWidth="1.2">
              <path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5L14.5 3.7C12.7 1.8 10.2 0.7 7.5 0.7C4.8 0.7 2.3 1.8 0.5 3.7L1.8 5C3.2 3.5 5.2 2.5 7.5 2.5Z" />
              <path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7L12.6 5.7C11.2 4.4 9.4 3.6 7.5 3.6C5.6 3.6 3.8 4.4 2.4 5.7L3.7 7C4.7 6.1 6 5.5 7.5 5.5Z" />
              <circle cx="7.5" cy="9.5" r="1.5" fill="#171925" />
            </svg>
            <div className="flex items-center gap-0.5">
              <div className="w-5 h-3 border border-[#171925] rounded-sm p-px flex items-center">
                <div className="w-3 h-full bg-[#171925] rounded-xs" />
              </div>
              <div className="w-0.5 h-1.5 bg-[#171925] rounded-r-sm" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {renderPage()}
        </div>

        {/* Bottom nav – only on tab pages */}
        {isTabPage && (
          <BottomNav active={activeTab} onSwitch={nav.switchTab} />
        )}
      </div>
    </div>
  );
}
