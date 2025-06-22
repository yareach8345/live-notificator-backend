import { z } from 'zod'
import { allowedEmails } from "../constants/authinfo.const";

export const UserInfoSchema = z.object({
  email: z.string().email().refine(val => allowedEmails.includes(val)),
  id: z.string(),
  displayName: z.string(),
  provider: z.string(),
})

export type UserInfo = z.infer<typeof UserInfoSchema>