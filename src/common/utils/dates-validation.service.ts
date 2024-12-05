import { Injectable } from '@nestjs/common';

@Injectable()
export class DatesValidationService {
  // verify dates of start and end
  validateAndSetEndDate(
    startDate: Date | string,
    endDate?: Date | string,
  ): { startDate: Date; endDate: Date } {
    // Convertir strings a instancias de Date
    if (typeof startDate === 'string') {
      startDate = new Date(startDate);
    }
  
    if (typeof endDate === 'string') {
      endDate = new Date(endDate);
    }
  
    // Validar si las fechas son válidas
    if (isNaN(startDate.getTime())) {
      throw new Error('The start date is invalid.');
    }
  
    if (endDate && isNaN(endDate.getTime())) {
      throw new Error('The end date is invalid.');
    }
  
    if (!endDate) {
      // Si no se proporciona un endDate, calcular un mes después de startDate
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }
  
    if (endDate < startDate) {
      throw new Error('The start date must be less than the end date.');
    }
  
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
  
    if (startMonth === endMonth) {
      throw new Error('The date range must be at least one month.');
    }
  
    return { startDate, endDate };
  }
  
}
