import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Petopia",
  description: "Sign up or sign in to your Petopia account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  );
}
