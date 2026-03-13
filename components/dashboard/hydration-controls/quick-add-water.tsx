"use client";

import { useState } from "react";
import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { QUICK_ADD_AMOUNTS, DRINK_TYPES } from "@/constants/hydration";

type QuickAddWaterProps = {
  /** (amount, time?, drinkType?) */
  onAdd: (amount: number, time?: string, drinkType?: string) => void;
};

export function QuickAddWater({ onAdd }: QuickAddWaterProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("250");
  const [selectedType, setSelectedType] = useState<string>("water");
  const [customType, setCustomType] = useState<string>("water");
  const [customName, setCustomName] = useState("");

  const handleAdd = (amount: number, drinkType?: string) => {
    onAdd(amount, undefined, drinkType ?? selectedType);
  };

  const handleCustomSubmit = () => {
    const n = parseInt(customAmount, 10);
    if (!Number.isNaN(n) && n > 0) {
      const drinkType =
        customType === "other" && customName.trim()
          ? customName.trim()
          : customType;
      onAdd(n, undefined, drinkType);
      setCustomOpen(false);
      setCustomAmount("250");
      setCustomType(selectedType);
      setCustomName("");
    }
  };

  const defaultAmountForType = DRINK_TYPES.find((t) => t.id === selectedType)?.defaultAmount ?? 250;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground">
        Quick add
      </p>
      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {DRINK_TYPES.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap gap-2">
        {QUICK_ADD_AMOUNTS.map((amount) => (
          <motion.div
            key={amount}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAdd(amount)}
              className="gap-1.5"
            >
              <Droplets className="h-3.5 w-3.5" />
              {amount} ml
            </Button>
          </motion.div>
        ))}
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCustomType(selectedType);
              setCustomAmount(String(defaultAmountForType));
              setCustomOpen(true);
            }}
            className="gap-1.5"
            aria-label="Custom amount"
          >
            <Plus className="h-3.5 w-3.5" />
            Custom
          </Button>
        </motion.div>
      </div>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add drink (ml)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Type</p>
            <Tabs value={customType} onValueChange={(v) => { setCustomType(v); if (v !== "other") setCustomName(""); }}>
              <TabsList className="grid w-full grid-cols-4">
                {DRINK_TYPES.map((t) => (
                  <TabsTrigger key={t.id} value={t.id} className="text-xs">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {customType === "other" && (
              <>
                <p className="text-xs text-muted-foreground">Custom name (optional)</p>
                <Input
                  placeholder="e.g. Matcha, Green tea"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="placeholder:text-muted-foreground/70"
                />
              </>
            )}
            <p className="text-xs text-muted-foreground">Amount (ml)</p>
            <Input
              type="number"
              min={1}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCustomSubmit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
