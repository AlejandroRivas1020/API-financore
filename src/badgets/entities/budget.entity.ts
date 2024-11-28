import { Earning } from './../../earnings/entities/earning.entity';
import { Category } from './../../categories/entities/category.entity';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

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

  @Column({ type: 'date' })
  endDate?: Date;

  @ManyToOne(() => Category, (category) => category.budgets)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Earning, (earning) => earning.budgets)
  @JoinColumn({ name: 'earning_id' })
  earning: Earning;  

  @BeforeInsert()
  setEndDate() {
    if (this.startDate) {
      const endDate = new Date(this.startDate);
      endDate.setDate(endDate.getDate() + 30);
      this.endDate = endDate;
    }
  }
}
