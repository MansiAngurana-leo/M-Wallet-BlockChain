import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';
import { Wallet } from './wallet/wallet.entity';
import { Token } from './wallet/token.entity'; 


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),

      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_DATABASE || 'wallet_db',
      entities: [Wallet, Token],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    WalletModule, 
  ],
})
export class AppModule {}
