"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { API_ENDPOINTS } from "@/lib/config";
import {
  post,
  ApiError,
  setAccessToken,
  type LoginResponse,
  setRefreshToken,
} from "@/lib/api";

interface LoginFormData {
  username: string;
  password: string;
  two_fa_code: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    two_fa_code: "",
  });
  const [show2FA, setShow2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError(null);
  };

  const handleOTPChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      two_fa_code: value,
    }));
    setError(null);
  };

  const toggle2FA = () => {
    setShow2FA(!show2FA);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        username: formData.username,
        password: formData.password,
      };

      if (show2FA && formData.two_fa_code) {
        payload.two_fa_code = formData.two_fa_code;
      }

      const response: LoginResponse = await post(API_ENDPOINTS.LOGIN, payload);

      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);

      if (show2FA && formData.two_fa_code) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/2fa";
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 17007 || err.code === 17008) {
          setShow2FA(true);
          setError(err.message || "需要 2FA 验证");
        } else {
          setError(err.message || "登录失败");
        }
      } else {
        setError("发生未知错误，请稍后重试");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">管理后台 · Login</h1>
          <p className="text-muted-foreground text-sm text-balance">
            在下方输入您的管理员账号以登录
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="username">账号</FieldLabel>
          <Input
            id="username"
            placeholder="账号名"
            value={formData.username}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">密码</FieldLabel>
            <button
              type="button"
              onClick={toggle2FA}
              className="ml-auto text-sm underline-offset-4 hover:underline"
              disabled={isLoading}
            >
              {show2FA ? "取消 2FA 验证" : "需要 2FA 验证?"}
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </Field>

        {show2FA && (
          <Field>
            <FieldLabel htmlFor="otp">2FA-Code</FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              value={formData.two_fa_code}
              onChange={handleOTPChange}
              disabled={isLoading}
            >
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              请输入您的6位数字代码
            </FieldDescription>
          </Field>
        )}

        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
