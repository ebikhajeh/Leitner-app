import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { authLogoEntrance } from "./animations";

interface Props {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <motion.div
        {...authLogoEntrance}
        className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4"
      >
        <BookOpen className="w-8 h-8" />
      </motion.div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
