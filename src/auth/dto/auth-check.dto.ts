export interface AuthCheckDto {
  isAuthenticated: boolean
  email: string | null
  isValidUser: boolean
}