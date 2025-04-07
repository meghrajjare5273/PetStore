/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Partial<SignUpFormValues>>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormValues, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateField = (field: keyof SignUpFormValues, value: any) => {
    try {
      signUpSchema.shape[field].parse(value);
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

  const handleChange = (field: keyof SignUpFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const formData = {
      ...formValues,
      terms: termsAccepted,
    } as SignUpFormValues;
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      const fieldValid = validateField(key as keyof SignUpFormValues, value);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authClient.signUp.email(
        {
          email: formValues.email!,
          password: formValues.password!,
          name: formValues.name!,
          callbackURL: "/store",
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            router.push("/auth?tab=signin");
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
        form: error.message || "An error occurred during sign up",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-0">
          {errors.terms && (
            <div className="text-destructive text-sm font-medium">
              {errors.terms}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formValues.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isLoading}
              className="h-12"
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formValues.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isLoading}
              className="h-12"
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formValues.password || ""}
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
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                setTermsAccepted(checked as boolean);
                handleChange("terms", checked);
              }}
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the Terms & Conditions
            </label>
          </div>
          {errors.terms && (
            <p className="text-destructive text-sm">{errors.terms}</p>
          )}
        </CardContent>
        <CardFooter className="px-0 pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base bg-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
