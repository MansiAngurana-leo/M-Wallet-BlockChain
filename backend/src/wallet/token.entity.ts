import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  decimals: number;

  @Column()
  balance: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.tokens, { onDelete: 'CASCADE' })
  wallet: Wallet;
}
