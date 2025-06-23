import { MissingEnvException } from "../exceptions/missing-env.exception";

export function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new MissingEnvException(name)
  else return val
}

export function requireEnvArray(name: string, delimiter: string = ',') {
  return requireEnv(name)
    .split(delimiter)
    .map(e => e.trim())
    .filter(e => e !== '')
}