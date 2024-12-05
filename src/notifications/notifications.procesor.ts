import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('emails')
export class NotificationsProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send-email')
  async handleEmail(
    job: Job<{ to: string; subject: string; text: string }>,
  ): Promise<void> {
    const { to, subject, text } = job.data;
    await this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }
}
