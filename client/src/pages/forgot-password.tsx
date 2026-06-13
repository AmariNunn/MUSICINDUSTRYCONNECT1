import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Mic, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
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
            <h2 className="text-4xl font-bold text-gray-900">Forgot password?</h2>
            <p className="text-lg text-gray-600">We'll send a reset link to your email</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-semibold text-gray-800">
              {submitted ? "Check your email" : "Reset Password"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {submitted ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#c084fc]/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#c084fc]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">If that email is registered, a reset link is on its way.</p>
                  <p className="text-gray-500 text-sm">Check your inbox (and spam folder). The link expires in 1 hour.</p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-[#c084fc] hover:bg-[#c084fc]/90 h-12 text-lg font-medium" data-testid="button-back-to-login">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                              className="h-12 pl-10 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] bg-white/90"
                              data-testid="input-email"
                            />
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
                    data-testid="button-send-reset"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-[#c084fc] hover:text-[#c084fc]/80 hover:underline font-medium transition-colors duration-200 text-sm">
                      <ArrowLeft className="inline w-4 h-4 mr-1" />
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
