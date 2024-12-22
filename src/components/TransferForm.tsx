import { useState } from "react";
import { supplyChainContract, walletClient } from "@/utils/viemClient";

const TransferForm = () => {
  const [productId, setProductId] = useState<number>();
  const [newOwner, setNewOwner] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleTransfer = async () => {
    setStatus(""); // Reset status
  
    try {
      if (!productId || isNaN(productId) || !newOwner) {
        setStatus("Please enter a valid Product ID and new owner address.");
        return;
      }
  
      // Fetch connected account
      const addresses = await walletClient?.requestAddresses();
      if (!addresses || addresses.length === 0) {
        setStatus("No wallet connected.");
        return;
      }
  
      const currentAccount = addresses[0].toLowerCase(); // Convert to lowercase for comparison
  
      // Fetch product details
      const products = await supplyChainContract.getAllProducts();
      const product = products.find((p) => Number(p.id) === productId);
  
      if (!product) {
        setStatus("Product not found.");
        return;
      }
  
      if (product.currentOwner.toLowerCase() !== currentAccount) {
        setStatus("You are not the owner of this product.");
        return;
      }
  
      setStatus("Processing transfer, please wait...");
      const result = await supplyChainContract.transferOwnership(productId, newOwner);
  
      if (typeof result === "string") {
        // If the result is a string, it indicates an error message
        setStatus(result);
      } else {
        // Otherwise, it's a successful transaction hash
        setStatus(`Ownership transferred successfully! TxHash: ${result}`);
      }
    } catch (error: any) {
      console.error("Error transferring ownership:", error);
      setStatus(`Error: ${error.message || "Failed to transfer ownership"}`);
    }
  };
  

  return (
    <div>
      <div className="flex mb-4">
        <input
          className="border p-2 mr-2 flex-1 text-black"
          placeholder="Product ID"
          onChange={(e) => setProductId(Number(e.target.value))}
        />
        <input
          className="border p-2 mr-2 flex-1 text-black"
          placeholder="New Owner Address"
          onChange={(e) => setNewOwner(e.target.value)}
        />
        <button
          onClick={handleTransfer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Transfer Ownership
        </button>
      </div>

      {status && (
        <p
          className={`mt-2 ${
            status.includes("Error") || status.includes("not the owner") || status.includes("not found")
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default TransferForm;
