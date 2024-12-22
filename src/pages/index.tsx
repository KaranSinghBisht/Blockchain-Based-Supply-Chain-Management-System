import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-5xl font-bold text-gray-800 text-center">
          Blockchain-Based Supply Chain Management System
        </h1>
      </div>
    </div>
  );
}
