import { Injectable } from '@nestjs/common';
import { OneSignalAppClient } from 'onesignal-api-client-core';

@Injectable()
export class NotificationService {
  private oneSignalClient: OneSignalAppClient;

  constructor() {
    this.oneSignalClient = new OneSignalAppClient(
      process.env.ONESIGNAL_API_KEY,
      process.env.ONESIGNAL_APP_ID,
    );
  }

  async sendNotification(
    userId: string,
    title: string,
    message: string,
  ): Promise<void> {
    try {
      await this.oneSignalClient.createNotification({
        headings: { en: title },
        contents: { en: message },
        include_external_user_ids: [userId],
      });
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Failed to send notification');
    }
  }
}
