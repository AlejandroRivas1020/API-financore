import { Budget } from 'src/budgets/entities/budget.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('Transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'money' })
  amount: number;

  @JoinColumn({ name: 'budget_id' })
  @ManyToOne(() => Budget)
  budget: Budget;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
