"use client";

import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { ResetPasswordDialog } from "@/components/reset-password-dialog";

export default function LoginPage() {
  const [showResetPassword, setShowResetPassword] = useState(false);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login-background.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Guardian 管理后台
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline mt-4"
            >
              忘记密码？
            </button>
            <ResetPasswordDialog
              isOpen={showResetPassword}
              onClose={() => setShowResetPassword(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
