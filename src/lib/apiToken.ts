let token: string | null = null

export function setApiToken(value: string | null) {
  token = value
}

export function getApiToken() {
  return token
}
