import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { SearchInput } from "@/components/SearchInput";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { PriceComparison } from "@/components/PriceComparison";
import { EmptyState } from "@/components/EmptyState";
import { Product, priceApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = (product: Product) => {
    setSelectedProduct(product);
    toast({
      title: "Product found",
      description: `Comparing prices for ${product.name}`,
    });
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setIsLoading(true);
    
    try {
      const product = await priceApi.getProductByBarcode(barcode);
      
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedProduct) return;
    
    setIsRefreshing(true);
    
    try {
      // Scrape fresh prices
      const success = await priceApi.scrapeProductPrices(
        selectedProduct.id,
        `${selectedProduct.brand} ${selectedProduct.name} ${selectedProduct.size}`
      );
      
      if (success) {
        // Reload product data
        const updated = await priceApi.getProductByBarcode(selectedProduct.barcode);
        if (updated) {
          setSelectedProduct(updated);
        }
        
        toast({
          title: "Prices updated",
          description: "Fresh prices scraped from all platforms",
        });
      } else {
        toast({
          title: "Partial update",
          description: "Some platforms may not have updated",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh prices",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>PriceRadar - Compare Grocery Prices Instantly</title>
        <meta
          name="description"
          content="Compare real-time prices across Blinkit, Zepto, Swiggy Instamart, Amazon, and Flipkart. Scan barcodes or search products to find the best deals in Chennai."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-6 space-y-6">
          {/* Location Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span>Prices for <strong className="text-foreground">Chennai 603103</strong></span>
          </motion.div>

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
                  Compare prices across 8 platforms with one scan
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

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </motion.div>
          )}

          {/* Results Section */}
          {!isLoading && (
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
          )}
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
