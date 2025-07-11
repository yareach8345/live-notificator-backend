export interface AuthCheckDto {
  isAuthenticated: boolean
  user? :Express.User
}