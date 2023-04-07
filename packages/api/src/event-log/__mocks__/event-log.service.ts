export const EventLogService = jest.fn().mockReturnValue({
  logEvent: jest.fn().mockResolvedValue({}),
});
