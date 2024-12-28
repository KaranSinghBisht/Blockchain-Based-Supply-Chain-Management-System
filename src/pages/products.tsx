// pages/products.tsx
import Navbar from '../components/Navbar';
import { useEffect, useState } from "react";
import { supplyChainContract } from "@/utils/viemClient";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const data = await supplyChainContract.getAllProducts();
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

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
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
              className="border border-gray-200 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Name: {product.name}</h2>
                <p className="text-gray-600 mb-1">ID: {product.id}</p>
                <p className="text-gray-600 mb-1">Batch: {product.batch}</p>
                <p className="text-gray-600 mb-1">
                  Manufactured:{" "}
                  {new Date(Number(product.manufacturedDate) * 1000).toLocaleString()}
                </p>
                <p className="text-gray-600 mb-1">Owner: {product.currentOwner}</p>
              </div>
              <div className="mt-4">
                {product.ipfsHash ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${product.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    View Metadata
                  </a>
                ) : (
                  <span className="text-gray-500">No Metadata</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
