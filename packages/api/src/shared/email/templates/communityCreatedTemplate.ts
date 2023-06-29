import { EmailTemplate } from './EmailTemplateInterface';

export const communityCreatedTemplate: EmailTemplate = {
  subject: 'Congratulation for creatinf community',
  html: (payload: any) => `
    <h1>Congratulation for creating, ${payload.communityName} community!</h1>
  `,
};
