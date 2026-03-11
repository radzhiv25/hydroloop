"use client";

import { PRODUCT_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts/keyboard-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, User } from "lucide-react";
import type { UserData } from "@/lib/types";

type NavbarProps = {
  userData: UserData | null;
  onOpenSettings: () => void;
};

export function Navbar({ userData, onOpenSettings }: NavbarProps) {
  const name = userData?.name?.trim() || "Guest";
  const profileImage = userData?.profileImage
  console.log(profileImage);

  return (
    <header className="flex w-full items-center justify-between border-b border-border py-3 px-4">
      <span className="font-semibold text-foreground font-archivo">
        {PRODUCT_NAME}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-archivo hidden sm:inline">
          {name}
        </span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {profileImage ? (
            <img
              src={profileImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <KeyboardShortcuts />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-1.5">
            Settings <Kbd>⌘</Kbd> + <Kbd>S</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
