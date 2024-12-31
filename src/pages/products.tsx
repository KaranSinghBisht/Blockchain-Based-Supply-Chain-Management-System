import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { supplyChainContract , walletClient } from "@/utils/viemClient";
import QRCodeModal from "@/components/QRCodeModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State to manage the modal
  const [modal, setModal] = useState<{ productId: number | null; action: string | null }>({
    productId: null,
    action: null,
  });
  const [qrModal, setQrModal] = useState<{ productId: number | null }>({
    productId: null,
  });
  const [history, setHistory] = useState<string[]>([]);
  const [transferAddress, setTransferAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const data = await supplyChainContract.getAllProducts();
      console.log("Fetched Products:", data);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    } 
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchOwnershipHistory = async (productId: number) => {
    try {
      const ownershipHistory = await supplyChainContract.getOwnershipHistory(productId);
      setHistory(ownershipHistory);
    } catch (error) {
      console.error("Error fetching ownership history:", error);
      setHistory([]);
    }
  };

  const handleTransferOwnership = async (productId: number) => {
    try {
      setStatus(""); // Clear previous status
      if (!transferAddress) {
        setStatus("Please enter a valid address.");
        return;
      }
  
      // Fetch the connected wallet address
      const addresses = await walletClient?.requestAddresses();
      if (!addresses || addresses.length === 0) {
        setStatus("No wallet connected.");
        return;
      }
  
      const currentAccount = addresses[0].toLowerCase(); // Convert to lowercase for comparison
  
      // Check if the user is the current owner of the product
      const product = products.find((p) => p.id === productId);
      if (!product) {
        setStatus("Product not found.");
        return;
      }
  
      if (product.currentOwner.toLowerCase() !== currentAccount) {
        setStatus("You are not the owner of this product.");
        return;
      }
  
      // Proceed with the transfer
      setStatus("Processing transfer, please wait...");
      const result = await supplyChainContract.transferOwnership(productId, transferAddress);
      setStatus(`Ownership transferred successfully! TxHash: ${result}`);
    } catch (error: any) {
      console.error("Error transferring ownership:", error);
      setStatus(`Error: ${error.message || "Failed to transfer ownership"}`);
    }
  };
  

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-black min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Products</h1>

        {loading && (
          <p className="text-center text-gray-500 text-lg animate-pulse">Loading products...</p>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center text-gray-500 text-lg">No products found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Name: {product.name}</h2>
                <p className="text-gray-100 mb-1">ID: {product.id}</p>
                <p className="text-gray-100 mb-1">Batch: {product.batch}</p>
                <p className="text-gray-100 mb-1">
                  Manufactured:{" "}
                  {new Date(Number(product.manufacturedDate) * 1000).toLocaleString()}
                </p>
                <p className="text-gray-100 mb-1">Owner: {product.currentOwner}</p>
                <p className="text-gray-100 mb-1">Distributor: {product.distributor || "Unknown"}</p>
                <p className="text-gray-100 mb-1">Consumer: {product.consumer || "Unknown"}</p>
              </div>
              <button
                onClick={() => setModal({ productId: product.id, action: null })}
                className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white px-6 py-3 rounded-lg hover:from-fuchsia-500 hover:to-cyan-300 transition font-medium mt-6"
              >
                Actions
              </button>
              
            </div>
          ))}
        </div>
      </div>

      {/* Main Modal */}
        {modal.productId && modal.action === null && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-center">
                Actions for Product #{modal.productId}
              </h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${products.find((p) => p.id === modal.productId)?.ipfsHash}`,
                      "_blank"
                    )
                  }
                  className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  View Metadata
                </button>
                <button
                  onClick={() => {
                    fetchOwnershipHistory(modal.productId!);
                    setModal({ productId: modal.productId, action: "history" });
                  }}
                  className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Check Ownership History
                </button>
                <button
                  onClick={() => setModal({ productId: modal.productId, action: "transfer" })}
                  className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Transfer Ownership
                </button>
                <button
                onClick={() => setQrModal({ productId: modal.productId })}
                className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white px-6 py-3 rounded-lg font-medium"
              >
                Generate QR Code
              </button>
                <button
                  onClick={() => setModal({ productId: null, action: null })}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ownership History Modal */}
        {modal.productId && modal.action === "history" && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-center">
                Ownership History for Product #{modal.productId}
              </h2>
              <ul className="list-disc pl-6 text-gray-100 space-y-2 max-h-64 overflow-y-auto">
                {history.length > 0 ? (
                  history.map((owner, index) => (
                    <li key={index} className="break-words text-sm">
                      {owner}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-100">No history found.</p>
                )}
              </ul>
              <button
                onClick={() => setModal({ productId: modal.productId, action: null })}
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600 transition duration-200"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Transfer Ownership Modal */}
        {modal.productId && modal.action === "transfer" && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-center">
                Transfer Ownership for Product #{modal.productId}
              </h2>
              <input
                type="text"
                placeholder="New Owner Address"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleTransferOwnership(modal.productId!)}
                className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white px-6 py-3 rounded-lg font-medium w-full"
              >
                Transfer Ownership
              </button>
              
          
              <button
                onClick={() => setModal({ productId: modal.productId, action: null })}
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded w-full hover:bg-blue-600 transition duration-200"
              >
                Back
              </button>
            </div>
          </div>
        )}
         {/* QR Code Modal */}
      {qrModal.productId && (
        <QRCodeModal
          productId={qrModal.productId}
          productData={products.find((p) => p.id === qrModal.productId)}
          onClose={() => setQrModal({ productId: null })}
        />
      )}
    </div>
  );
}