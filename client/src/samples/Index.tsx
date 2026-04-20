import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import DashboardScreen from "@/screens/DashboardScreen";
import ReviewScreen from "@/screens/ReviewScreen";
import PracticeScreen from "@/screens/PracticeScreen";
import AddWordScreen from "@/screens/AddWordScreen";
import StatsScreen from "@/screens/StatsScreen";

type Screen = "dashboard" | "review" | "practice" | "addword" | "stats";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {screen === "dashboard" && <DashboardScreen onStartReview={() => setScreen("review")} />}
      {screen === "review" && <ReviewScreen />}
      {screen === "practice" && <PracticeScreen />}
      {screen === "addword" && <AddWordScreen />}
      {screen === "stats" && <StatsScreen />}
      <BottomNav active={screen} onNavigate={setScreen} />
    </div>
  );
};

export default Index;
