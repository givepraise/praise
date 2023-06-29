export interface EmailTemplate {
  subject: string;
  html: (payload: any) => string;
}
