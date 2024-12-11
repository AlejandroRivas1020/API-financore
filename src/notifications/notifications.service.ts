import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectQueue('emails') private readonly emailQueue: Queue,
  ) {}

  async sendEmail(payload: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
  }

  async queueEmail(payload: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    await this.emailQueue.add('send-email', payload);
  }
}
