import { z } from 'zod'

export const authSchema = z
  .object({
    mode: z.enum(['signin', 'signup']),
    name: z.string().optional(),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
    currency: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.mode === 'signup') {
      if (!values.name || values.name.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'Enter your full name' })
      }
      if (!values.currency) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['currency'], message: 'Pick a currency' })
      }
      if (values.confirmPassword !== values.password) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Passwords do not match' })
      }
    }
  })

export type AuthFormValues = z.infer<typeof authSchema>
