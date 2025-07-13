import { z } from 'zod'

export const UserInfoSchema = z.object({
  email: z.string().email(),
  id: z.string(),
  displayName: z.string(),
  provider: z.string(),
  picture: z.string().nullable()
})

export type UserInfo = z.infer<typeof UserInfoSchema>