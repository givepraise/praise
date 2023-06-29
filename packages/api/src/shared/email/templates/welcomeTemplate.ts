import { EmailTemplate } from './EmailTemplateInterface';

export const welcomeTemplate: EmailTemplate = {
  subject: 'Welcome to Our Service!',
  html: (payload: any) => `
    <h1>Welcome, ${payload.name}!</h1>
    <p>We are excited to have you on board.</p>
  `,
};
