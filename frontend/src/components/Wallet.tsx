import React, { useState } from 'react';
import axios from 'axios';
import { Wallet as EthersWallet } from 'ethers';
import '../App.css';

type Props = {
  onWalletCreated: (address: string, mnemonic: string, username: string) => void;
};

type WalletData = {
  address: string;
  mnemonic: string;
  balance?: string;
  WalletStatus?: string;
};


const Wallet: React.FC<Props> = ({ onWalletCreated }) => {
  const [view, setView] = useState<'create' | 'import' | null>(null);
  const [username, setUsername] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [walletData, setWalletData] = useState<WalletData | null>(null);

  const handleCreateWallet = async () => {
    if (!username.trim()) {
      return alert('Username is required');
    }

    try {
      const wallet = EthersWallet.createRandom();
      const mnemonicPhrase = wallet.mnemonic?.phrase || 'Mnemonic not available';
      setWalletData({ address: wallet.address, mnemonic: mnemonicPhrase });

      await axios.post('http://localhost:3001/wallet/register', {
        address: wallet.address,
        username,
      });

      onWalletCreated(wallet.address, mnemonicPhrase, username);
      alert('Wallet created successfully!');
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Wallet creation failed');
    }
  };

  const handleImportWallet = async () => {
    if (!mnemonic.trim()) return alert('Please enter a valid mnemonic');

    try {
      const response = await axios.post('http://localhost:3001/wallet/import', { mnemonic });
      setWalletData({
        address: response.data.address,
        mnemonic: response.data.mnemonic,
      });

      onWalletCreated(response.data.address, response.data.mnemonic, username);
      alert('Wallet imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Invalid mnemonic');
    }
  };

  return (
    <div className="app-container">
      <h1 className="heading">Wallet Setup</h1>

      {!view && (
        <div className="card">
          <h2>Get Started</h2>
          <div className="toggle-buttons">
            <button className="button blue" onClick={() => setView('create')}>Create Wallet</button>
            <button className="button green" onClick={() => setView('import')}>Import Wallet</button>
          </div>
        </div>
      )}

      {view === 'create' && (
        <div className="card">
          <h2>Create Wallet</h2>
          <input
            type="text"
            placeholder="Enter your username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="button blue" onClick={handleCreateWallet}>Generate Wallet</button>
        </div>
      )}

      {view === 'import' && (
        <div className="card">
          <h2>Import Wallet</h2>
          <input
            type="text"
            placeholder="Enter Mnemonic Phrase"
            className="input"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter your username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="button green" onClick={handleImportWallet}>Import Wallet</button>
        </div>
      )}

      {walletData && (
        <div className="card wallet-summary">
          <h3>Wallet Summary</h3>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Address:</strong> {walletData.address}</p>
          <p><strong>Mnemonic:</strong> {walletData.mnemonic}</p>
          <p><strong>Balance:</strong> {walletData.balance}</p>
          <p><strong>Active Status:</strong> {walletData.WalletStatus}</p>
          <p><strong>Send Transaction:</strong> {walletData.WalletStatus}</p>
          <p className="text-danger">⚠️ Please store your mnemonic securely.</p>
        </div>
      )}
    </div>
  );
};

export default Wallet;
