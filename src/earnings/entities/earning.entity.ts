import { BaseEntity } from 'src/common/entities/base.entity';
import { Budget } from './../../badgets/entities/budget.entity';
import { BeforeInsert, Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';

@Entity('Earnings')
export class Earning extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  startDate?: Date;

  @Column({ type: 'date' })
  endDate?: Date;
  
  @Column({ type: 'money' })
  generalAmount: number;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  
  @OneToMany(() => Budget, (budget) => budget.earning)
  budgets: Budget[]
  
    @BeforeInsert()
    setEndDate() {
      if (this.startDate) {
        const endDate = new Date(this.startDate);
        endDate.setDate(endDate.getDate() + 30);
        this.endDate = endDate;
      }
    }
    // 
}
