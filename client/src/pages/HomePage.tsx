import { motion } from "framer-motion";
import { BookOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/useDashboard";
import { StreakXpRow } from "@/features/dashboard/StreakXpRow";
import { LevelCard } from "@/features/dashboard/LevelCard";
import { TodayProgress } from "@/features/dashboard/TodayProgress";

function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function AnimatedSection({
  delay = 0,
  y = 10,
  className,
  children,
}: {
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useDashboard();

  const greeting = getGreeting();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const handleSignOut = async () => {
    await signOut({ fetchOptions: { onSuccess: () => navigate("/login") } });
  };

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <AnimatedSection y={-10} className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Welcome back</p>
          <h1 className="text-2xl font-bold">
            {greeting}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </AnimatedSection>

      {/* Stats */}
      {isError ? (
        <AnimatedSection delay={0.05}>
          <div className="bg-card rounded-2xl border border-border p-5 text-center space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Couldn't load your stats</p>
              <p className="text-xs text-muted-foreground">Check your connection and try again.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
              Retry
            </Button>
          </div>
        </AnimatedSection>
      ) : (
        <>
          {/* Streak & XP */}
          <AnimatedSection delay={0.05}>
            {isLoading ? (
              <div className="flex gap-3">
                <Skeleton className="flex-1 h-[72px] rounded-2xl" />
                <Skeleton className="flex-1 h-[72px] rounded-2xl" />
              </div>
            ) : stats ? (
              <StreakXpRow streak={stats.streak} xp={stats.xp} />
            ) : null}
          </AnimatedSection>

          {/* Level */}
          <AnimatedSection delay={0.1}>
            {isLoading ? (
              <Skeleton className="h-[76px] rounded-2xl" />
            ) : stats ? (
              <LevelCard
                level={stats.level}
                xpInLevel={stats.xpInLevel}
                xpForNextLevel={stats.xpForNextLevel}
              />
            ) : null}
          </AnimatedSection>

          {/* Today's Progress */}
          <AnimatedSection delay={0.15}>
            {isLoading ? (
              <Skeleton className="h-[148px] rounded-2xl" />
            ) : stats ? (
              <TodayProgress
                reviewedToday={stats.reviewedToday}
                dueCount={stats.dueCount}
                weeklyReviews={stats.weeklyReviews}
                weeklyGoal={stats.weeklyGoal}
              />
            ) : null}
          </AnimatedSection>
        </>
      )}

      {/* CTA */}
      <AnimatedSection delay={0.2}>
        <Button
          onClick={() => navigate("/review")}
          className="w-full h-14 text-base font-bold rounded-2xl animate-pulse-glow cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
          size="lg"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Start Review
        </Button>
      </AnimatedSection>
    </div>
  );
}
