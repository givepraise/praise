export interface AuthRequestBody {
  ethereumAddress: string;
  message: string;
  signature: string;
}

export interface AuthResponse {
  accessToken: string;
  ethereumAddress: string;
  tokenType: string;
}

export type NonceQuery = {
  ethereumAddress: string;
};

export interface NonceResponse {
  ethereumAddress: string;
  nonce: string;
}
