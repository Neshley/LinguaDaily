import React from 'react';
import {
  Home,
  Compass,
  Sparkles,
  RotateCw,
  BookMarked,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { MainNavigationTab } from '../types';

interface NavigationProps {
  activeTab: MainNavigationTab;
  onSelectTab: (tab: MainNavigationTab) => void;
  reviewCount?: number;
  totalWords?: number;
}

interface NavItem {
  id: MainNavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  reviewCount = 0,
  totalWords = 0,
}) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn', icon: Compass },
    { id: 'practice', label: 'Practice', icon: Sparkles },
    {
      id: 'review',
      label: 'Review',
      icon: RotateCw,
      badge: reviewCount > 0 ? reviewCount : undefined,
    },
    { id: 'explore', label: 'Explore', icon: BookMarked },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    {
      id: 'wordbank',
      label: 'Word Bank',
      icon: BookOpen,
      badge: totalWords > 0 ? totalWords : undefined,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation Bar */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-1 py-1 shadow-lg pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-around overflow-x-auto scrollbar-none max-w-lg mx-auto py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl min-w-[46px] min-h-[44px] transition-all relative cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4.5 h-4.5" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0.5 w-5 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
