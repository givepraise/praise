import { Wallet } from 'ethers';
import { SuperTest, Test } from 'supertest';
import { AuthResponse } from '@/auth/types';

export const loginUser = async (
  wallet: Wallet,
  client: SuperTest<Test>
): Promise<AuthResponse> => {
  const response = await client.get(
    `/api/auth/nonce?identityEthAddress=${wallet.address}`
  );

  const message =
    'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
    `ADDRESS:\n${wallet.address}\n\n` +
    `NONCE:\n${response.body.nonce as string}`;

  const signature = await wallet.signMessage(message);

  const login_data = {
    identityEthAddress: wallet.address,
    signature: signature,
  };

  const response2 = await client
    .post('/api/auth/')
    .set('Accept', 'application/json')
    .send(login_data);

  const { accessToken, refreshToken, identityEthAddress, tokenType } =
    response2.body;

  return { accessToken, refreshToken, identityEthAddress, tokenType };
};

export const csvToJson = (csvString: string, delimiter = ','): object[] => {
  const csvRows: string[] = csvString.split('\n');
  const csvHeaders: string[] = csvRows[0]
    .split(delimiter)
    .map((header) => header.replace(/^"/g, '').replace(/"$/g, ''));
  const csvDataRows: string[] = csvRows.slice(1);

  const convertedJson = csvDataRows.map((row) => {
    const dataRow = row.split(',');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataObj: any = {};
    csvHeaders.forEach((header, i) => {
      dataObj[header] = dataRow[i].replace(/^"/g, '').replace(/"$/g, '');
    });

    return dataObj;
  });

  return convertedJson;
};
