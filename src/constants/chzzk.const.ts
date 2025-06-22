import { requireEnv } from '../utils/env.util'

interface ChzzkConnectOptions {
  nidAuth: string
  nidSession: string
}

let chzzkConnectOptions: ChzzkConnectOptions | undefined = undefined

export const getChzzkConnectOptions = () => {
  if (!chzzkConnectOptions) {
    chzzkConnectOptions = {
      nidAuth: requireEnv("NID_AUT"),
      nidSession: requireEnv("NID_SES"),
    }
  }
  return chzzkConnectOptions
}