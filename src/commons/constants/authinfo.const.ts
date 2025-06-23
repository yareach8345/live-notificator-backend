import { requireEnv } from "../utils/env.util";

interface AuthInfo {
  clientID: string
  clientSecret: string
  callbackURL: string
  scope: string[]
}

let googleOAuth2Info: AuthInfo | undefined = undefined

export const getGoogleOAuth2Info = () => {
  if(!googleOAuth2Info) {
    googleOAuth2Info = {
      clientID: requireEnv("GOOGLE_OAUTH2_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_OAUTH2_CLIENT_SECRET"),
      callbackURL: requireEnv("GOOGLE_OAUTH2_CALLBACK_URL"),
      scope: ['email', 'profile'],
    }
  }
  return googleOAuth2Info
}

let allowedEmails: string[] | undefined = undefined

export const getAllowedEmails = () => {
  if(!allowedEmails) {
    allowedEmails =
      requireEnv("ALLOWED_EMAILS")
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length !== 0)
  }
  return allowedEmails
}
