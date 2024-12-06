import { Injectable } from '@nestjs/common';
import { OneSignalAppClient } from 'onesignal-api-client-core';
import axios from 'axios';

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
    const data = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_external_user_ids: [userId],
      headings: { en: title },
      contents: { en: message },
      data: {
        customKey: 'customValue',
      },
    };

    try {
      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        data,
        {
          headers: {
            Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Notification sent successfully:', response.data);
    } catch (error) {
      console.error(
        'Error sending notification:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to send notification');
    }
  }
}
