
import React, { useState } from 'react';
import './App.css';
import CreateImportWallet from './components/CreateImportWallet';
// import Wallet from './components/Wallet';
import AddToken from './components/AddToken';
import WalletStatus from './components/WalletStatus';
import SendTransaction from './components/SendTransaction';

import axios from 'axios';


const App: React.FC = () => {
  const [view, setView] = useState<'create-import' | 'wallet' | 'token' | 'status' | 'send'>('create-import');
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const [mnemonic, setMnemonic] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [lastTxHash, setLastTxHash] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');

  const handleWalletCreated = async (address: string, mnemonic: string, username: string) => {
    setWalletAddress(address);
    setMnemonic(mnemonic);
    setUsername(username);
    setView('wallet');
  
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const res = await axios.get(`${apiUrl}/wallet/wallet-balance/${address}`);
      setBalance(res.data.balance);
      setWalletBalance(res.data.balance); 
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('N/A'); 
      setWalletBalance('N/A'); 
    }
  };

  return (
    <div className="app-wrapper">
      {walletAddress && (
        <div className="sidebar">
          <h3>Wallet Summary</h3>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Address:</strong> {walletAddress}</p>
          {/* <p><strong>Mnemonic:</strong> {mnemonic}</p> */}
          <p><strong>TokenBalance:</strong> {balance || 'N/A'}</p>
          <p><strong>WalletBalance:</strong> {walletBalance}</p>

          <p><strong>Active Status:</strong> {isActive ? 'Active' : 'Inactive'}</p>
          <p><strong>Last Tx Hash:</strong> {lastTxHash || 'N/A'}</p>
          <p className="text-danger">Save this info securely</p>
        </div>
      )}

     
      <div className="app-container">
        <h1 className="heading"> Web3 Wallet</h1>

       
        <div className="toggle-buttons">
          {/* <button className="button blue" onClick={() => setView('create-import')}>Create/Import</button> */}
          <button className="button green" onClick={() => setView('wallet')}>Wallet</button>
          <button className="button yellow" onClick={() => setView('token')}>Add Token</button>
          <button className="button gray" onClick={() => setView('status')}>Wallet Status</button>
          <button className="button red" onClick={() => setView('send')}>Send</button>
        </div>

       
        {view === 'create-import' && (
          <CreateImportWallet onWalletCreated={handleWalletCreated} />
        )}
        {view === 'wallet' && <CreateImportWallet onWalletCreated={handleWalletCreated} />}

        {view === 'token' && (
  <AddToken
    walletAddress={walletAddress}
    setTokenBalance={setTokenBalance}
    setWalletBalance={setWalletBalance}  
  />
)}

        {view === 'send' && (
  <SendTransaction
    walletAddress={walletAddress}
    setLastTxHash={setLastTxHash}
    setBalance={setBalance}
  />
)}

        {view === 'status' && (
          <WalletStatus
            walletAddress={walletAddress}
            isActive={isActive}
            setIsActive={setIsActive}
          />
        )}
    
      </div>
    </div>
  );
};

export default App;
 