import { BaseEntity } from 'src/common/entities/base.entity';
import { Budget } from '../../budgets/entities/budget.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Inject } from '@nestjs/common';
import { DatesValidationService } from 'src/common/utils/dates-validation.service';

@Entity('Earnings')
export class Earning extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'money' })
  generalAmount: number;

  @OneToMany(() => Budget, (budget) => budget.earning)
  budgets: Budget[];

  @ManyToOne(() => User, (user) => user.earnings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor(
    @Inject(DatesValidationService)
    private readonly datesValidationService: DatesValidationService,
  ) {
    super();
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateAndSetEndDate() {
    if (this.startDate) {
      const result = this.datesValidationService.validateAndSetEndDate(
        this.startDate,
        this.endDate,
      );
      this.startDate = result.startDate;
      this.endDate = result.endDate;
    }
  }
}
