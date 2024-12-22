# Blockchain-Based Supply Chain Management System

This project is a Blockchain-based Supply Chain Management System built using [Next.js](https://nextjs.org/), [viem](https://viem.sh/), and [Foundry](https://book.getfoundry.sh/), with the contract deployed on the [Sepolia Ethereum testnet](https://sepolia.etherscan.io/address/0xc38f0cD0880c2986b0B67c16f1A7B9434225487a) with site deployed using [vercel](https://blockchain-based-supply-chain-management-system-gjf2gvizy.vercel.app/).

## Test the Deployed Application
You can also directly test the application without setting it up locally by visiting the deployed website:

[Website Link](https://blockchain-based-supply-chain-management-system-gjf2gvizy.vercel.app/)

Ensure your wallet is connected to the Sepolia Testnet to interact with the blockchain features.

## Getting Started 

### Clone the Repository
```bash
git clone https://github.com/KaranSinghBisht/Blockchain-Based-Supply-Chain-Management-System.git
cd Blockchain-Based-Supply-Chain-Management-System
```

### Install Dependencies
Install the dependencies for the root directory:

```bash
npm install
```
Navigate to the foundry directory and install its dependencies:

```bash
cd foundry
npm install
```
Navigate back to the root directory:

```bash
cd ..
```
Configure Environment Variables
Create a .env file in the root directory with the following content:

```env
NEXT_PUBLIC_CHAIN=sepolia # set to 'anvil' for local testing, set to 'sepolia' for the deployed contract
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/i0gC7tUdEyZSjJrT99hkFdNuO24RQ2za
```

### Start the Application
Run the following command to start the development server:

```bash
npm run dev
```
Open your browser and navigate to:

```text
http://localhost:3000
```
This will load the application locally for testing and development purposes.

## Setup Using Anvil
If you want to test the blockchain without spending any Sepolia ETH, you can deploy a new contract using Anvil.

### Start Anvil:

Navigate to the foundry directory:
```bash
cd foundry
```
Start Anvil:
```bash
anvil
```
Anvil will provide wallets, their private keys, an RPC URL, and addresses.

### Setup Metamask:
Open MetaMask and create a custom network:
Add the RPC URL provided by Anvil.
Set the Chain ID to 31337.
Set the native currency to ETH.

### Import a wallet:
Take one of the private keys provided by Anvil.
Go to metamask, import wallet, and then paste that private key.
Now you will have 1000 test ETH for testing.
### Create a Wallet for Deployment:

Import the wallet into Foundry:
```bash
cast wallet import --interactive anvilwallet
```
Paste the same private key from Anvil when prompted.
You now have a wallet ready for deployment.
### Deploy the Smart Contract:

Use the following command to deploy the smart contract:
```bash
forge script script/Deploy.s.sol --rpc-url <RPC_URL_FROM_ANVIL> --account anvilwallet --sender <ADDRESS_FROM_ANVIL> --broadcast
```
Once the deployment is successful, copy the contract address.
### Update the Frontend:

Navigate to `root/src/utils/viemClient.ts`.
Replace the contract address with the new address from the deployment.
### Update the .env File:

Change the `NEXT_PUBLIC_CHAIN` in the .env file from sepolia to anvil:
```env
NEXT_PUBLIC_CHAIN=anvil
NEXT_PUBLIC_ALCHEMY_RPC_URL=http://127.0.0.1:8545
```
Your application is now set up to test locally using Anvil without requiring Sepolia ETH.

