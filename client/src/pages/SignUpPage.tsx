import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authPageEntrance } from "@/features/auth/animations";
import AuthHeader from "@/features/auth/AuthHeader";
import AuthCard from "@/features/auth/AuthCard";
import SignUpForm from "@/features/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/40 via-background to-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <motion.div {...authPageEntrance} className="w-full max-w-sm">
          <AuthHeader title="Create account" subtitle="Start learning smarter with Leitner." />

          <AuthCard>
            <SignUpForm />
          </AuthCard>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
