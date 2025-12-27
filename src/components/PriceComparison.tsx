import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, RefreshCw, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { PriceCard } from "@/components/PriceCard";
import { Product, getCheapestPrice, platforms, formatCurrency } from "@/lib/mockData";
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

  return (
    <div className="space-y-4">
      {/* Product Info */}
      <ProductCard product={product} />

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
            Refresh
          </Button>
        </div>
      </div>

      {/* Price Cards */}
      {viewType === "cards" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      {viewType === "table" && (
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
                  const platform = platforms.find((p) => p.id === price.platformId);
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
                              price.platformId === "blinkit" && "bg-yellow-400 text-yellow-900",
                              price.platformId === "zepto" && "bg-purple-500 text-white",
                              price.platformId === "swiggy" && "bg-orange-500 text-white",
                              price.platformId === "amazon" && "bg-amber-500 text-black",
                              price.platformId === "flipkart" && "bg-blue-500 text-white"
                            )}
                          >
                            {platform?.name.charAt(0)}
                          </div>
                          <span className="font-medium">{platform?.name}</span>
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
        Prices are indicative and may vary. Last updated just now.
      </p>
    </div>
  );
}
