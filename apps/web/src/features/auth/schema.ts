import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[0-9]/, "One number");

export const registerFormSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
