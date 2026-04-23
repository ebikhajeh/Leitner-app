import { Button } from "@/components/ui/button";

interface ShowAnswerButtonProps {
  onClick: () => void;
}

export function ShowAnswerButton({ onClick }: ShowAnswerButtonProps) {
  return (
    <div className="pt-4">
      <Button onClick={onClick} className="rounded-xl px-8 bg-blue-500 hover:bg-blue-600 text-white border-0" size="lg">
        Show Answer
      </Button>
    </div>
  );
}
