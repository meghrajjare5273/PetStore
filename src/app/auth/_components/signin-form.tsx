/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Define validation schema
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<SignInFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInFormValues | "form", string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const validateField = (field: keyof SignInFormValues, value: string) => {
    try {
      signInSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0].message,
        }));
      }
      return false;
    }
  };

  const handleChange = (field: keyof SignInFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    let isValid = true;
    Object.entries(formValues).forEach(([key, value]) => {
      const fieldValid = validateField(key as keyof SignInFormValues, value);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authClient.signIn.email(
        {
          email: formValues.email,
          password: formValues.password,
          callbackURL: "/store",
          rememberMe,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            router.push("/store");
          },
          onError: (ctx) => {
            setErrors((prev) => ({ ...prev, form: ctx.error.message }));
            setIsLoading(false);
          },
        }
      );

      if (error) {
        setErrors((prev) => ({ ...prev, form: error.message }));
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        form: error.message || "An error occurred during sign in",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-0">
          {errors.form && (
            <div className="text-destructive text-sm font-medium">
              {errors.form}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isLoading}
              className="h-12"
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-base">
                Password
              </Label>
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formValues.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={isLoading}
                className="h-12 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              disabled={isLoading}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
        </CardContent>
        <CardFooter className="px-0 pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base bg-primary"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
