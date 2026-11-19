import { z } from "zod";
import { isStrongPassword } from "@/lib/auth/password";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .pipe(z.email("Enter a valid email address, like name@school.com"));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

const newPassword = z
  .string()
  .min(1, "Choose a password")
  .refine(isStrongPassword, "Your password must meet every rule in the list");

export const signUpSchema = z
  .object({
    displayName: z.string().trim().max(60, "Keep your name under 60 characters"),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, "Type your password again"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match",
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, "Type your password again"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match",
  });
