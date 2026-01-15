"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { API_ENDPOINTS } from "@/lib/config";
import { postWithAuth, ApiError, type TwoFASetupResponse } from "@/lib/api";

export function Step2FA() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [setupData, setSetupData] = useState<TwoFASetupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: TwoFASetupResponse = await postWithAuth(
        API_ENDPOINTS.TWO_FACTOR_SETUP,
      );
      setSetupData(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "设置 2FA 失败");
      } else {
        setError("发生未知错误");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsDisabling(true);
    setError(null);

    try {
      await postWithAuth(API_ENDPOINTS.TWO_FACTOR_DISABLE);
      router.push("/dashboard");
    } catch (err) {
      router.push("/dashboard");
      // if (err instanceof ApiError) {
      //   setError(err.message || "禁用 2FA 失败");
      // } else {
      //   setError("发生未知错误");
      // }
    } finally {
      setIsDisabling(false);
    }
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const getQRCodeUrl = (url: string) => {
    if (url.startsWith("data:image")) {
      return url;
    }
    return `data:image/png;base64,${url}`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">设置 2FA 验证</h1>
          <p className="text-muted-foreground text-sm text-balance">
            为您的账户启用双因素认证，提高账户安全性
          </p>
        </div>

        {!setupData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>设置 2FA</CardTitle>
                <CardDescription>
                  启用双因素认证以保护您的账户安全
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  使用 Google Authenticator、Authy 等 TOTP
                  应用扫描二维码或输入密钥
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleSetup}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "正在设置..." : "设置 2FA"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>稍后再设置</CardTitle>
                <CardDescription>
                  您可以稍后进入设置页面配置 2FA
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  您可以在任何时间返回此页面设置 2FA 验证
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isDisabling}
                  className="w-full"
                >
                  {isDisabling ? "跳过中..." : "稍后再设置"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        {setupData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>密钥与备用码</CardTitle>
                <CardDescription>请妥善保存这些信息</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <Field>
                  <FieldLabel>密钥 (Secret)</FieldLabel>
                  <FieldDescription className="font-mono text-xs break-all bg-muted p-3 rounded-md">
                    {setupData.secret}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>备用验证码</FieldLabel>
                  <FieldDescription className="text-xs">
                    每个验证码只能使用一次：
                  </FieldDescription>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {setupData.backup_codes.map((code, index) => (
                      <div
                        key={index}
                        className="font-mono text-xs bg-muted p-2 rounded-md text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </Field>

                <FieldDescription className="text-xs">
                  ⚠️ 重要提示：
                  <br />
                  1. 使用 TOTP 应用扫描二维码或手动输入密钥
                  <br />
                  2. 备用验证码只能在无法使用 TOTP 应用时使用
                  <br />
                  3. 请将备用验证码保存在安全的地方
                </FieldDescription>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleComplete}
                  className="w-full"
                >
                  设置完成进入主页
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isDisabling}
                  className="w-full"
                >
                  {isDisabling ? "跳过中..." : "稍后再设置（会禁用 2FA）"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>扫描二维码</CardTitle>
                <CardDescription>使用您的 TOTP 应用扫描</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="bg-white p-4 rounded-md flex items-center justify-center min-h-[300px]">
                  <img
                    src={getQRCodeUrl(setupData.qr_code_url)}
                    alt="2FA QR Code"
                    className="w-full h-auto max-w-[300px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
