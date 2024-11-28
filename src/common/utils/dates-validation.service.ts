import { Injectable } from '@nestjs/common';

@Injectable()
export class DatesValidationService {
  // verify dates of start and end
  validateAndSetEndDate(startDate: Date, endDate?: Date): { startDate: Date, endDate: Date } {
    if (!startDate) {
      throw new Error('The start date is required.');
    }

    if (!endDate) {
      // if there instance of endDate, set a moth after startDate
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // validate that endDate is greater than startDate
    if (endDate < startDate) {
      throw new Error('The date of start must be less than the date of end.');
    }

    // validate that the range of dates is a month or more
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    if (startMonth !== endMonth) {
      throw new Error('the range of dates must be a month or more.');
    }

    return { startDate, endDate };
  }
}
