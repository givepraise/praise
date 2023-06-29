import { sendEmail } from './sendEmail';
import { communityCreatedTemplate } from './templates/communityCreatedTemplate';

export const sendCommunityCreatedEmail = async (params: {
  to: string;
  payload: {
    communityName: string;
  };
}) => {
  const { to, payload } = params;
  return sendEmail({
    to,
    template: communityCreatedTemplate,
    payload,
  });
};
