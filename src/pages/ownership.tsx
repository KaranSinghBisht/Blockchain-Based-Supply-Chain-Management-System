import Navbar from "@/components/Navbar";
import OwnershipConfirmation from "@/components/OwnershipConfirmation";
import { useState } from "react";

const OwnershipPage = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");

  const handleWalletConnection = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded shadow-md w-full max-w-3xl">
          {walletAddress ? (
            <OwnershipConfirmation walletAddress={walletAddress} />
          ) : (
            <button
              onClick={handleWalletConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnershipPage;