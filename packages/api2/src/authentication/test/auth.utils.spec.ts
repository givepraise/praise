import { generateLoginMessage } from '../authentication.utils';

describe('generateLoginMessage', () => {
  it('should be defined', () => {
    const msg =
      'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
      `ADDRESS:\n0x123\n\n` +
      `NONCE:\n456`;

    expect(generateLoginMessage('0x123', '456')).toEqual(msg);
  });
});
