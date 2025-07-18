import { Controller, Post, Get, Body, Param, Patch, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get('test-block')
  async getLatestBlock() {
    return await this.walletService.getLatestBlock();
  }

  // @Post('create')
  // async createWallet() {
  //   return this.walletService.createWallet();
  // }



  // @Post('create')
  // async create(@Body() body) {
  //   console.log('Creating wallet:', body);
  //   return this.walletService.createWallet(body.address, body.username);
  // }
  @Post('create')
  async create(@Body() body: {
    address: string;
    username: string;
    mnemonic: string;
    encryptedPrivateKey: string;
  }) {
    return this.walletService.createWallet(
      body.address,
      body.username,
      body.mnemonic,
      body.encryptedPrivateKey,
    );
  }




  // @Post('create')
  // async createWallet(@Body() body: { username: string }) {
  //   if (!body?.username) {
  //     throw new BadRequestException('Username is required');
  //   }
  //   return this.walletService.createWallet(body.username);
  // }


  @Post('import')
  async importWallet(@Body() body: { mnemonic: string; username: string }) {
    return this.walletService.importWallet(body.mnemonic, body.username);
  }

  @Get('token-info/:address/:tokenAddress')
  async getTokenInfo(
    @Param('address') address: string,
    @Param('tokenAddress') tokenAddress: string
  ) {
    return this.walletService.getTokenBalance(address, tokenAddress);
  }

  @Get('wallet-balance/:address')
  async getWalletBalance(@Param('address') address: string) {
    return this.walletService.getWalletBalance(address);
  }


  //   @Patch('toggle/:address')
  // async toggleWalletStatus(
  //   @Param('address') address: string,
  //   @Body() body: any,
  // ) {
  //   console.log('Received PATCH /wallet/toggle:', address, body); 
  //   const { isActive } = body;
  //   return this.walletService.toggleWalletStatus(address, isActive);
  // }


  @Patch('toggle/:address')
  async toggleWalletStatus(@Param('address') address: string, @Body() body: any) {
    console.log('---');
    console.log(`PATCH /wallet/toggle/${address}`);
    console.log(`Address: ${address}`);
    console.log(`Body: ${JSON.stringify(body)}`);
    console.log('---');
    return this.walletService.toggleWalletStatus(address, body.isActive);
  }


  @Post('transaction/raw-address/:address')
  async createRawTransactionByAddress(
    @Param('address') address: string,
    @Body('to') to: string,
    @Body('value') value: string,
  ) {
    return this.walletService.createRawTransactionByAddress(address, to, value);
  }

  @Post('transaction/send-address/:address')
  async sendTransactionByAddress(
    @Param('address') address: string,
    @Body('to') to: string,
    @Body('value') value: string,
    @Body('gasPrice') gasPrice?: string,
    @Body('gasLimit') gasLimit?: string,
  ) {
    return this.walletService.sendTransactionByAddress(address, to, value, gasPrice, gasLimit);
  }
}
