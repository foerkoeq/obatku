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
import { useAuth } from "@/providers/auth.provider";

const schema = z.object({
  nip: z.string().min(1, { message: "NIP wajib diisi." }),
  password: z.string().min(1, { message: "Password wajib diisi." }),
  rememberMe: z.boolean().optional().default(false),
});

const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
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
      nip: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await login({
        nip: data.nip,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      
      // Show success toast
      toast.success("Berhasil masuk ke sistem");
    } catch (err: any) {
      // Error is already set in auth context, just show toast
      const errorMessage = error || err?.message || "NIP atau password salah";
      toast.error(errorMessage);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotModal(false);
    toast.success("Permintaan reset password telah dikirim ke admin");
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nip" className="font-medium text-default-600">
            NIP (Nomor Induk Pegawai)
          </Label>
          <Input
            size="lg"
            disabled={isLoading}
            {...register("nip")}
            type="text"
            id="nip"
            placeholder="Masukkan NIP"
            className={cn("", {
              "border-destructive": errors.nip,
            })}
          />
        </div>
        {errors.nip && (
          <div className="text-destructive mt-2 text-sm">
            {errors.nip.message}
          </div>
        )}

        <div className="mt-3.5 space-y-2">
          <Label htmlFor="password" className="mb-2 font-medium text-default-600">
            Password
          </Label>
          <div className="relative">
            <Input
              size="lg"
              disabled={isLoading}
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

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <Label htmlFor="rememberMe" className="text-sm text-default-600 cursor-pointer">
              Ingat saya
            </Label>
          </div>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-sm text-primary hover:underline font-medium"
          >
            Lupa Password?
          </button>
        </div>

        {error && (
          <div className="text-destructive text-sm mt-2 p-3 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <Button fullWidth disabled={isLoading} className="mt-6" type="submit">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Memproses..." : "Masuk"}
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
