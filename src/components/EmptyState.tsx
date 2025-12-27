import { motion } from "framer-motion";
import { Package, ScanBarcode, Search, TrendingDown } from "lucide-react";
import { mockProducts, Product } from "@/lib/mockData";

interface EmptyStateProps {
  onSelectProduct?: (product: Product) => void;
}

export function EmptyState({ onSelectProduct }: EmptyStateProps) {
  const features = [
    {
      icon: ScanBarcode,
      title: "Scan Barcode",
      description: "Use your camera to scan product barcodes instantly",
    },
    {
      icon: Search,
      title: "Search Products",
      description: "Type product name to find and compare prices",
    },
    {
      icon: TrendingDown,
      title: "Find Best Deals",
      description: "We highlight the cheapest price automatically",
    },
  ];

  const quickProducts = mockProducts.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Package className="w-10 h-10 text-primary" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Compare Prices Instantly</h2>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto">
        Scan or search for any product to see real-time prices across all major platforms
      </p>

      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="glass-card rounded-2xl p-5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Popular Products Quick Links */}
      <div className="mt-10">
        <p className="text-sm text-muted-foreground mb-4">Try searching for:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {quickProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelectProduct?.(product)}
              className="px-4 py-2 bg-card border border-border/50 rounded-full text-sm hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}