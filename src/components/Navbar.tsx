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
    <nav className="fixed w-full z-50 bg-black backdrop-blur-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-blue-500 text-transparent bg-clip-text">
            SupplySync
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/register" className="text-gray-300 hover:text-white transition-colors">
            Register Product
          </Link>
          <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
            View Products
          </Link>
        </div>

        {/* Wallet Connect Button */}
        <button
          onClick={connectWallet}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-400 hover:from-fuchsia-500 hover:to-cyan-300 transition-all font-medium text-gray-100"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
