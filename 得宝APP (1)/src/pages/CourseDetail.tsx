import { useState } from "react";
import { NavContextType } from "@/types";
import { COURSES } from "@/data";
import TopBar from "@/components/TopBar";
import { ProgressBar, Tag } from "@/components/ui";
import { Play, CheckCircle, Circle, ChevronDown } from "lucide-react";

interface Props {
  nav: NavContextType;
  courseId: string;
}

// Courses the user has purchased (demo: c1 is owned, c2 is locked)
const OWNED_COURSES = new Set(["c1"]);

export default function CourseDetail({ nav, courseId }: Props) {
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const [openChapter, setOpenChapter] = useState(0);
  const isOwned = OWNED_COURSES.has(courseId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar onBack={nav.goBack} title={course.name} />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <img
          src={course.image}
          alt={course.name}
          className="w-full h-[200px] object-cover bg-[#E5E7ED]"
        />

        <div className="bg-white px-4 py-4 border-b border-[#E5E7ED]">
          <div className="flex items-center gap-2 mb-2">
            <Tag color="muted">{course.type}</Tag>
            <span className="text-[12px] text-[#707684]">{course.teacher}主讲</span>
          </div>
          <h1 className="text-[17px] font-bold text-[#171925] mb-3">{course.name}</h1>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-1.5">
            <ProgressBar value={course.progress} className="flex-1" />
            <span className="text-[13px] font-semibold text-[#4C4BEA]">{course.progress}%</span>
          </div>
          <p className="text-[12px] text-[#707684]">
            {course.completedLessons}/{course.totalLessons} 课节 · 上次学习 {course.lastStudied}
          </p>
        </div>

        {/* Current lesson / locked state */}
        {isOwned ? (
          <div className="bg-[#F0F0FF] mx-4 mt-3 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-[#4C4BEA] font-medium mb-0.5">当前学习</p>
              <p className="text-[13px] font-semibold text-[#171925] leading-snug">{course.currentLesson}</p>
            </div>
            <button
              onClick={() => nav.navigate({ type: "video-player", courseId })}
              className="flex items-center gap-1.5 bg-[#C9F456] px-4 h-9 rounded-lg flex-none active:bg-[#B8E040]"
            >
              <Play size={14} color="#171925" fill="#171925" />
              <span className="text-[13px] font-semibold text-[#171925]">继续</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#F4F5F7] border border-[#E5E7ED] mx-4 mt-3 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-[#707684] mb-0.5">尚未开通权限</p>
              <p className="text-[13px] text-[#5F6574]">购买课程后即可开始学习</p>
            </div>
            <button
              onClick={() => nav.navigate({ type: "product-detail", productId: course.productId })}
              className="bg-[#4C4BEA] text-white text-[12px] font-semibold px-3 h-8 rounded-lg active:bg-[#3D3CC8] flex-none"
            >
              去购买
            </button>
          </div>
        )}

        {/* Catalog */}
        <div className="mx-4 mt-3 mb-6">
          <p className="text-[14px] font-semibold text-[#171925] mb-2">课程目录</p>
          <div className="bg-white rounded-lg overflow-hidden">
            {course.chapters.map((ch, chIdx) => (
              <div key={ch.title}>
                <button
                  onClick={() => setOpenChapter(openChapter === chIdx ? -1 : chIdx)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7ED] active:bg-[#F4F5F7]"
                >
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-semibold text-[#171925]">{ch.title}</p>
                    <p className="text-[11px] text-[#707684] mt-0.5">
                      {ch.lessons.filter((l) => l.done).length}/{ch.lessons.length} 课节
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    color="#C0C5D0"
                    className={`transition-transform ${openChapter === chIdx ? "rotate-180" : ""}`}
                  />
                </button>

                {openChapter === chIdx &&
                  ch.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => isOwned ? nav.navigate({ type: "video-player", courseId, lessonId: lesson.id }) : nav.navigate({ type: "product-detail", productId: course.productId })}
                      className={`w-full flex items-center gap-3 px-4 py-3 pl-8 border-b border-[#E5E7ED] active:bg-[#F4F5F7] ${
                        (lesson as any).current ? "bg-[#F0F0FF]" : ""
                      }`}
                    >
                      {lesson.done ? (
                        <CheckCircle size={16} color="#5DA765" className="flex-none" />
                      ) : (lesson as any).current ? (
                        <Play size={16} color="#4C4BEA" fill="#4C4BEA" className="flex-none" />
                      ) : (
                        <Circle size={16} color="#C0C5D0" className="flex-none" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-[13px] ${
                            (lesson as any).current
                              ? "font-semibold text-[#4C4BEA]"
                              : lesson.done
                              ? "text-[#707684]"
                              : "text-[#5F6574]"
                          }`}
                        >
                          {lesson.title}
                        </p>
                      </div>
                      <span className="text-[11px] text-[#C0C5D0]">{lesson.duration}</span>
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
