"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets } from "lucide-react";

type CustomEntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number) => void;
};

const quickAmounts = [100, 150, 200, 300, 400, 500, 750, 1000];

export function CustomEntryDialog({
  open,
  onOpenChange,
  onSubmit,
}: CustomEntryDialogProps) {
  const [amount, setAmount] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(amount, 10);
    if (!Number.isNaN(n) && n > 0) {
      onSubmit(n);
      onOpenChange(false);
    }
  };

  const handleQuickSelect = (value: number) => {
    onSubmit(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-archivo">
            <Droplets className="h-5 w-5 text-blue-500" />
            Custom Water Entry
          </DialogTitle>
          <DialogDescription>
            Enter a custom amount or select from quick options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ml)</Label>
            <Input
              ref={inputRef}
              id="amount"
              type="number"
              placeholder="e.g. 350"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={5000}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Quick select</Label>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(value)}
                  className="text-xs"
                >
                  {value >= 1000 ? `${value / 1000}L` : `${value}ml`}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || parseInt(amount, 10) <= 0}
            >
              Add Water
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
