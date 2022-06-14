import { AuthResponse } from 'types/dist/auth/types';
import { Wallet } from 'ethers';
import { SuperTest, Test } from 'supertest';

const loginUser = async (
  wallet: Wallet,
  client: SuperTest<Test>
): Promise<AuthResponse> => {
  const response = await client.get(
    `/api/auth/nonce?ethereumAddress=${wallet.address}`
  );

  const message =
    'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
    `ADDRESS:\n${wallet.address}\n\n` +
    `NONCE:\n${response.body.nonce as string}`;

  const signature = await wallet.signMessage(message);

  const login_data = {
    ethereumAddress: wallet.address,
    signature: signature,
  };

  const response2 = await client
    .post('/api/auth/')
    .set('Accept', 'application/json')
    .send(login_data);

  const { accessToken, refreshToken, ethereumAddress, tokenType } =
    response2.body;

  return { accessToken, refreshToken, ethereumAddress, tokenType };
};

export { loginUser };
