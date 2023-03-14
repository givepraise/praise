export interface ErrorMessage {
  message: string;
  httpStatusCode: number;
  // This is a custom code that we can use to identify the error
  code: number;
}

// Move all hard coded error messages to this file
export const errorMessages: { [key: string]: ErrorMessage } = {
  COMMUNITY_NOT_FOUND: {
    message: 'Community not found',
    httpStatusCode: 404,
    code: 1001,
  },
  COMMUNITY_IS_ALREADY_ACTIVE :{
    message: 'Community is already active',
    httpStatusCode: 400,
    code:1002,
  }
};
