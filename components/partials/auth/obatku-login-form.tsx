"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

const schema = z.object({
  email: z.string().email({ message: "Email tidak valid." }),
  password: z.string().min(4, { message: "Password minimal 4 karakter." }),
});

const LoginForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const togglePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      try {
        // Simulasi login - nanti akan diganti dengan API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect ke dashboard berdasarkan role (sementara ke dashboard biasa)
        window.location.href = "/dashboard";
        toast.success("Berhasil masuk ke sistem");
      } catch (err: any) {
        toast.error("Email atau password salah");
      }
    });
  };

  const handleForgotPassword = () => {
    setShowForgotModal(false);
    toast.success("Permintaan reset password telah dikirim ke admin");
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium text-default-600">
            Email/Username
          </Label>
          <Input
            size="lg"
            disabled={isPending}
            {...register("email")}
            type="email"
            id="email"
            placeholder="Masukkan email atau username"
            className={cn("", {
              "border-destructive": errors.email,
            })}
          />
        </div>
        {errors.email && (
          <div className="text-destructive mt-2 text-sm">
            {errors.email.message}
          </div>
        )}

        <div className="mt-3.5 space-y-2">
          <Label htmlFor="password" className="mb-2 font-medium text-default-600">
            Password
          </Label>
          <div className="relative">
            <Input
              size="lg"
              disabled={isPending}
              {...register("password")}
              type={passwordType}
              id="password"
              className="peer pr-12"
              placeholder="Masukkan password"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
              onClick={togglePasswordType}
            >
              {passwordType === "password" ? (
                <Eye className="w-5 h-5 text-default-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-default-400" />
              )}
            </div>
          </div>
        </div>
        {errors.password && (
          <div className="text-destructive mt-2 text-sm">
            {errors.password.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-sm text-primary hover:underline font-medium"
          >
            Lupa Password?
          </button>
        </div>

        <Button fullWidth disabled={isPending} className="mt-6">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      {/* Modal Lupa Password */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Untuk keamanan sistem, password hanya dapat direset oleh administrator.</p>
              <p>Dengan menekan tombol "Kirim Permintaan", admin akan segera mereset password Anda dan mengirimkan password baru melalui kontak yang terdaftar.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowForgotModal(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={handleForgotPassword}
              className="flex-1"
            >
              Kirim Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;
