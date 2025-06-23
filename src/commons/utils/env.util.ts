import { MissingEnvException } from "../exceptions/missing-env.exception";

export function requireEnv(name: string) {
  const val = process.env[name]
  if (!val) throw new MissingEnvException(name)
  else return val
}