import { sendEmail } from './sendEmail';
import { welcomeTemplate } from './templates/welcomeTemplate';

export const sendWelcomeEmail = async (params: {
  to: string;
  payload: {
    name: string;
  };
}) => {
  const { to, payload } = params;
  return sendEmail({
    to,
    template: welcomeTemplate,
    payload,
  });
};
