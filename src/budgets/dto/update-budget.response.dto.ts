export class ResponseBudgetUpdateDto {
  status: number;
  data: {
    id: string;
    name: string;
    description?: string;
    amount: string;
    startDate: Date;
    endDate: Date;
    category: { id: string; name: string };
    earning: { id: string; name: string; amountBudgeted: string };
    user: { id: string; name: string };
  };
  message: string;
}
