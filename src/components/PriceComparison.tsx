import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, RefreshCw, ArrowUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { PriceCard } from "@/components/PriceCard";
import { Product, priceApi, getCheapestPrice, formatCurrency, Platform } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PriceComparisonProps {
  product: Product;
  onRefresh: () => void;
  isRefreshing: boolean;
}

type SortType = "price" | "discount";
type ViewType = "cards" | "table";

export function PriceComparison({ product, onRefresh, isRefreshing }: PriceComparisonProps) {
  const [sortBy, setSortBy] = useState<SortType>("price");
  const [viewType, setViewType] = useState<ViewType>("cards");
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    priceApi.getPlatforms().then(setPlatforms);
  }, []);

  const cheapest = getCheapestPrice(product);

  const sortedPrices = [...product.prices].sort((a, b) => {
    if (sortBy === "price") {
      if (!a.available && !b.available) return 0;
      if (!a.available) return 1;
      if (!b.available) return -1;
      return a.price - b.price;
    }
    return b.discount - a.discount;
  });

  const getPlatform = (platformId: string) => platforms.find(p => p.id === platformId);

  const getPlatformColor = (platformId: string) => {
    const colors: Record<string, string> = {
      blinkit: "bg-yellow-400 text-yellow-900",
      zepto: "bg-purple-500 text-white",
      swiggy: "bg-orange-500 text-white",
      amazon: "bg-amber-500 text-black",
      flipkart: "bg-blue-500 text-white",
      bigbasket: "bg-green-500 text-white",
      jiomart: "bg-red-500 text-white",
      dmart: "bg-amber-700 text-white",
    };
    return colors[platformId] || "bg-gray-500 text-white";
  };

  return (
    <div className="space-y-4">
      {/* Product Info */}
      <ProductCard product={product} />

      {/* Location indicator */}
      {product.prices[0]?.locationPincode && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>Prices for pincode: {product.prices[0].locationPincode}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === "price" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("price")}
            className="rounded-xl"
          >
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            Price
          </Button>
          <Button
            variant={sortBy === "discount" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("discount")}
            className="rounded-xl"
          >
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            Discount
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-xl p-1">
            <button
              onClick={() => setViewType("cards")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewType === "cards" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType("table")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewType === "table" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl"
          >
            <RefreshCw className={cn("w-4 h-4 mr-1.5", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Scraping..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* No prices yet message */}
      {sortedPrices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No prices available yet. Click "Refresh" to scrape current prices.</p>
        </div>
      )}

      {/* Price Cards */}
      {viewType === "cards" && sortedPrices.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedPrices.map((price, index) => (
            <PriceCard
              key={price.platformId}
              priceData={price}
              isCheapest={cheapest?.platformId === price.platformId}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewType === "table" && sortedPrices.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Platform</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">MRP</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Discount</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrices.map((price) => {
                  const platform = getPlatform(price.platformId);
                  const isCheapest = cheapest?.platformId === price.platformId && price.available;
                  
                  return (
                    <tr
                      key={price.platformId}
                      className={cn(
                        "border-b border-border/30 last:border-0",
                        isCheapest && "bg-primary/5"
                      )}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                              getPlatformColor(price.platformId)
                            )}
                          >
                            {platform?.name.charAt(0) || price.platformId.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{platform?.name || price.platformId}</span>
                          {isCheapest && (
                            <span className="deal-badge px-2 py-0.5 rounded-full text-xs">
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("p-4 text-right font-bold", isCheapest && "text-primary")}>
                        {formatCurrency(price.price)}
                      </td>
                      <td className="p-4 text-right text-muted-foreground line-through">
                        {formatCurrency(price.mrp)}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-success font-medium">{price.discount}%</span>
                      </td>
                      <td className="p-4 text-center">
                        {price.available ? (
                          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center py-4">
        Prices are scraped from platforms and may vary. Updated daily for Chennai 603103.
      </p>
    </div>
  );
}
