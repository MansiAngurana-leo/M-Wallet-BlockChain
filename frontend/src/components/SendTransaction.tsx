import React, { useState } from 'react';
import axios from 'axios';
import { isAddress } from 'ethers';
import '../App.css';

type Props = {
  walletAddress: string;
  setLastTxHash: React.Dispatch<React.SetStateAction<string>>;
  setBalance: React.Dispatch<React.SetStateAction<string>>;
};

const SendTransaction: React.FC<Props> = ({ walletAddress, setLastTxHash, setBalance }) => {
  const [toAddress, setToAddress] = useState('');
  const [value, setValue] = useState('');
  const [txHash, setTxHash] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const [gasLimit, setGasLimit] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const sendTransaction = async () => {
    if (!walletAddress) return alert("No wallet loaded. Please create or import one.");
    if (!value || isNaN(Number(value)) || Number(value) <= 0) return alert("Enter valid ETH amount");
    if (!toAddress || !isAddress(toAddress)) return alert("Enter valid recipient address");

    try {
      const response = await axios.post(`${apiUrl}/wallet/transaction/send-address/${walletAddress}`, {
        to: toAddress,
        value,
        gasPrice: gasPrice || undefined,
        gasLimit: gasLimit || undefined,
      });

      const hash = response.data.txHash;
      setTxHash(hash);
      setLastTxHash(hash);

      const balRes = await axios.get(`${apiUrl}/wallet/wallet-balance/${walletAddress}`);
      setBalance(balRes.data.balance);

      alert('Transaction sent successfully!');
    } catch (error) {
      console.error('Error sendin g transaction:', error);
      alert('Failed to send transaction');
    }
  };

  return (
    <div className="card">
      <h2>Send Transaction</h2>
      <input
        type="text"
        placeholder="Recipient Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Gas Price (Gwei, optional)"
        value={gasPrice}
        onChange={(e) => setGasPrice(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Gas Limit (optional)"
        value={gasLimit}
        onChange={(e) => setGasLimit(e.target.value)}
        className="input"
      />
      <button onClick={sendTransaction} className="button blue">Send Transaction</button>
      {txHash && (
        <p className="mt-4">
          <strong>Tx Hash:</strong>{' '}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            {txHash}
          </a>
        </p>
      )}
    </div>
  );
};

export default SendTransaction;
