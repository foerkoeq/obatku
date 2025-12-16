"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MedicineCardProps {
  medicine: any; // Replace with proper type
  isSelected: boolean;
  quantity: number;
  onSelect: () => void;
  onQuantityChange: (qty: number) => void;
  recommended?: boolean;
}

export function MedicineCard({
  medicine,
  isSelected,
  quantity,
  onSelect,
  onQuantityChange,
  recommended
}: MedicineCardProps) {
  const stock = medicine.stock || 0; // Assume stock is available on medicine object
  const unit = medicine.unit || "pcs";
  
  const handleIncrement = () => {
    if (quantity < stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    } else {
      // If 1, maybe remove? Or just stay at 1.
      // Let's keep it at 1, removal is done by unselecting
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      onQuantityChange(val);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "h-full flex flex-col transition-all duration-200 cursor-pointer border-2",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/20",
        recommended ? "bg-green-50/50 dark:bg-green-900/10" : ""
      )}
      onClick={() => !isSelected && onSelect()}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-base line-clamp-2">{medicine.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{medicine.category}</p>
            </div>
            {recommended && (
              <Badge color="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                Rekomendasi
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-1">
          <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground">
            {/* Placeholder for Image */}
            <span className="text-xs">No Image</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Stok:</span>
            <span className={cn("font-medium", stock < 10 ? "text-red-500" : "")}>
              {stock} {unit}
            </span>
          </div>
          {medicine.activeIngredient && (
             <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
               {medicine.activeIngredient}
             </p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {isSelected ? (
            <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDecrement}>
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="flex-1 relative">
                  <Input 
                    type="number" 
                    value={quantity} 
                    onChange={handleInputChange}
                    className={cn("h-8 text-center", quantity > stock ? "border-red-500 text-red-500" : "")}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {unit}
                  </span>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrement} disabled={quantity >= stock}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {quantity > stock && (
                <div className="flex items-center gap-1 text-xs text-red-500 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Melebihi stok!</span>
                </div>
              )}
            </div>
          ) : (
            <Button className="w-full" color="secondary" onClick={onSelect}>
              Pilih Obat
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
