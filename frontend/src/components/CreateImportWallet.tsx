import React, { useState } from 'react';
import axios from 'axios';
import { Wallet as EthersWallet } from 'ethers';
import '../App.css';

type Props = {
  onWalletCreated: (address: string, mnemonic: string, username: string) => void

};

const CreateImportWallet: React.FC<Props> = ({ onWalletCreated }) => {
  const [view, setView] = useState<'create' | 'import' | null>(null);
  const [username, setUsername] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [walletData, setWalletData] = useState<{ address: string; mnemonic: string } | null>(null);
  type walletData = {
    address: string;
    mnemonic: string;
    balance?: string;
    WalletStatus?: string;
  };


  // const [walletData, setWalletData] = useState<walletData | null>();

  // const handleCreateWallet = async () => {
  //   if (!username.trim()) return alert('Username is required');

  //   try {
  //     const wallet = EthersWallet.createRandom();
  //     const mnemonicPhrase = wallet.mnemonic?.phrase || 'Mnemonic not available';
  //     const encryptedPrivateKey = await wallet.encrypt('password');

  //     const res = await axios.post('http://localhost:3001/wallet/create', {
  //       address: wallet.address,
  //       username: username.trim(),
  //       mnemonic: mnemonicPhrase,
  //       encryptedPrivateKey
  //     });


  //     const { address , mnemonic} = res.data;

  //     setWalletData({ address, mnemonic: mnemonicPhrase }); 
  //     // setWalletData({ address: res.data.address,
  //     //   mnemonic: mnemonic });
  //     onWalletCreated(address, mnemonicPhrase, username); 
  //     // onWalletCreated(res.data.address, res.data.mnemonic, username); 
  //     alert('Wallet created successfully!');
  //   } catch (error) {
  //     console.error('Error creating wallet:', error);
  //     alert('Wallet creation failed');
  //   }
  // };

  const handleCreateWallet = async () => {
    if (!username.trim()) {
      return alert('Username is required');
    }

    try {
      const wallet = EthersWallet.createRandom();
      const mnemonicPhrase = wallet.mnemonic?.phrase || 'Mnemonic not available';


      const encryptedPrivateKey = await wallet.encrypt('password');

      setWalletData({ address: wallet.address, mnemonic: mnemonicPhrase });

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      await axios.post(`${apiUrl}/wallet/create`, {
        address: wallet.address,
        username: username.trim(),
        mnemonic: mnemonicPhrase,
        encryptedPrivateKey,
      });

      onWalletCreated(wallet.address, mnemonicPhrase, username);
      alert('Wallet created successfully!');
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Wallet creation failed');
    }
  };

  const handleImportWallet = async () => {
    if (!mnemonic.trim()) return alert('Please enter a mnemonic');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/wallet/import`, {
        mnemonic: mnemonic.trim(),
        username: username.trim(),
      });
      setWalletData({
        address: response.data.address,
        mnemonic: mnemonic
      });

      onWalletCreated(response.data.address, response.data.mnemonic, username);
      alert('Wallet imported successfully!');
    } catch (error) {

      console.error('Import failed:', error);
      alert('Invalid mnemonic');
    }
  };

  return (

    <div className="card">
      <img
        src="metamask.svg"
        className="metamask-fox"
        alt="MetaMask"
      />
      <h2> Wallet</h2>
      {!view && (
        <div className="toggle-buttons">
          <button className="button blue" onClick={() => setView('create')}>Create Wallet</button>
          <button className="button green" onClick={() => setView('import')}>Import Wallet</button>
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

      {/* 
{walletData && (
  <div className="card wallet-summary">
           <h3>Wallet Summary</h3>
           <p><strong>Username:</strong> {username}</p>
         <p><strong>Address:</strong> {walletData.address}</p>
         <p><strong>Mnemonic:</strong> {walletData.mnemonic}</p>
       
         <p className="text-danger">⚠️ Please store your mnemonic securely.</p>
        </div>
)}  */}


      {walletData && (
        <div className="card wallet-summary">
          <h3>Wallet Summary</h3>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Address:</strong> {walletData.address}</p>


          {view === 'create' && (

            <p><strong>Mnemonic:</strong> {walletData.mnemonic}</p>
          )}

          <p className="text-danger">⚠️ Please store your mnemonic securely.</p>
        </div>
      )}

    </div>
  );
};

export default CreateImportWallet;
