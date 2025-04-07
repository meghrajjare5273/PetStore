import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./_components/signin-form";
import { SignUpForm } from "./_components/signup-form";


export default function AuthPage() {
  return (
    <div className="mx-auto flex w-full flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome to Petopia</h1>
        <p className="text-muted-foreground">
          Sign in to your account or create a new one
        </p>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin" className="mt-4">
          <SignInForm />
        </TabsContent>
        <TabsContent value="signup" className="mt-4">
          <SignUpForm />
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="hover:text-primary underline underline-offset-4"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
