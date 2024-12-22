import React, { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const [progress, setProgress] = useState(100); // Progress starts at 100%

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 2)); // Reduce progress every 100ms
    }, 100);

    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => {
      clearInterval(interval); // Cleanup interval
      clearTimeout(timer); // Cleanup timer
    };
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-md shadow-lg px-4 py-3 ${
        type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
      style={{ minWidth: "250px" }}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-sm font-bold underline hover:no-underline"
        >
          Close
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 mt-2 bg-gray-200 rounded">
        <div
          className={`h-full ${
            type === "success" ? "bg-green-500" : "bg-red-500"
          } rounded`}
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        ></div>
      </div>
    </div>
  );
};

export default Alert;
