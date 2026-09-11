import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Course, CourseLesson, CourseUnit } from '../types';
import { getCoursesForLanguage } from '../data/courses';
import { LessonPlayer } from './LessonPlayer';

interface CourseCurriculumProps {
  activeVariantId: string;
  languageName: string;
  completedLessonIds: string[];
  onCompleteLesson: (lessonId: string, earnedXp: number) => void;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  activeVariantId,
  languageName,
  completedLessonIds,
  onCompleteLesson,
}) => {
  const courses = getCoursesForLanguage(activeVariantId);
  const activeCourse: Course | undefined = courses[0];

  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});

  const toggleUnitCollapse = (unitId: string) => {
    setCollapsedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  if (!activeCourse) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center space-y-4">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          📚
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Custom Courses for {languageName}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Structured curriculum is currently in active development for this regional variety. You can practice vocabulary cards, pronunciation drills, and AI sentence generation in the meantime!
          </p>
        </div>
      </div>
    );
  }

  // Calculate overall course progress
  const allLessons = activeCourse.units.flatMap((u) => u.lessons);
  const completedCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / (allLessons.length || 1)) * 100);

  return (
    <div id="course-curriculum-container" className="space-y-6">
      {/* Course Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/30 border border-indigo-400/30 text-xs font-semibold tracking-wide text-indigo-200 uppercase">
                {activeCourse.level}
              </span>
              <span className="text-xs text-indigo-200 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {activeCourse.badge}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{activeCourse.title}</h2>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              {activeCourse.description}
            </p>
          </div>

          {/* Progress widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0 min-w-[200px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-200 font-medium">Curriculum Progress</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-indigo-200/80">
              {completedCount} of {allLessons.length} lessons mastered
            </div>
          </div>
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-4">
        {activeCourse.units.map((unit) => {
          const isCollapsed = !!collapsedUnits[unit.id];
          const unitCompletedCount = unit.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const isUnitFinished = unitCompletedCount === unit.lessons.length && unit.lessons.length > 0;

          return (
            <div
              key={unit.id}
              id={`curriculum-unit-${unit.id}`}
              className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden"
            >
              {/* Unit Header Accordion */}
              <div
                onClick={() => toggleUnitCollapse(unit.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
                    {unit.icon || '📖'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Unit {unit.unitNumber}
                      </span>
                      {isUnitFinished && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {unit.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400">
                    {unitCompletedCount}/{unit.lessons.length}
                  </span>
                  <button className="p-1 rounded-lg text-slate-400">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Lessons within this Unit */}
              {!isCollapsed && (
                <div className="border-t border-slate-100 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700/60">
                  {unit.lessons.map((lesson, lIdx) => {
                    const isCompleted = completedLessonIds.includes(lesson.id);
                    // First lesson is always unlocked; subsequent are unlocked if previous is completed
                    const isUnlocked =
                      lIdx === 0 ||
                      completedLessonIds.includes(unit.lessons[lIdx - 1].id) ||
                      isCompleted;

                    return (
                      <div
                        key={lesson.id}
                        id={`lesson-row-${lesson.id}`}
                        className={`p-4 flex items-center justify-between transition-colors ${
                          isUnlocked
                            ? 'hover:bg-indigo-50/30 dark:hover:bg-slate-700/30'
                            : 'opacity-60 bg-slate-50/50 dark:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 max-w-xl">
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : isUnlocked ? (
                              <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <Lock className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{lesson.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {lesson.objective}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} mins
                              </span>
                              <span>•</span>
                              <span>{lesson.vocabulary.length} words</span>
                              <span>•</span>
                              <span>{lesson.exercises.length} exercises</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <button
                              id={`start-lesson-btn-${lesson.id}`}
                              onClick={() => setActiveLesson(lesson)}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 ${
                                isCompleted
                                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium px-3 py-1.5">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Lesson Player Modal */}
      {activeLesson && (
        <LessonPlayer
          lesson={activeLesson}
          languageCode={activeVariantId}
          onClose={() => setActiveLesson(null)}
          onCompleteLesson={(id, xp) => {
            onCompleteLesson(id, xp);
          }}
        />
      )}
    </div>
  );
};
