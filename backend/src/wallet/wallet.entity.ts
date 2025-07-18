import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Token } from './token.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // address: string;
  @Column({ type: 'varchar', length: 255, unique: true })
  address: string;

  @Column({ nullable: true })
  mnemonics: string;

  @Column()
  username: string;

  @Column({ type: 'longtext' })
  encryptedPrivateKey: string;



  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Token, (token) => token.wallet)
  tokens: Token[];
}
