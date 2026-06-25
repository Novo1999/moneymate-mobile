import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  money: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Pick a category'),
  note: z.string().optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export const accountSchema = z.object({
  name: z.string().min(1, 'Enter a name'),
  balance: z.string().optional(),
})
export type AccountFormValues = z.infer<typeof accountSchema>

export const transferSchema = z.object({
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  note: z.string().optional(),
})
export type TransferFormValues = z.infer<typeof transferSchema>
