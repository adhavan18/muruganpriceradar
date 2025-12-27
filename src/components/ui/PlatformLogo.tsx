import { cn } from "@/lib/utils";

interface PlatformLogoProps {
  platformId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const platformConfigs: Record<string, { bg: string; text: string; initial: string }> = {
  blinkit: { bg: "bg-yellow-400", text: "text-yellow-900", initial: "B" },
  zepto: { bg: "bg-purple-500", text: "text-white", initial: "Z" },
  swiggy: { bg: "bg-orange-500", text: "text-white", initial: "S" },
  amazon: { bg: "bg-amber-500", text: "text-black", initial: "A" },
  flipkart: { bg: "bg-blue-500", text: "text-white", initial: "F" },
};

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-12 h-12 text-lg",
};

export function PlatformLogo({ platformId, size = "md", className }: PlatformLogoProps) {
  const config = platformConfigs[platformId] || { bg: "bg-muted", text: "text-foreground", initial: "?" };

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-bold",
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {config.initial}
    </div>
  );
}
