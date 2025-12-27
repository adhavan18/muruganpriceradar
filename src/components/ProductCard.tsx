import { motion } from "framer-motion";
import { Package, Tag, Barcode } from "lucide-react";
import { Product, getCheapestPrice, formatCurrency } from "@/lib/mockData";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const cheapest = getCheapestPrice(product);
  const savingsMax = cheapest
    ? Math.max(...product.prices.filter((p) => p.available).map((p) => p.price)) - cheapest.price
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover bg-muted"
          />
          <div className="absolute -bottom-2 -right-2 bg-card rounded-lg px-2 py-1 shadow-md border border-border/50">
            <span className="text-xs font-medium text-muted-foreground">{product.category}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h2 className="text-xl font-bold truncate">{product.name}</h2>
              <p className="text-muted-foreground">{product.brand} · {product.size}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-3">
            <Barcode className="w-3.5 h-3.5" />
            <span>{product.barcode}</span>
          </div>

          {cheapest && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(cheapest.price)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  MRP {formatCurrency(product.prices[0].mrp)}
                </span>
              </div>
              {savingsMax > 0 && (
                <div className="deal-badge px-2.5 py-1 rounded-full text-xs">
                  Save up to {formatCurrency(savingsMax)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
