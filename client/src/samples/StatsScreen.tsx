import { motion } from "framer-motion";
import { sampleCards } from "@/data/cards";

const StatsScreen = () => {
  const boxes = [1, 2, 3, 4, 5].map((box) => ({
    box,
    count: sampleCards.filter((c) => c.box === box).length,
  }));
  const maxCount = Math.max(...boxes.map((b) => b.count), 1);

  const stats = [
    { label: "Total Words", value: "47" },
    { label: "Mastered", value: "18" },
    { label: "Retention", value: "82%" },
    { label: "Sessions", value: "23" },
  ];

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">Progress & Stats</h1>
        <p className="text-sm text-muted-foreground">Track your learning journey</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Leitner Boxes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Leitner Boxes</h2>
        <div className="space-y-3">
          {boxes.map(({ box, count }) => (
            <div key={box} className="flex items-center gap-3">
              <span className="text-xs font-bold w-14 text-muted-foreground">Box {box}</span>
              <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ delay: 0.3 + box * 0.08, duration: 0.5 }}
                  className="h-full bg-primary rounded-lg flex items-center justify-end pr-2"
                >
                  {count > 0 && <span className="text-[10px] font-bold text-primary-foreground">{count}</span>}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Box 1 = New · Box 5 = Mastered
        </p>
      </motion.div>

      {/* Retention over time (simple visual) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border p-5 space-y-3"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Weekly Activity</h2>
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 30, 80, 55, 90, 60].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
              className="flex-1 bg-primary/20 rounded-lg relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-lg" style={{ height: "100%" }} />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsScreen;
