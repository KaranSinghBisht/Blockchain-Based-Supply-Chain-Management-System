import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeModalProps {
  productId: number | null;
  productData: any; // Replace with proper type if available
  onClose: () => void;
}

// Helper function to stringify BigInt values
const stringifyBigInt = (obj: any) =>
  JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value));

const QRCodeModal: React.FC<QRCodeModalProps> = ({ productId, productData, onClose }) => {
  if (!productId) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          QR Code for Product #{productId}
        </h2>
        <div className="flex justify-center">
          <QRCodeCanvas
            value={stringifyBigInt(productData || {})}
            size={200}
            fgColor="#000000"
            bgColor="#ffffff"
            level="Q"
            className="m-4 border-2 border-gray-200 shadow-sm"
          />
        </div>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 mt-4 rounded w-full hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
