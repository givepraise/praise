export const UtilsProvider = jest.fn().mockReturnValue({
  randomString: jest.fn().mockResolvedValue('1234567890'),
});
