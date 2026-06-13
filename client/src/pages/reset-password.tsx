import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Mic, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setTokenError("No reset token found. Please request a new password reset link.");
    } else {
      setToken(t);
    }
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          toast({ title: "Password updated!", description: "You can now sign in with your new password." });
          setLocation("/login");
        }, 2000);
      } else {
        const err = await res.json();
        setTokenError(err.message || "Something went wrong. Please try again.");
      }
    } catch {
      setTokenError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <div className="flex items-center justify-center space-x-3 mb-8 group cursor-pointer">
              <div className="w-14 h-14 bg-[#c084fc] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Mic className="text-white w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-[#c084fc]">Music Industry Connect</h1>
            </div>
          </Link>
          <div className="space-y-2 mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              {success ? "Password updated!" : "Choose a new password"}
            </h2>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-semibold text-gray-800">
              {tokenError ? "Link problem" : success ? "All done!" : "Reset Password"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {tokenError ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <p className="text-gray-700">{tokenError}</p>
                <Link href="/forgot-password">
                  <Button className="w-full bg-[#c084fc] hover:bg-[#c084fc]/90 h-12 text-lg font-medium" data-testid="button-request-new-link">
                    Request a new reset link
                  </Button>
                </Link>
                <div className="text-center">
                  <Link href="/login" className="text-[#c084fc] hover:underline text-sm font-medium">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : success ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#c084fc]/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#c084fc]" />
                  </div>
                </div>
                <p className="text-gray-700">Your password has been updated. Redirecting you to sign in…</p>
                <div className="w-6 h-6 border-2 border-[#c084fc] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="At least 6 characters"
                              {...field}
                              className="h-12 pr-10 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] bg-white/90"
                              data-testid="input-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="Repeat your new password"
                              {...field}
                              className="h-12 pr-10 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] bg-white/90"
                              data-testid="input-confirm-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowConfirm(!showConfirm)}
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-[#c084fc] hover:bg-[#c084fc]/90 h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading}
                    data-testid="button-set-password"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </div>
                    ) : (
                      "Set New Password"
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-[#c084fc] hover:underline text-sm font-medium">
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
