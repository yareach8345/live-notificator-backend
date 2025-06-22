import { requireEnv } from "../utils/env.util";

export const googleOAuth2Info = {
  clientID: requireEnv("GOOGLE_OAUTH2_CLIENT_ID"),
  clientSecret: requireEnv("GOOGLE_OAUTH2_CLIENT_SECRET"),
  callbackURL: requireEnv("GOOGLE_OAUTH2_CALLBACK_URL"),
  scope: ['email', 'profile'],
}

export const allowedEmails =
  requireEnv("ALLOWED_EMAILS")
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length !== 0)
