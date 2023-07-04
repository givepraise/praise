import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { EmailTemplate } from './templates/EmailTemplateInterface';
import { logger } from '../shared/logger';

@Injectable()
export class EmailService {
  private readonly from: string;

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    this.from = process.env.SENDGRID_FROM_ADDRESS as string;
  }

  public async sendEmail(params: {
    to: string;
    template: EmailTemplate;
    payload: any;
  }) {
    const { to, template, payload } = params;
    const msg = {
      to,
      from: this.from,
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
  }

  public async sendWelcomeEmail(params: {
    to: string;
    payload: {
      name: string;
    };
  }) {
    const { to, payload } = params;
    const welcomeTemplate: EmailTemplate = {
      subject: 'Welcome to Our Service!',
      html: (payload: any) => `
        <h1>Welcome, ${payload.name}!</h1>
        <p>We are excited to have you on board.</p>
      `,
    };

    return this.sendEmail({
      to,
      template: welcomeTemplate,
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
    const communityCreatedTemplate: EmailTemplate = {
      subject: 'Congratulations for Creating a Community',
      html: (payload: any) => `
        <h1>Congratulations for creating, ${payload.communityName} community!</h1>
      `,
    };

    return this.sendEmail({
      to,
      template: communityCreatedTemplate,
      payload,
    });
  }
}
