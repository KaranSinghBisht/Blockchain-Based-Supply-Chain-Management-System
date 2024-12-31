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
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Register New Product</h2>
      <div className="flex flex-col mb-4 gap-4">
        {/* Product Details */}
        <h3 className="text-lg font-bold">Product Details</h3>
        <input
          className="border p-2 text-black"
          placeholder="Product ID"
          onChange={(e) => setId(Number(e.target.value))}
        />
        <input
          className="border p-2 text-black"
          placeholder="Product Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 text-black"
          placeholder="Batch Number"
          onChange={(e) => setBatch(Number(e.target.value))}
        />
        <input
          className="border p-2 text-black"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setMetadata(e.target.files?.[0] || null)}
        />

        {/* Address Section */}
        <h3 className="text-lg font-bold">Address Details</h3>
        <input
          className="border p-2 text-black"
          placeholder="Distributor Address"
          onChange={(e) => setDistributor(e.target.value)}
        />
        <input
          className="border p-2 text-black"
          placeholder="Consumer Address"
          onChange={(e) => setConsumer(e.target.value)}
        />

        {/* Payment Section */}
        <h3 className="text-lg font-bold">Payment Details</h3>
        <input
          className="border p-2 text-black"
          placeholder="Payment Amount (ETH)"
          onChange={(e) => setPayment(Number(e.target.value))}
        />
        <input
          className="border p-2 text-black"
          placeholder="Bonus Amount (ETH)"
          onChange={(e) => setBonus(Number(e.target.value))}
        />

        {/* Deadline Section */}
        <h3 className="text-lg font-bold">Deadline Details</h3>
        <label className="block text-gray-700">
          Bonus Deadline
          <span className="block text-sm text-gray-500">
            Deliver before this time to receive the bonus.
          </span>
        </label>
        <input
          className="border p-2 text-black"
          type="datetime-local"
          onChange={(e) => setBonusDeadline(e.target.value)}
        />

        <label className="block text-gray-700">
          Final Deadline
          <span className="block text-sm text-gray-500">
            Deliver after this time, and you’ll receive only 75% of the payment.
          </span>
        </label>
        <input
          className="border p-2 text-black"
          type="datetime-local"
          onChange={(e) => setFinalDeadline(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Register Product
      </button>

      {status && (
        <p
          className={`mt-2 ${
            status.includes("Error") ? "text-red-500" : "text-green-500"
          }`}
        >
          {status}
        </p>
      )}

      {/* Registered Products */}
      <h3 className="text-xl font-bold mt-8 mb-2">Registered Products</h3>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Batch</th>
            <th className="border p-2">Manufactured Date</th>
            <th className="border p-2">Owner</th>
            <th className="border p-2">Metadata</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index}>
                <td className="border p-2">{product.id.toString()}</td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.batch.toString()}</td>
                <td className="border p-2">
                  {new Date(Number(product.manufacturedDate) * 1000).toLocaleString()}
                </td>
                <td className="border p-2">
                  {product.ownershipHistory?.length > 0
                    ? product.ownershipHistory[product.ownershipHistory.length - 1]
                    : "Unknown"}
                </td>
                <td className="border p-2">
                  {product.ipfsHash ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${product.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
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
              <td colSpan={6} className="border p-2 text-center">
                No registered products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RegisterForm;
