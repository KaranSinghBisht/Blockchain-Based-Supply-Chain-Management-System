import axios from "axios";

const PINATA_BASE_URL = "https://api.pinata.cloud";
const JWT_TOKEN = process.env.NEXT_PUBLIC_PINATA_JWT;

/**
 * Uploads a file to IPFS via Pinata
 */
export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!JWT_TOKEN) {
    throw new Error("Pinata JWT token is missing. Check your .env file.");
  }

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
    return response.data.IpfsHash; // Returns the CID
  } catch (error) {
    console.error("Error pinning file to IPFS:", error);
    throw new Error("Failed to pin file to IPFS");
  }
};
