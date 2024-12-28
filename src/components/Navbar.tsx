import { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [ownershipDropdown, setOwnershipDropdown] = useState(false);

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
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <h1 className="text-xl font-bold">Supply Chain Tracker</h1>

        {/* Navigation Links */}
        <div className="flex space-x-6 items-center">
          {/* Products Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProductsDropdown(!productsDropdown)}
              className="flex items-center text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg"
            >
              Products
              <svg
                className="w-4 h-4 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l4 4 4-4" />
              </svg>
            </button>
            {productsDropdown && (
              <div className="absolute mt-2 bg-white text-gray-700 rounded-lg shadow-lg z-10 w-48">
                <ul>
                  <li>
                    <Link
                      href="/register"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setProductsDropdown(false)}
                    >
                      Register Product
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setProductsDropdown(false)}
                    >
                      View Products
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Ownership Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOwnershipDropdown(!ownershipDropdown)}
              className="flex items-center text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg"
            >
              Ownership
              <svg
                className="w-4 h-4 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l4 4 4-4" />
              </svg>
            </button>
            {ownershipDropdown && (
              <div className="absolute mt-2 bg-white text-gray-700 rounded-lg shadow-lg z-10 w-48">
                <ul>
                  <li>
                    <Link
                      href="/ownership"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setOwnershipDropdown(false)}
                    >
                      Ownership Confirmation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/transfer"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setOwnershipDropdown(false)}
                    >
                      Transfer Ownership
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/history"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setOwnershipDropdown(false)}
                    >
                      View History
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Connect */}
        <button
          onClick={connectWallet}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
