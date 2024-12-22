import { useEffect, useState } from "react";
import { supplyChainContract, waitForTransaction } from "@/utils/viemClient";

const RegisterForm = () => {
  const [id, setId] = useState<number | undefined>();
  const [name, setName] = useState<string>("");
  const [batch, setBatch] = useState<number | undefined>();
  const [status, setStatus] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);

  // Fetch Products from the Contract
  const fetchProducts = async () => {
    try {
      const allProducts = await supplyChainContract.getAllProducts();
      setProducts(allProducts); // Set the products state
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRegister = async () => {
    setStatus(""); // Reset status
    try {
      if (!id || isNaN(id) || id <= 0 || !name || !batch || isNaN(batch) || batch <= 0) {
        setStatus("All fields must be valid and filled.");
        return;
      }

      // Trigger the contract call
      setStatus("Registering product, please wait...");
      const txHash = await supplyChainContract.registerProduct(id, name, batch);

      console.log("Transaction Hash:", txHash);
      await waitForTransaction(txHash);

      setStatus("Product registered successfully!");
      fetchProducts(); // Refresh product list
    } catch (error: any) {
      console.error("Error registering product:", error);
      setStatus(`Error: ${error.message || "Registration failed"}`);
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          className="border p-2 mr-2 flex-1 text-black"
          placeholder="ID"
          onChange={(e) => setId(Number(e.target.value))}
        />
        <input
          className="border p-2 mr-2 flex-1 text-black"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 flex-1 text-black"
          placeholder="Batch"
          onChange={(e) => setBatch(Number(e.target.value))}
        />
      </div>
      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Register Product
      </button>
      {status && (
        <p className={`mt-2 ${status.includes("Error") ? "text-red-500" : "text-green-500"}`}>
          {status}
        </p>
      )}

      <h3 className="text-xl font-bold mt-8 mb-2">Registered Products</h3>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Batch</th>
            <th className="border p-2">Manufactured Date</th>
            <th className="border p-2">Owner</th>
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
                <td className="border p-2">{product.currentOwner}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="border p-2 text-center">
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
