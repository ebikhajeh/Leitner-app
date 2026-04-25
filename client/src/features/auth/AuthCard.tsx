interface Props {
  children: React.ReactNode;
}

export default function AuthCard({ children }: Props) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl shadow-primary/5">
      {children}
    </div>
  );
}
