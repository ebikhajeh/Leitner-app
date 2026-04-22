import { motion } from "framer-motion";
import { Flame, Zap, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onStartReview: () => void;
}

const DashboardScreen = ({ onStartReview }: Props) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground text-sm font-medium">Welcome back</p>
        <h1 className="text-2xl font-bold">{greeting} 👋</h1>
      </motion.div>

      {/* Streak & XP row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-3"
      >
        <div className="flex-1 bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-streak/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-streak" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Streak</p>
            <p className="text-lg font-bold">5 days</p>
          </div>
        </div>
        <div className="flex-1 bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-xp/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-xp" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">XP</p>
            <p className="text-lg font-bold">1,240</p>
          </div>
        </div>
      </motion.div>

      {/* Level */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-4 border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold">Level 7</span>
          </div>
          <span className="text-xs text-muted-foreground">740 / 1000 XP</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "74%" }} />
        </div>
      </motion.div>

      {/* Daily stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl p-5 border border-border space-y-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Words learned</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Cards due</p>
          </div>
        </div>
        {/* Weekly progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Weekly goal</span>
            <span>65%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full transition-all" style={{ width: "65%" }} />
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button
          onClick={onStartReview}
          className="w-full h-14 text-base font-bold rounded-2xl animate-pulse-glow"
          size="lg"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Start Review
        </Button>
      </motion.div>
    </div>
  );
};

export default DashboardScreen;
