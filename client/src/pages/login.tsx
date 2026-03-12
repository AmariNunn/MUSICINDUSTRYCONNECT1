
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useLocation } from "wouter";
import { LogIn, Mic, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Authenticate user with email and password
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      
      if (response.ok) {
        const user = await response.json();
        // Store user ID in localStorage for session management
        localStorage.setItem('currentUserId', user.id.toString());
        localStorage.setItem('currentUserEmail', user.email);
        toast({
          title: "Welcome back!",
          description: `Signed in as ${user.pkaName || user.firstName}`,
        });
        // Redirect to home (which shows user's profile) after login
        setLocation('/home');
      } else {
        const error = await response.json();
        toast({
          title: "Sign in failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/">
            <div className="flex items-center justify-center space-x-3 mb-8 group cursor-pointer">
              <div className="w-14 h-14 bg-[#c084fc] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Mic className="text-white w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-[#c084fc]">
                Music Industry Connect
              </h1>
            </div>
          </Link>
          <div className="space-y-2 mb-8">
            <h2 className="text-4xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-lg text-gray-600">Sign in to your account to continue your journey</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-semibold text-gray-800">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] bg-white/90 backdrop-blur-sm transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            className="h-12 pr-10 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] bg-white/90 backdrop-blur-sm transition-all duration-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <a href="#" className="text-[#c084fc] hover:text-[#c084fc]/80 hover:underline transition-colors duration-200 font-medium">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#c084fc] hover:bg-[#c084fc]/90 h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/join" className="text-[#c084fc] hover:text-[#c084fc]/80 hover:underline font-medium transition-colors duration-200">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
