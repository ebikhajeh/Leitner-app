import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authPageEntrance } from "@/features/auth/animations";
import AuthHeader from "@/features/auth/AuthHeader";
import AuthCard from "@/features/auth/AuthCard";
import ResetPasswordForm from "@/features/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/40 via-background to-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <motion.div {...authPageEntrance} className="w-full max-w-sm">
          <AuthHeader
            title="Set new password"
            subtitle="Choose a strong password for your account."
          />

          <AuthCard>
            <ResetPasswordForm />
          </AuthCard>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-foreground font-semibold hover:underline">
              Back to Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
