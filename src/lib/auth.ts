import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Define validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Add validation
    validate: {
      email: (email: typeof emailSchema) => {
        try {
          emailSchema.parse(email);
          return { success: true };
        } catch (error) {
          if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
          }
          return { success: false, error: "Invalid email" };
        }
      },
      password: (password: typeof passwordSchema) => {
        try {
          passwordSchema.parse(password);
          return { success: true };
        } catch (error) {
          if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
          }
          return { success: false, error: "Invalid password" };
        }
      },
      name: (name: typeof nameSchema) => {
        try {
          nameSchema.parse(name);
          return { success: true };
        } catch (error) {
          if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
          }
          return { success: false, error: "Invalid name" };
        }
      },
    },
  },
  session: {
    // Set session expiration to 7 days
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
  },
});
