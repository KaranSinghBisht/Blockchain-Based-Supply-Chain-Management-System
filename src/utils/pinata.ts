import axios from "axios";

const PINATA_BASE_URL = "https://api.pinata.cloud";
const JWT_TOKEN = process.env.NEXT_PUBLIC_PINATA_JWT;

if (!JWT_TOKEN) {
  throw new Error("Pinata JWT token is missing. Please check your .env file.");
}

/**
 * Upload a file to IPFS using Pinata
 * @param {File} file - File to upload
 * @returns {Promise<string>} - CID of the uploaded file
 */
export const pinFileToIPFS = async (file: File): Promise<string> => {
  const url = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("File pinned successfully:", response.data);
    return response.data.IpfsHash; // CID of the uploaded file
  } catch (error) {
    const err = error as any; // Type assertion
    console.error("Error pinning file to IPFS:", err.response?.data || err.message);
    throw new Error("Failed to pin file to IPFS");
  }
};

/**
 * Upload JSON metadata to IPFS using Pinata
 * @param {Record<string, any>} json - JSON object to upload
 * @returns {Promise<string>} - CID of the uploaded JSON
 */
export const pinJSONToIPFS = async (json: Record<string, any>): Promise<string> => {
  const url = `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`;

  try {
    const response = await axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("JSON pinned successfully:", response.data);
    return response.data.IpfsHash; // CID of the uploaded JSON
  } catch (error) {
    const err = error as any; // Type assertion
    console.error("Error pinning file to IPFS:", err.response?.data || err.message);
    throw new Error("Failed to pin file to IPFS");
  }
};
