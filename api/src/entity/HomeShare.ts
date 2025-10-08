import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Home } from './Home.js';
import { User } from './User.js';

@Entity({ name: 'home_shares' })
export class HomeShare {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Home, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'home_id' })
  home!: Home;

  @Column({ name: 'home_id', type: 'uuid' })
  homeId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer!: User;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId!: string;

  @Column({ type: 'jsonb' })
  scope!: Record<string, unknown>;

  @Column({ name: 'thread_id', type: 'uuid', nullable: true })
  threadId!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export default HomeShare;
