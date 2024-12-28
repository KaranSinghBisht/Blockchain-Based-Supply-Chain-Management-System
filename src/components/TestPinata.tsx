import React from "react";
import { pinFileToIPFS, pinJSONToIPFS } from "@/utils/pinata";

const TestPinata = () => {
  const testFileUpload = async () => {
    const file = new File(["Hello, Pinata!"], "test.txt", { type: "text/plain" });

    try {
      const cid = await pinFileToIPFS(file);
      console.log("File successfully pinned to IPFS:", cid);
      alert(`File pinned successfully: ${cid}`);
    } catch (error) {
      console.error("Error testing file upload:", error);
      alert("File upload failed. Check the console for details.");
    }
  };

  const testJSONUpload = async () => {
    const testJSON = { message: "Hello, Pinata JSON!" };

    try {
      const cid = await pinJSONToIPFS(testJSON);
      console.log("JSON successfully pinned to IPFS:", cid);
      alert(`JSON pinned successfully: ${cid}`);
    } catch (error) {
      console.error("Error testing JSON upload:", error);
      alert("JSON upload failed. Check the console for details.");
    }
  };

  return (
    <div className="p-4">
      <h2>Test Pinata Integration</h2>
      <button
        onClick={testFileUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
      >
        Test File Upload
      </button>
      <button
        onClick={testJSONUpload}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Test JSON Upload
      </button>
    </div>
  );
};

export default TestPinata;
