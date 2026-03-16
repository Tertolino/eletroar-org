import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  variant?: "default" | "primary" | "secondary" | "accent";
}

const variantStyles = {
  default: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
  },
  primary: {
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    valueColor: "text-primary",
  },
  secondary: {
    iconBg: "bg-secondary/20",
    iconColor: "text-secondary",
    valueColor: "text-secondary",
  },
  accent: {
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
    valueColor: "text-accent",
  },
};

export function StatCard({ title, value, icon: Icon, trend, delay = 0, variant = "primary" }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card hover-lift p-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn("text-3xl font-bold", styles.valueColor)}>{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm font-medium flex items-center gap-1",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              {Math.abs(trend.value)}% vs mês anterior
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.iconBg)}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
