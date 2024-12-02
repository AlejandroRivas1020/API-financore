import { Budget } from 'src/budgets/entities/budget.entity';
import { BaseEntity, Column, JoinColumn, ManyToOne } from 'typeorm';

export class Transaction extends BaseEntity {
  @Column({ type: 'money' })
  amount: number;

  @JoinColumn({ name: 'budget_id' })
  @ManyToOne(() => Budget)
  budget: Budget;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
