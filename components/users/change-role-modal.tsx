"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/lib/types/user";
import { useState } from "react";
import { toast } from "sonner";

type ChangeRoleModalProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeRoleModal({
  user,
  open,
  onOpenChange,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user?.role);

  if (!user) return null;

  const handleRoleChange = () => {
    toast.success(`Role for ${user.name} has been changed to ${selectedRole}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Select a new role for {user.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            defaultValue={user.role}
            onValueChange={(value: User["role"]) => setSelectedRole(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="PPL">PPL</SelectItem>
              <SelectItem value="Dinas">Dinas</SelectItem>
              <SelectItem value="POPT">POPT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRoleChange}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 