import React, { useState } from 'react';
import axios from 'axios';

type Props = {
  walletAddress: string;
  setTokenBalance: (balance: string) => void;
  setWalletBalance: (balance: string) => void;

};

const AddToken: React.FC<Props> = ({ walletAddress }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');
  const [walletBalance, setWalletBalance] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const getTokenBalance = async () => {
    if (!walletAddress || !tokenAddress) {
      return alert('Enter wallet and token address');
    }

    try {
      const res = await axios.get(`${apiUrl}/wallet/token-info/${walletAddress}/${tokenAddress}`);
      alert(`Token: ${res.data.name} (${res.data.symbol}), Balance: ${res.data.balance}`);
      setTokenBalance(res.data.balance);
    } catch (error) {
      console.error('Failed to fetch token info:', error);
      alert('Failed to fetch token info');
    }
  };

  const getWalletBalance = async () => {
    const res = await axios.get(`${apiUrl}/wallet/wallet-balance/${walletAddress}`);
    setWalletBalance(res.data.balance); 
    setTokenBalance(''); 
  };

  return (
    <div className="card">
      <h2>Add/Search Token</h2>

      <input
        type="text"
        placeholder="Token Contract Address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        className="input"
      />
      <button onClick={getTokenBalance} className="button green">Check Token Balance</button>
      {tokenBalance && <p className="mt-4"><strong>Token Balance:</strong> {tokenBalance}</p>}

      <div className="card2">
        <input
          type="text"
          value={walletAddress}
          
          className="input"
        />
        <button onClick={getWalletBalance} className="button blue">Check Wallet Balance</button>
        {walletBalance && <p className="mt-4"><strong>Wallet Balance:</strong> {walletBalance}</p>}
      </div>
    </div>
  );
};

export default AddToken;

