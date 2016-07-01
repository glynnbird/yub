declare module "yub" {
  interface YubResponse {
    t?: string | Date,
    otp: string,
    nonce?: any,
    sl?: string,
    status?: any,
    signatureVerified: boolean,
    nonceVerified: boolean,
    identity?: string,
    encrypted: string,
    encryptedHex: string,
    serial?: number,
    valid: boolean
  }

  interface YubCallback {
    (err: Error, response: YubResponse)
  }

  export function init(client_id: string, secret_key: string) : void;
  export function verify(otp: string, callback: YubCallback) : void;
  export function verifyOffline(otp: string, callback: YubCallback) : void;
}
