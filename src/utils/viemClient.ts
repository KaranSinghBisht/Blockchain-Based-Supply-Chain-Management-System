import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  Abi,
  isAddress,
  parseUnits,
} from "viem";
import { anvilChain, sepoliaChain } from "./chain";
import SupplyChainABI from "../../foundry/out/SupplyChain.sol/SupplyChain.json";

// Whichever address you have actually deployed for Anvil & Sepolia
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CHAIN === "sepolia"
    ? "0x58e4123bc0CA156bAFF3D10Bd13becC05694DCD3" // Your Sepolia address
    : "0x8464135c8F25Da09e49BC8782676a84730C318bC"; // Your Anvil address

const ABI = SupplyChainABI.abi as Abi;

// Pick the chain based on your ENV
const currentChain =
  process.env.NEXT_PUBLIC_CHAIN === "sepolia" ? sepoliaChain : anvilChain;

// Public Client (for read operations / tx receipt)
export const publicClient = createPublicClient({
  chain: currentChain,
  transport:
    process.env.NEXT_PUBLIC_CHAIN === "sepolia"
      ? http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL!)
      : http(), // local Anvil
});

// Wallet Client (for write operations)
export const walletClient =
  typeof window !== "undefined" && window.ethereum
    ? createWalletClient({
        chain: currentChain,
        transport: custom(window.ethereum),
      })
    : null;

// Helper to ensure we have a wallet (MetaMask) connected
const ensureWalletClient = async () => {
  if (!walletClient) {
    throw new Error("Wallet client is not available. Please install MetaMask.");
  }
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (parseInt(chainId, 16) !== currentChain.id) {
    throw new Error(`Please switch to the correct chain: ${currentChain.name}`);
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  return walletClient;
};

// Wait for TX to confirm
export const waitForTransaction = async (txHash: `0x${string}`) => {
  try {
    console.log("Waiting for transaction to confirm...");
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    console.log("Transaction confirmed:", receipt);
    return receipt;
  } catch (err) {
    console.error("Transaction failed to confirm:", err);
    throw new Error("Transaction failed to confirm.");
  }
};

// All contract calls
export const supplyChainContract = {
  async registerProduct(product: {
    id: number;
    name: string;
    batch: number;
    distributor: string;
    consumer: string;
    paymentAmount: string;
    bonusAmount: string;
    bonusDeadline: number;
    finalDeadline: number;
    ipfsHash: string;
  }): Promise<`0x${string}`> {
    const client = await ensureWalletClient();
    const [account] = await client.requestAddresses();
    const paymentAmountWei = parseUnits(product.paymentAmount, 18);
    const bonusAmountWei = parseUnits(product.bonusAmount, 18);
    const totalStake = paymentAmountWei + bonusAmountWei;
    const productInput = {
      id: product.id,
      name: product.name,
      batch: product.batch,
      distributor: product.distributor,
      consumer: product.consumer,
      paymentAmount: paymentAmountWei, // pass wei to contract
      bonusAmount: bonusAmountWei, // pass wei to contract
      bonusDeadline: product.bonusDeadline,
      finalDeadline: product.finalDeadline,
      ipfsHash: product.ipfsHash,
    };
    return client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "registerProduct",
      args: [productInput],
      account,
      value: totalStake,
      gas: BigInt(3000000), // Add explicit gas limit
    });
  },

  async transferOwnership(
    id: number,
    newOwner: string
  ): Promise<`0x${string}` | string> {
    const client = await ensureWalletClient();

    if (!isAddress(newOwner)) {
      return "Invalid address format. Please provide a valid Ethereum address.";
    }

    const [account] = await client.requestAddresses();
    return client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "transferOwnership",
      args: [id, newOwner],
      account,
    });
  },

  async getOwnershipHistory(id: number): Promise<string[]> {
    return (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "getOwnershipHistory",
      args: [id],
    })) as string[];
  },

  async getAllProducts(): Promise<any[]> {
    try {
      const result = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "getAllProducts",
      })) as any[];

      if (!result || result.length === 0) {
        console.log("No products found in contract.");
        return [];
      }

      const [
        ids,
        names,
        batches,
        manufacturedDates,
        currentOwners,
        paymentAmounts,
        bonusAmounts,
        bonusDeadlines,
        finalDeadlines,
        isPaymentReleasedFlags,
        ownershipHistories,
        ipfsHashes,
        distributors,
        consumers,
      ] = result as [
        number[],
        string[],
        number[],
        number[],
        string[],
        number[],
        number[],
        number[],
        number[],
        boolean[],
        string[][],
        string[],
        string[],
        string[]
      ];

      return ids.map((id, index) => ({
        id,
        name: names[index] || "Unknown",
        batch: batches[index] || 0,
        manufacturedDate: manufacturedDates[index] || 0,
        currentOwner: currentOwners[index] || "Unknown",
        paymentAmount: paymentAmounts[index] || 0,
        bonusAmount: bonusAmounts[index] || 0,
        bonusDeadline: bonusDeadlines[index] || 0,
        finalDeadline: finalDeadlines[index] || 0,
        isPaymentReleased: isPaymentReleasedFlags[index] || false,
        ownershipHistory: ownershipHistories[index] || [],
        ipfsHash: ipfsHashes[index] || "",
        distributor: distributors[index] || "Unknown",
        consumer: consumers[index] || "Unknown",
      }));
    } catch (error: any) {
      console.error("Error fetching products:", error.message || error);
      throw new Error("Failed to fetch products from the contract.");
    }
  },
};
