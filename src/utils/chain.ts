import { defineChain } from "viem/utils";
import { sepolia } from "viem/chains";

// Define Anvil Chain
export const anvilChain = defineChain({
  id: 31337, // Default chain ID for Anvil
  name: "Anvil",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

// Sepolia Chain (Predefined in viem)
export const sepoliaChain = sepolia;
