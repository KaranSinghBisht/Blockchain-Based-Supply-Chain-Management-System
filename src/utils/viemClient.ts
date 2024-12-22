import { createPublicClient, createWalletClient, custom, http, Abi } from "viem";
import { anvilChain, sepoliaChain } from "./chain";
import SupplyChainABI from "../../foundry/out/SupplyChain.sol/SupplyChain.json";
import { isAddress } from "viem";

// Contract Address
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CHAIN === "sepolia"
    ? "0x61768F91d97ebcf03546bf4Dcd5657d37D2fD7b3" // Sepolia address
    : "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Anvil address

const ABI = SupplyChainABI.abi as Abi;

// Determine Chain Based on ENV
const currentChain =
  process.env.NEXT_PUBLIC_CHAIN === "sepolia" ? sepoliaChain : anvilChain;

// Public Client
export const publicClient = createPublicClient({
  chain: currentChain,
  transport:
    process.env.NEXT_PUBLIC_CHAIN === "sepolia"
      ? http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL!)
      : http(),
});

// Wallet Client
export const walletClient =
  typeof window !== "undefined" && window.ethereum
    ? createWalletClient({
        chain: currentChain,
        transport: custom(window.ethereum),
      })
    : null;

// Global waitForTransaction Function
export const waitForTransaction = async (txHash: `0x${string}`) => {
  try {
    console.log("Waiting for transaction to confirm...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log("Transaction confirmed:", receipt);
    return receipt;
  } catch (err) {
    console.error("Transaction failed to confirm:", err);
    throw new Error("Transaction failed to confirm.");
  }
};

// Contract Interaction Functions
export const supplyChainContract = {
  async registerProduct(id: number, name: string, batch: number): Promise<`0x${string}`> {
    if (!walletClient) throw new Error("Wallet client is not available.");
    const [account] = await walletClient.requestAddresses();
    return walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "registerProduct",
      args: [id, name, batch],
      account,
    });
  },

  async transferOwnership(id: number, newOwner: string): Promise<`0x${string}` | string> {
    if (!walletClient) return "Wallet client is not available.";
  
    if (!isAddress(newOwner)) {
      return "Invalid address format. Please provide a valid Ethereum address.";
    }
  
    const [account] = await walletClient.requestAddresses();
    return walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "transferOwnership",
      args: [id, newOwner],
      account,
    });  
  },

  async getOwnershipHistory(id: number): Promise<`0x${string}`[]> {
    return (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "getOwnershipHistory",
      args: [id],
    })) as `0x${string}`[];
  },

  async getAllProducts(): Promise<any[]> {
    return (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "getAllProducts",
      args: [],
    })) as any[];
  },
};
