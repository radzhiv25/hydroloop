"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { getOrCreateUserData, saveUserData } from "@/lib/storage";

const schema = z.object({
  name: z.string().optional(),
  profileImage: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type WelcomeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function WelcomeDialog({
  open,
  onOpenChange,
  onComplete,
}: WelcomeDialogProps) {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { name: "", profileImage: "" },
  });

  const onSubmit = (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    const data = getOrCreateUserData();
    const v = parsed.data;
    const next = {
      ...data,
      name: v.name ?? data.name,
      profileImage: v.profileImage ?? data.profileImage,
    };
    saveUserData(next);
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Set up your profile (optional). You can change this later in
            settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="welcome-name">Name</Label>
            <Input
              id="welcome-name"
              placeholder="Your name"
              {...register("name")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="welcome-profileImage">Profile image URL</Label>
            <Input
              id="welcome-profileImage"
              type="url"
              placeholder="https://..."
              {...register("profileImage")}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
