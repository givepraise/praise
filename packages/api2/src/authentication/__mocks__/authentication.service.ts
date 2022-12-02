import { userStub } from '@/users/test/stubs/user.stub';

export const AuthenticationService = jest.fn().mockReturnValue({
  generateUserNonce: jest.fn().mockResolvedValue(userStub),
  login: jest.fn().mockResolvedValue('accessToken'),
});
