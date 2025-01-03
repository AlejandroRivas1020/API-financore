import { BaseEntity } from 'src/common/entities/base.entity';
import { Budget } from '../../budgets/entities/budget.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DatesValidationService } from 'src/common/utils/dates-validation.service';

@Entity('Earnings')
export class Earning extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'money' })
  generalAmount: number;

  @Column({ type: 'money', default: 0 })
  amountBudgeted: number;

  @OneToMany(() => Budget, (budget) => budget.earning)
  budgets: Budget[];

  @ManyToOne(() => User, (user) => user.earnings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeInsert()
  @BeforeUpdate()
  validateAndSetEndDate() {
    const datesValidationService = new DatesValidationService();
    if (this.startDate) {
      const result = datesValidationService.validateAndSetEndDate(
        this.startDate,
        this.endDate,
      );
      this.startDate = result.startDate;
      this.endDate = result.endDate;
    }
  }
}
