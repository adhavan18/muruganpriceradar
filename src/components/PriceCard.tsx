import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, AlertCircle, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlatformLogo } from "@/components/ui/PlatformLogo";
import { PriceData, priceApi, formatCurrency, formatTimeAgo, Platform } from "@/lib/api";
import { useState, useEffect } from "react";

interface PriceCardProps {
  priceData: PriceData;
  isCheapest: boolean;
  index: number;
}

export function PriceCard({ priceData, isCheapest, index }: PriceCardProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  
  useEffect(() => {
    priceApi.getPlatforms().then(setPlatforms);
  }, []);
  
  const platform = platforms.find((p) => p.id === priceData.platformId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        "platform-card relative",
        isCheapest && "cheapest",
        !priceData.available && "opacity-60"
      )}
    >
      {/* Cheapest Badge */}
      {isCheapest && priceData.available && (
        <div className="absolute -top-2 -right-2 deal-badge px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
          <Check className="w-3 h-3" />
          Best Price
        </div>
      )}

      <div className="flex items-start gap-3">
        <PlatformLogo platformId={priceData.platformId} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{platform.name}</h3>
            {!priceData.available && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                Unavailable
              </span>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Updated {formatTimeAgo(priceData.lastUpdated)}
          </p>
        </div>

        <div className="text-right">
          <div className={cn("text-xl font-bold", isCheapest && priceData.available && "text-primary")}>
            {formatCurrency(priceData.price)}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(priceData.mrp)}
            </span>
            <span className="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded">
              {priceData.discount}% off
            </span>
          </div>
        </div>
      </div>

      {/* Price Change Indicator */}
      {priceData.priceChange !== undefined && priceData.priceChange !== 0 && (
        <div
          className={cn(
            "mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm",
            priceData.priceChange < 0 ? "text-success" : "text-destructive"
          )}
        >
          {priceData.priceChange < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          <span className="font-medium">
            {priceData.priceChange > 0 ? "+" : ""}
            {priceData.priceChange}% from last check
          </span>
        </div>
      )}
    </motion.div>
  );
}
