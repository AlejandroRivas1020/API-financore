import { Budget } from 'src/budgets/entities/budget.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Earning } from 'src/earnings/entities/earning.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', length: 10 })
  phone: string;

  @Column({ type: 'text', name: 'profile_picture' })
  profilePicture: string;

  @OneToMany(() => Earning, (earning) => earning.user)
  earnings: Earning[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];
}
