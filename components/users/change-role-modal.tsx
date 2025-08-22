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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { userService } from "@/lib/services/user.service";

type ChangeRoleModalProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function ChangeRoleModal({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<User["role"] | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selected role when user changes
  useEffect(() => {
    if (user && open) {
      setSelectedRole(user.role);
    }
  }, [user, open]);

  if (!user) return null;

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === user.role) {
      onOpenChange(false);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await userService.updateUser(user.id, {
        role: selectedRole,
      });
      
      if (response.success) {
        toast.success(`Role for ${user.name} has been changed to ${selectedRole}`);
        onOpenChange(false);
        onSuccess?.(); // Trigger callback to refresh data
      } else {
        toast.error("Failed to change role", {
          description: response.message || "An error occurred while changing the role",
        });
      }
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast.error("Failed to change role", {
        description: error.message || "An error occurred while changing the role",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedRole(user.role);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Select a new role for {user.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedRole}
            onValueChange={(value: User["role"]) => setSelectedRole(value)}
            disabled={isSubmitting}
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
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRoleChange}
            disabled={isSubmitting || !selectedRole || selectedRole === user.role}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 