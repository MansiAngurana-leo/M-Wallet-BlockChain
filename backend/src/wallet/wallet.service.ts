
import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet as WalletEntity } from './wallet.entity';
import { ConfigService } from '@nestjs/config';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { formatEther, parseEther, formatUnits, parseUnits } from '@ethersproject/units';
import { getAddress } from '@ethersproject/address';
import { Contract } from 'ethers';
import { isAddress } from '@ethersproject/address';
// import { getAddress } from 'ethers';


@Injectable()
export class WalletService {
  private provider: JsonRpcProvider;

  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    private configService: ConfigService,
  ) {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    if (!rpcUrl) throw new Error('RPC_URL not set in .env');

    this.provider = new JsonRpcProvider(rpcUrl);
    console.log('Loaded RPC_URL:', rpcUrl);
  }

  async getLatestBlock() {
    return await this.provider.getBlock("latest");
  }

  // async createWallet(address: string, username: string): Promise<{ id: number; address: string; mnemonic: string }> {
  //   const wallet = Wallet.createRandom();
  //   const encryptedPrivateKey = await wallet.encrypt('password');

  //   const walletEntity = this.walletRepository.create({
  //     address: wallet.address,
  //     username,
  //     encryptedPrivateKey,
  //     mnemonic: wallet.mnemonic?.phrase || '',
  //     isActive: true,

  //   });

  //   const savedWallet = await this.walletRepository.save(walletEntity);
  //   return {
  //     id: savedWallet.id,
  //     address: savedWallet.address,
  //     mnemonic: savedWallet.mnemonic,
  //   };
  // }

  //**********************************************************************************************/
  // new code of createWallet

  async createWallet(
    address: string,
    username: string,
    mnemonic: string,
    encryptedPrivateKey: string
  ): Promise<{ id: number; address: string }> {
    // Input validation
    if (!address || !isAddress(address)) {
      throw new BadRequestException('Invalid wallet address');
    }
    if (!username || username.trim().length < 3) {
      throw new BadRequestException('Username must be at least 3 characters');
    }
    if (!encryptedPrivateKey) {
      throw new BadRequestException('Encrypted private key is required');
    }

    const normalizedAddress = getAddress(address);

    const existing = await this.walletRepository.findOne({ where: { address: normalizedAddress } });
    if (existing) {
      throw new BadRequestException('Wallet already exists');
    }

    const walletEntity = this.walletRepository.create({
      address: normalizedAddress,
      username: username.trim(),
      encryptedPrivateKey,
      isActive: true,
    });

    const saved = await this.walletRepository.save(walletEntity);
    return {
      id: saved.id,
      address: saved.address,
    };
  }

  
  async importWallet(mnemonic: string, username: string): Promise<{
    id: number; address: string;
    // mnemonic: string 

  }> {
    
    try {
      const wallet = Wallet.fromMnemonic(mnemonic.trim());
      const existingWallet = await this.walletRepository.findOne({ where: { address: wallet.address } });

      if (existingWallet) {

        return {
          id: existingWallet.id,
          address: existingWallet.address,
          // mnemonic: existingWallet.mnemonic,
        };
      }


      const encryptedPrivateKey = await wallet.encrypt('password');

      const walletEntity = this.walletRepository.create({
        address: wallet.address,
        username,
        encryptedPrivateKey,
        // mnemonic: wallet.mnemonic?.phrase || '',
        isActive: true,
      });

      const savedWallet = await this.walletRepository.save(walletEntity);

      return {
        id: savedWallet.id,
        address: savedWallet.address,
        // mnemonic: savedWallet.mnemonic,
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw new BadRequestException('Invalid mnemonic phrase or wallet already exists');
    }
  }


  async getTokenBalance(address: string, tokenAddress: string): Promise<{ name: string; symbol: string; decimals: number; balance: string }> {
    const tokenABI = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function balanceOf(address owner) view returns (uint256)',
    ];

    try {
      const cleanAddress = getAddress(address.trim());
      const cleanToken = getAddress(tokenAddress.trim());

      const contract = new Contract(cleanToken, tokenABI, this.provider);

      const [name, symbol, decimals, rawBalance] = await Promise.all([
        contract.name().catch(() => 'Unknown'),
        contract.symbol().catch(() => '???'),
        contract.decimals().catch(() => 18),
        contract.balanceOf(cleanAddress).catch(() => BigInt(0)),
      ]);

      const balance = formatUnits(rawBalance, decimals);
      return { name, symbol, decimals, balance };
    } catch (error) {
      console.error('Failed to fetch token details:', error);
      throw new BadRequestException('Invalid address or token');
    }
  }

  async getWalletBalance(address: string): Promise<{ balance: string }> {
    try {
      const cleanAddress = getAddress(address.trim());
      const balance = await this.provider.getBalance(cleanAddress);
      return {
        balance: formatEther(balance),
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new InternalServerErrorException('Failed to fetch wallet balance');
    }
  }

  async toggleWalletStatus(address: string, isActive: boolean) {
    const normalizedAddress = getAddress(address.trim());

    const result = await this.walletRepository.update(
      { address: normalizedAddress },
      { isActive }
    );

    if (result.affected === 0) {
      throw new NotFoundException('Wallet not found or address mismatch');
    }

    return { message: 'Wallet status updated' };
  }


  async createRawTransactionByAddress(address: string, to: string, value: string): Promise<string> {
    const walletEntity = await this.walletRepository.findOneOrFail({
      where: { address: address.toLowerCase() },
    });

    const decryptedWallet = await Wallet.fromEncryptedJson(
      walletEntity.encryptedPrivateKey,
      'password',
    );

    const wallet = decryptedWallet.connect(this.provider);
    const tx = {
      to: to.trim(),
      value: parseEther(value),
      gasLimit: 300,
      gasPrice: await this.provider.getGasPrice(),
      nonce: await this.provider.getTransactionCount(wallet.address),
      chainId: 11155111,
    };

    return wallet.signTransaction(tx);
  }

  async sendTransactionByAddress(address: string, to: string, value: string, gasPrice?: string, gasLimit?: string): Promise<any> {
    const walletEntity = await this.walletRepository.findOneOrFail({
      where: { address: address.toLowerCase() },
    });

    const decryptedWallet = await Wallet.fromEncryptedJson(
      walletEntity.encryptedPrivateKey,
      'password',
    );

    const wallet = decryptedWallet.connect(this.provider);

    const tx: any = {
      to: to.trim(),
      value: parseEther(value),
      gasLimit: gasLimit ? BigInt(gasLimit) : 21000n,
      gasPrice: gasPrice ? parseUnits(gasPrice, 'gwei') : await this.provider.getGasPrice(),
      nonce: await this.provider.getTransactionCount(wallet.address),
      chainId: 11155111,
    };

    const txResponse = await wallet.sendTransaction(tx);
    const receipt = await txResponse.wait();

    return {
      txHash: txResponse.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    };
  }
}

