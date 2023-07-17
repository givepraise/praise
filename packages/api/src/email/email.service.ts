import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { logger } from '../shared/logger';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';

@Injectable()
export class EmailService {
  private readonly from: string;

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    this.from = process.env.SENDGRID_FROM_ADDRESS as string;
  }

  public async sendEmail(params: {
    to: string;
    templateId: string;
    payload: any;
    subject: string;
  }) {
    const { to, templateId, payload, subject } = params;
    const msg: MailDataRequired = {
      from: this.from,
      templateId,
      subject,
      personalizations: [
        {
          to,
          dynamicTemplateData: payload,
        },
      ],
    };
    try {
      await sgMail.send(msg);
      logger.info('Email sent', params);
    } catch (error) {
      logger.error(`Send email error ${error}`, params);
    }
  }

  public async sendWelcomeEmail(params: {
    to: string;
    payload: {
      name: string;
    };
  }) {
    const { to, payload } = params;
    const templateId = 'welcomeTemplate';

    return this.sendEmail({
      to,
      templateId,
      subject: 'Welcome to the community!',
      payload,
    });
  }

  public async sendCommunityCreatedEmail(params: {
    to: string;
    payload: {
      communityName: string;
    };
  }) {
    const { to, payload } = params;
    const templateId = 'communityCreatedTemplate';
    const subject = 'Congratulations for Creating a Community';

    return this.sendEmail({
      subject,
      templateId,
      payload,
      to,
    });
  }
}
