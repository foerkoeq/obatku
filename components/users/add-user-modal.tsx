"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userSchema } from "@/lib/validations/user";
import { cn } from "@/lib/utils";
import DatePicker from "@/components/ui/date-picker";
import { userService } from "@/lib/services/user.service";
import { useFormStore } from "@/hooks/use-form-store";

type AddUserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function AddUserModal({ open, onOpenChange, onSuccess }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setFormErrors, clearFormErrors } = useFormStore();
  
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      nip: "",
      email: "",
      phone: "",
      role: "PPL",
      birthDate: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof userSchema>) {
    try {
      setIsSubmitting(true);
      clearFormErrors();
      
      // Generate password from birth date
      const password = format(values.birthDate, "ddMMyy");
      
      // Prepare user data for backend
      const userData = {
        name: values.name,
        email: values.email || "",
        password: password,
        role: values.role,
        phone: values.phone,
        // Add additional fields that backend expects
        permissions: [], // Default permissions based on role
        isActive: true,
      };

      // Call backend API
      const response = await userService.createUser(userData);
      
      if (response.success) {
        toast.success("User created successfully!", {
          description: `Password for ${values.name} is ${password}`,
        });
        
        // Reset form and close modal
        form.reset();
        onOpenChange(false);
        
        // Trigger success callback to refresh data
        onSuccess?.();
      } else {
        toast.error("Failed to create user", {
          description: response.message || "An error occurred while creating the user",
        });
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Handle validation errors from backend
      if (error.errors && Array.isArray(error.errors)) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        
        // Set form errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as any, { message });
        });
        
        setFormErrors(fieldErrors);
      } else {
        // Handle general errors
        toast.error("Failed to create user", {
          description: error.message || "An error occurred while creating the user",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      clearFormErrors();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new user. The password will be
            generated from the date of birth (DDMMYY).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP/NIK</FormLabel>
                  <FormControl>
                    <Input placeholder="199001012020121001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select date of birth"
                      allowClear={true}
                      displayFormat="dd/MM/yyyy"
                      maxDate={new Date()} // Prevent future dates
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="PPL">PPL</SelectItem>
                      <SelectItem value="Dinas">Dinas</SelectItem>
                      <SelectItem value="POPT">POPT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Save User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 