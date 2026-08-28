import { type Address } from "viem";

/** Creditcoin testnet — passport home (AMA) */
export const ADDRESSES = {
  registry: "0x1e578b5aE11BEE48361b70470E8FfD939148b7F7",
  verifier: "0x282d281B101C7e9fd66996b12E72BD95E30a6b48",
  score:    "0xe90195df4183865CF1533F5B90f15AC37EEbdE02",
  credit:   "0x43B016716D7ED9a208158EF6b007B6133e7745C8",
  passport: "0xa1C6E03E9d0aa5610a9098d723BDA6241C2daCC1",
  consumer: "0x7458d143Ac7F00356A689AF40994d0255FB8d104",
} as const;

export const creditcoinTestnet = {
  id: 102031,
  name: "Creditcoin Testnet",
  nativeCurrency: { name: "Creditcoin", symbol: "tCTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.cc3-testnet.creditcoin.network"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://creditcoin-testnet.blockscout.com" },
  },
} as const;

export const sepolia = {
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
  },
} as const;

export const anvil = {
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
} as const;

/** Passport + score live here */
export const activeChain = creditcoinTestnet;
/** Payments / proofs come from here (Attestcoin chainKey = 1) */
export const SOURCE_CHAIN_KEY = 1;

export const scoreAbi = [
  {
    type: "function",
    name: "getCommercialScore",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getScoreBreakdown",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "score", type: "uint256" },
      { name: "payments", type: "uint256" },
      { name: "volume", type: "uint256" },
      { name: "uniquePayers", type: "uint256" },
    ],
  },
] as const;

export const registryAbi = [
  {
    type: "function",
    name: "getReceivableCount",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalVolume",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "uniquePayerCount",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const creditAbi = [
  {
    type: "function",
    name: "getAvailableCredit",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "requestAdvance",
    stateMutability: "nonpayable",
    inputs: [{ name: "requested", type: "uint256" }],
    outputs: [],
  },
] as const;

export const verifierAbi = [
  {
    type: "function",
    name: "verifyAndRecord",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "sourceTxHash", type: "bytes32" },
      { name: "eventType", type: "uint8" },
      { name: "beneficiary", type: "address" },
      { name: "payer", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const consumerAbi = [
  {
    type: "function",
    name: "checkAndOfferTerms",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;
