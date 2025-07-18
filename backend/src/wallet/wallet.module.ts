// src/wallet/wallet.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Token } from './token.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Token])],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
