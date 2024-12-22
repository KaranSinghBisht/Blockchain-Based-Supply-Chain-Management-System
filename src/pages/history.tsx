import Navbar from "@/components/Navbar";
import HistoryDisplay from "@/components/HistoryDisplay";

const HistoryPage = () => {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="p-8 bg-white rounded shadow-md w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Product Ownership History</h2>
          <HistoryDisplay />
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
