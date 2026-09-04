import { type Address } from "viem";

/** Creditcoin testnet — passport home (AMA) */
export const ADDRESSES = {
  registry: "0x1e578b5aE11BEE48361b70470E8FfD939148b7F7" as Address,
  verifier: "0x75304e98D8E37A91E3DC2d7c5bf1b363FebC3101" as Address,
  score: "0xe90195df4183865CF1533F5B90f15AC37EEbdE02" as Address,
  credit:   "0x96e99678067c62c441152E69975438768e3afEAf" as Address,
  passport: "0x1E3E565b13013D430446185BaEcfc8d97fD0D3f5" as Address,
  consumer: "0x2A845d32837CB3549f3e14cE160586961c522AEc" as Address,
  intent: "0xB37b771B1337cF555dFAeF8bd7190445D75796aa" as Address,
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
    name: "getReceivables",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{
      name: "",
      type: "tuple[]",
      components: [
        { name: "payer", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "sourceTxHash", type: "bytes32" },
        { name: "timestamp", type: "uint256" },
        { name: "eventType", type: "uint8" },
      ],
    }],
  },
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
    name: "outstanding",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "AdvanceOpened",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "score", type: "uint256", indexed: false },
    ],
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
      { name: "invoiceId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "verifyAttestedPayment",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "a",
        type: "tuple",
        components: [
          { name: "chainKey", type: "uint32" },
          { name: "headerNumber", type: "uint64" },
          { name: "sourceTxHash", type: "bytes32" },
          { name: "eventType", type: "uint8" },
          { name: "beneficiary", type: "address" },
          { name: "payer", type: "address" },
          { name: "amount", type: "uint256" },
        ],
      },
      { name: "txBytes", type: "bytes" },
      { name: "merkleProof", type: "bytes" },
      { name: "continuityProof", type: "bytes" },
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


export const passportAbi = [
  {
    type: "function",
    name: "hasPassport",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "tokenOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const intentAbi = [
  {
    type: "function",
    name: "getIntent",
    stateMutability: "view",
    inputs: [{ name: "sourceTxHash", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "invoiceId", type: "bytes32" },
          { name: "confidence", type: "uint8" },
          { name: "payer", type: "address" },
          { name: "beneficiary", type: "address" },
        ],
      },
    ],
  },
] as const;
