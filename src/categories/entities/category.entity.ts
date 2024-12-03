import { User } from 'src/users/entities/user.entity';
import { Budget } from '../../budgets/entities/budget.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('Categories')
export class Category extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets: Budget[];

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
