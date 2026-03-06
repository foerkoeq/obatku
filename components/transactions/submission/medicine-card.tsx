"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Plus, Minus, Sparkles, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MedicineCardProps {
  medicine: {
    id: string;
    name: string;
    category: string;
    activeIngredient?: string;
    unit: string;
    stock: number;
    pestTypes?: string[];
    dosagePerHa?: number;
    image?: string;
    pricePerUnit?: number;
  };
  isSelected: boolean;
  quantity: number;
  recommendedQuantity?: number;
  onSelect: () => void;
  onQuantityChange: (qty: number) => void;
  recommended?: boolean;
  affectedArea?: number;
}

export function MedicineCard({
  medicine,
  isSelected,
  quantity,
  recommendedQuantity = 1,
  onSelect,
  onQuantityChange,
  recommended = false,
  affectedArea = 0,
}: MedicineCardProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity || recommendedQuantity);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const stock = medicine.stock || 0;
  const unit = medicine.unit || "pcs";
  const isOutOfStock = stock <= 0;
  const exceedsStock = localQuantity > stock;
  const isLowStock = stock > 0 && stock < 10;

  // Update local quantity when prop changes
  useEffect(() => {
    if (quantity !== localQuantity) {
      setLocalQuantity(quantity || recommendedQuantity);
    }
  }, [quantity, recommendedQuantity]);

  // Trigger animation on mount
  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true);
    }
  }, [hasAnimated]);

  const handleIncrement = () => {
    const newQty = localQuantity + 1;
    if (newQty <= stock) {
      setLocalQuantity(newQty);
      onQuantityChange(newQty);
    } else {
      onQuantityChange(newQty); // Still update to show warning
    }
  };

  const handleDecrement = () => {
    const newQty = Math.max(1, localQuantity - 1);
    setLocalQuantity(newQty);
    onQuantityChange(newQty);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setLocalQuantity(val);
    onQuantityChange(val);
  };

  const handleCardClick = () => {
    if (!isSelected && !isOutOfStock) {
      onSelect();
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: hasAnimated ? 0 : Math.random() * 0.2, // Stagger animation
      }
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!isSelected && !isOutOfStock ? "hover" : undefined}
      whileTap={!isSelected && !isOutOfStock ? "tap" : undefined}
    >
      <Card 
        className={cn(
          "h-full flex flex-col transition-all duration-300 border-2 overflow-hidden",
          isSelected 
            ? "border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5" 
            : "border-border hover:border-primary/50 hover:shadow-md",
          recommended && !isSelected && "bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/10",
          isOutOfStock && "opacity-60 cursor-not-allowed"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="p-4 pb-2 relative">
          {/* Recommended Badge */}
          {recommended && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-2 right-2"
            >
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                Rekomendasi
              </Badge>
            </motion.div>
          )}

          {/* Selected Checkmark */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 z-10"
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Check className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          )}

          <div className="space-y-1 pr-16">
            <CardTitle className="text-base line-clamp-2 leading-tight">
              {medicine.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge color="secondary" className="text-xs">
                {medicine.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 flex-1 space-y-3">
          {/* Image Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {medicine.image ? (
              <img 
                src={medicine.image} 
                alt={medicine.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-8 h-8 text-muted-foreground/50" />
            )}
          </div>

          {/* Active Ingredient */}
          {medicine.activeIngredient && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              <span className="font-medium">Bahan Aktif:</span> {medicine.activeIngredient}
            </p>
          )}

          {/* Stock Info */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              Stok:
            </span>
            <span className={cn(
              "font-semibold",
              isOutOfStock && "text-destructive",
              isLowStock && !isOutOfStock && "text-orange-500",
              !isLowStock && !isOutOfStock && "text-success"
            )}>
              {isOutOfStock ? "Habis" : `${stock} ${unit}`}
            </span>
          </div>

          {/* Dosage Info */}
          {medicine.dosagePerHa && affectedArea > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <span className="font-medium">Dosis:</span> {medicine.dosagePerHa} {unit}/Ha
              {recommendedQuantity > 0 && (
                <span className="block mt-1 text-primary font-medium">
                  Rekomendasi: {recommendedQuantity} {unit} (untuk {affectedArea} Ha)
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <AnimatePresence mode="wait">
            {isSelected ? (
              <motion.div
                key="quantity-controls"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={handleDecrement}
                    disabled={localQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input 
                      type="number" 
                      value={localQuantity} 
                      onChange={handleInputChange}
                      min={1}
                      max={stock}
                      className={cn(
                        "h-9 text-center font-semibold pr-12",
                        exceedsStock && "border-destructive text-destructive focus-visible:ring-destructive"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                      {unit}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0" 
                    onClick={handleIncrement} 
                    disabled={localQuantity >= stock || isOutOfStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stock Warning */}
                <AnimatePresence>
                  {exceedsStock && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Melebihi stok tersedia ({stock} {unit})</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Low Stock Warning */}
                {isLowStock && !exceedsStock && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Stok terbatas</span>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="select-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <Button 
                  className={cn(
                    "w-full",
                    isOutOfStock && "cursor-not-allowed opacity-50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOutOfStock) onSelect();
                  }}
                  disabled={isOutOfStock}
                  color={recommended ? "default" : "secondary"}
                >
                  {isOutOfStock ? (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Stok Habis
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Pilih Obat
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
