import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CircleX, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "destructive" | "success";

interface CustomAlertProps {
  message?: string;
  description?: string;
  className?: string;
  variant?: AlertVariant;
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string;
    icon: string;
    iconComponent: React.ElementType;
  }
> = {
  destructive: {
    container: "bg-[#B40C311A] border-0",
    icon: "text-[#B40C31]",
    iconComponent: CircleX,
  },
  success: {
    container: "bg-[#15803D1A] border-0",
    icon: "text-[#15803D]",
    iconComponent: CircleCheck,
  },
};

export function CustomAlert({
  message,
  description,
  className,
  variant = "destructive",
}: CustomAlertProps) {
  if (!message && !description) return null;

  const { container, icon, iconComponent: Icon } = variantStyles[variant];

  return (
    <Alert variant={variant as "error" | "default" | "destructive" | "aviso" | null | undefined} className={cn("mt-6 mb-6", container, className)}>
      <Icon className={cn("h-6 w-6 shrink-0", icon)} />

      <div className="flex flex-col gap-1 pt-1 min-w-0">
        {message && (
          <AlertTitle className="text-[#42474A] break-words">
            {message}
          </AlertTitle>
        )}

        {description && (
          <AlertDescription className="text-[#42474A] font-normal break-words">
            {description}
          </AlertDescription>
        )}
      </div>
    </Alert>
  );
}
