import sgMail from '@sendgrid/mail';
import { EmailTemplate } from './templates/EmailTemplateInterface';
import { logger } from '../logger';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendEmail = async (params: {
  to: string;
  template: EmailTemplate;
  payload: any;
}) => {
  const { to, template, payload } = params;
  const from = process.env.SENDGRID_FROM_ADDRESS as string;
  const msg = {
    to,
    from,
    subject: template.subject,
    html: template.html(payload),
  };
  try {
    await sgMail.send(msg);
    logger.info('Email sent', {
      to,
      subject: template.subject,
    });
  } catch (error) {
    logger.error(`Send email error ${error}`, {
      to,
      subject: template.subject,
    });
  }
};
