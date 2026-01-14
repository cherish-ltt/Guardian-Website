import { Step2FA } from "@/components/step-2FA"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Step2FA />
      </div>
    </div>
  )
}
