import { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <h1 className="text-xl font-bold">Supply Chain Tracker</h1>
        <div className="space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/register" className="hover:underline">
            Register Product
          </Link>
          <Link href="/transfer" className="hover:underline">
            Transfer Ownership
          </Link>
          <Link href="/history" className="hover:underline">
            View History
          </Link>
        </div>
      </div>
      <button
        onClick={connectWallet}
        className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
      >
        {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : "Connect Wallet"}
      </button>
    </nav>
  );
};

export default Navbar;
