import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export interface Admin {
  id: number
  email: string
  fullName: string
}

export interface User {
  id: number
  email: string
  fullName: string | null
}

export const requestOtpSchema = z.object({
  email: z.string().email('Email invalide'),
})

export type RequestOtpFormData = z.infer<typeof requestOtpSchema>

export const verifyOtpSchema = z.object({
  email: z.string().email('Email invalide'),
  code: z.string().length(6, 'Le code doit faire 6 caractères'),
})

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>
