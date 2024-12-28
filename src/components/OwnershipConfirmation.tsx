import { useEffect, useState } from "react";
import { supplyChainContract } from "@/utils/viemClient";
import { waitForTransaction } from "@/utils/viemClient";

const OwnershipConfirmation = ({ walletAddress }: { walletAddress: string }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const fetchConsumerProducts = async () => {
      try {
        const allProducts = await supplyChainContract.getAllProducts();
        const consumerProducts = allProducts.filter(
          (product) => product.consumer.toLowerCase() === walletAddress.toLowerCase()
        );
        setProducts(consumerProducts);
      } catch (error) {
        console.error("Error fetching consumer products:", error);
        setStatus("Error fetching consumer products");
      }
    };

    fetchConsumerProducts();
  }, [walletAddress]);

  const handleConfirmOwnership = async (id: number) => {
    try {
      setStatus("Confirming ownership...");
      const txHash = await supplyChainContract.confirmOwnership(id);
      console.log("Ownership confirmed, txHash:", txHash);

      const receipt = await waitForTransaction(txHash);
      console.log("Ownership confirmation receipt:", receipt);
      setStatus("Ownership confirmed successfully!");
    } catch (error: any) {
      console.error("Error confirming ownership:", error);
      setStatus(`Error: ${error.message || "Ownership confirmation failed"}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ownership Confirmation</h1>
      {status && <p className="text-red-500">{status}</p>}

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4">
            <h3 className="font-bold">{product.name}</h3>
            <p>ID: {product.id}</p>
            <p>Distributor: {product.distributor}</p>
            <p>Manufacturer: {product.manufacturer}</p>
            <p>Bonus Deadline: {new Date(product.bonusDeadline * 1000).toLocaleString()}</p>
            <p>Final Deadline: {new Date(product.finalDeadline * 1000).toLocaleString()}</p>
            <button
              className="bg-green-500 text-white px-2 py-1 rounded mt-2"
              onClick={() => handleConfirmOwnership(product.id)}
            >
              Confirm Ownership
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnershipConfirmation;
