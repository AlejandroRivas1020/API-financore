import { Earning } from '../../earnings/entities/earning.entity';
import { Category } from '../../categories/entities/category.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { DatesValidationService } from 'src/common/utils/dates-validation.service';

@Entity('Budgets')
export class Budget extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description?: string;

  @Column({ type: 'money' })
  amount: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @ManyToOne(() => Category, (category) => category.budgets)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Earning, (earning) => earning.budgets)
  @JoinColumn({ name: 'earning_id' })
  earning: Earning;

  @ManyToOne(() => User, (user) => user.budgets)
  @JoinColumn({ name: 'user_id' })
  user: User;
  amountSpent: number;

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
