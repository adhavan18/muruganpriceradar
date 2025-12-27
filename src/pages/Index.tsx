import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { SearchInput } from "@/components/SearchInput";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { PriceComparison } from "@/components/PriceComparison";
import { EmptyState } from "@/components/EmptyState";
import { Product, getProductByBarcode } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleSearch = (product: Product) => {
    setSelectedProduct(product);
    toast({
      title: "Product found",
      description: `Comparing prices for ${product.name}`,
    });
  };

  const handleBarcodeScan = (barcode: string) => {
    setShowScanner(false);
    const product = getProductByBarcode(barcode);
    
    if (product) {
      setSelectedProduct(product);
      toast({
        title: "Barcode scanned",
        description: `Found: ${product.name}`,
      });
    } else {
      toast({
        title: "Product not found",
        description: `No product found for barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Prices updated",
        description: "All prices have been refreshed",
      });
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>PriceRadar - Compare Grocery Prices Instantly</title>
        <meta
          name="description"
          content="Compare real-time prices across Blinkit, Zepto, Swiggy Instamart, Amazon, and Flipkart. Scan barcodes or search products to find the best deals."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-6 space-y-6">
          {/* Hero Search Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl -z-10" />
            <div className="py-8 px-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Find the best price, instantly
                </h2>
                <p className="text-muted-foreground">
                  Compare prices across 5 platforms with one scan
                </p>
              </div>
              <div className="max-w-2xl mx-auto">
                <SearchInput
                  onSearch={handleSearch}
                  onScanClick={() => setShowScanner(true)}
                />
              </div>
            </div>
          </motion.section>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {selectedProduct ? (
              <motion.section
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PriceComparison
                  product={selectedProduct}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
              </motion.section>
            ) : (
              <motion.section
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState onSelectProduct={handleSearch} />
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* Barcode Scanner Modal */}
        <AnimatePresence>
          {showScanner && (
            <BarcodeScanner
              onScan={handleBarcodeScan}
              onClose={() => setShowScanner(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Index;