import { useState } from "react";
import { supplyChainContract } from "@/utils/viemClient";

const HistoryDisplay = () => {
  const [id, setId] = useState<number>();
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const fetchHistory = async () => {
    try {
      setError(""); // Reset error
      if (!id) {
        setError("Please enter a valid Product ID.");
        return;
      }

      const ownershipHistory = await supplyChainContract.getOwnershipHistory(id);
      if (ownershipHistory.length === 0) {
        setError("No ownership history found for this Product ID.");
      } else {
        setHistory(ownershipHistory);
      }

    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Product does not exist or an error occurred.");
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          className="border p-2 mr-2 flex-1 text-black"
          placeholder="Enter Product ID"
          onChange={(e) => setId(Number(e.target.value))}
        />
        <button
          onClick={fetchHistory}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Fetch History
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <ul>
        {history.map((owner, index) => (
          <li key={index} className="text-black">
            {owner}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryDisplay;
