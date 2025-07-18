import React from 'react';
import axios from 'axios';
import '../App.css';

type Props = {
  walletAddress: string;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
};

const WalletStatus: React.FC<Props> = ({ walletAddress, isActive, setIsActive }) => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const toggleWalletStatus = async (newStatus: boolean) => {
    if (!walletAddress) return alert("Wallet address not set");
  
    try {
      await axios.patch(`${apiUrl}/wallet/toggle/${walletAddress.toLowerCase()}`, {
        isActive: newStatus,
      });
      
  
      setIsActive(newStatus);  
      alert(`Wallet set to ${newStatus ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error toggling wallet status:', error);
      alert('Failed to toggle wallet status');
    }
  };
  
  return (
    <div className="card">
      <h2>Wallet Status</h2>
      <button onClick={() => toggleWalletStatus(true)} className="button yellow">Activate Wallet</button>
      <button onClick={() => toggleWalletStatus(false)} className="button red mt-4">Deactivate Wallet</button>
    </div>
  );
};


export default WalletStatus;
