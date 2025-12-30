import { z } from 'zod'
import type { Player } from '../registration/types'

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
  firstName: string | null
  lastName: string | null
  phone: string | null
  isProfileComplete: boolean
  players?: Player[]
}

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit faire au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom contient des caractères invalides'),
  lastName: z
    .string()
    .min(2, 'Le nom doit faire au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),
  phone: z.string().regex(/^0[1-9][0-9]{8}$/, 'Format de téléphone invalide (ex: 0612345678)'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const requestOtpSchema = z.object({
  email: z.string().email('Email invalide'),
})

export type RequestOtpFormData = z.infer<typeof requestOtpSchema>

export const verifyOtpSchema = z.object({
  email: z.string().email('Email invalide'),
  code: z.string().length(6, 'Le code doit faire 6 caractères'),
})

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>
