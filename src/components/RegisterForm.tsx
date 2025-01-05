import { useEffect, useState } from "react";
import { supplyChainContract, waitForTransaction } from "@/utils/viemClient";
import { uploadToIPFS } from "@/utils/ipfs";

const RegisterForm = () => {
  const [id, setId] = useState<number | undefined>();
  const [name, setName] = useState<string>("");
  const [batch, setBatch] = useState<number | undefined>();
  const [metadata, setMetadata] = useState<File | null>(null);
  const [distributor, setDistributor] = useState<string>("");
  const [consumer, setConsumer] = useState<string>("");
  const [payment, setPayment] = useState<number | undefined>();
  const [bonus, setBonus] = useState<number | undefined>();
  const [bonusDeadline, setBonusDeadline] = useState<string>("");
  const [finalDeadline, setFinalDeadline] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products from the contract on mount
  const fetchProducts = async () => {
    try {
      setStatus("Fetching products...");
      const fetchedProducts = await supplyChainContract.getAllProducts();
      if (fetchedProducts.length === 0) {
        console.log("No products registered yet.");
      }
      setProducts(fetchedProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error.message || error);
      setProducts([]); // Fallback to an empty array
    } finally {
      setStatus("");
    }
  };
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRegister = async () => {
    setStatus("");
    try {
      // Basic validations
      if (
        !id ||
        isNaN(id) ||
        id <= 0 ||
        !name ||
        !batch ||
        isNaN(batch) ||
        batch <= 0 ||
        !metadata ||
        !distributor ||
        !consumer ||
        !payment ||
        isNaN(payment) ||
        payment <= 0 ||
        !bonus ||
        isNaN(bonus) ||
        bonus <= 0 ||
        !bonusDeadline ||
        !finalDeadline
      ) {
        setStatus("All fields must be valid and filled.");
        return;
      }

      // Upload metadata to IPFS
      setStatus("Uploading metadata to IPFS...");
      const ipfsHash = await uploadToIPFS(metadata);
      console.log("File uploaded to IPFS with CID:", ipfsHash);

      const bonusDeadlineSec = Math.floor(new Date(bonusDeadline).getTime() / 1000);
      const finalDeadlineSec = Math.floor(new Date(finalDeadline).getTime() / 1000);

      console.log("Registering product with arguments:", {
        id,
        name,
        batch,
        distributor,
        consumer,
        payment,
        bonus,
        bonusDeadline: bonusDeadlineSec,
        finalDeadline: finalDeadlineSec,
        ipfsHash,
      });

      // Call contract
      setStatus("Registering product, please wait...");
      const txHash = await supplyChainContract.registerProduct({
        id,
        name,
        batch,
        distributor,
        consumer,
        paymentAmount: payment.toString(),
        bonusAmount: bonus.toString(),
        bonusDeadline: bonusDeadlineSec,
        finalDeadline: finalDeadlineSec,
        ipfsHash,
      });

      console.log("Transaction submitted, hash:", txHash);
      setStatus("Waiting for transaction confirmation...");

      // Wait for confirmation
      const receipt = await waitForTransaction(txHash);
      console.log("Transaction confirmed, receipt:", receipt);

      setStatus("Product registered successfully!");
      fetchProducts(); // Refresh
    } catch (error: any) {
      console.error("Error during registration:", error.message || error);
      setStatus(`Error: ${error.message || "Registration failed"}`);
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-lg">
    <h2 className="text-4xl font-extrabold mb-6 text-center text-gradient bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent pt-10">
      Register New Product
    </h2>
  
    <div className="flex flex-col gap-6">
      {/* Product Details */}
      <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Product Details
      </h3>
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        placeholder="Product ID"
        onChange={(e) => setId(Number(e.target.value))}
      />
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        placeholder="Product Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        placeholder="Batch Number"
        onChange={(e) => setBatch(Number(e.target.value))}
      />
      <input
        className="border p-3 rounded bg-gray-900 text-white"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => setMetadata(e.target.files?.[0] || null)}
      />
  
      {/* Address Section */}
      <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Address Details
      </h3>
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        placeholder="Distributor Address"
        onChange={(e) => setDistributor(e.target.value)}
      />
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        placeholder="Consumer Address"
        onChange={(e) => setConsumer(e.target.value)}
      />
  
      {/* Payment Section */}
      <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Payment Details
      </h3>
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        placeholder="Payment Amount (ETH)"
        onChange={(e) => setPayment(Number(e.target.value))}
      />
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        placeholder="Bonus Amount (ETH)"
        onChange={(e) => setBonus(Number(e.target.value))}
      />
  
      {/* Deadline Section */}
      <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Deadline Details
      </h3>
      <label className="block text-gray-400">
        Bonus Deadline
        <span className="block text-sm text-gray-500">
          Deliver before this time to receive the bonus.
        </span>
      </label>
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        type="datetime-local"
        onChange={(e) => setBonusDeadline(e.target.value)}
      />
  
      <label className="block text-gray-400">
        Final Deadline
        <span className="block text-sm text-gray-500">
          Deliver after this time, and you’ll receive only 75% of the payment.
        </span>
      </label>
      <input
        className="border p-3 rounded bg-gray-900 text-white placeholder-gray-400"
        type="datetime-local"
        onChange={(e) => setFinalDeadline(e.target.value)}
      />
    </div>
  
    {/* Submit Button */}
    <button
      onClick={handleRegister}
      className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white px-6 py-3 rounded-lg hover:from-fuchsia-500 hover:to-cyan-300 transition font-medium mt-6"
    >
      Register Product
    </button>
  
    {status && (
      <p
        className={`mt-4 ${
          status.includes("Error") ? "text-red-500" : "text-green-500"
        }`}
      >
        {status}
      </p>
    )}
  
    {/* Registered Products */}
    <h3 className="text-3xl font-bold mt-10 mb-4 text-gradient bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
  Registered Products
</h3>
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-600 rounded-lg bg-gray-900">
        <thead>
          <tr className="bg-gray-900 text-gray-300">
            <th className="border text-gray-400 border-gray-700 p-3">ID</th>
            <th className="border text-gray-400 border-gray-700 p-3">Name</th>
            <th className="border text-gray-400 border-gray-700 p-3">Batch</th>
            <th className="border text-gray-400 border-gray-700 p-3">Manufactured Date</th>
            <th className="border text-gray-400 border-gray-700 p-3">Owner</th>
            <th className="border text-gray-400 border-gray-700 p-3">Metadata</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index} className="hover:bg-gray-900 transition">
                <td className="border border-gray-700 p-3 text-gray-300">{product.id.toString()}</td>
                <td className="border border-gray-700 p-3 text-gray-300">{product.name}</td>
                <td className="border border-gray-700 p-3 text-gray-300">{product.batch.toString()}</td>
                <td className="border border-gray-700 p-3 text-gray-300">
                  {new Date(Number(product.manufacturedDate) * 1000).toLocaleString()}
                </td>
                <td className="border border-gray-700 p-3 text-gray-300">
                  {product.ownershipHistory?.length > 0
                    ? product.ownershipHistory[product.ownershipHistory.length - 1]
                    : "Unknown"}
                </td>
                <td className="border border-gray-700 p-3 text-gray-300">
                  {product.ipfsHash ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${product.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      View Metadata
                    </a>
                  ) : (
                    "No Metadata"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="border p-3 text-center text-gray-400 border-gray-700">
                No registered products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default RegisterForm;
