import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type WalletClient,
} from "viem";
import { creditcoinTestnet } from "./contracts";

const RPC = "https://rpc.cc3-testnet.creditcoin.network";

export const publicClient = createPublicClient({
  chain: creditcoinTestnet,
  transport: http(RPC),
});

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
};

function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  if (!eth) return null;
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const mm = eth.providers.find((p) => p.isMetaMask);
    if (mm) return mm;
    return eth.providers[0] ?? eth;
  }
  return eth;
}

export function errMsg(e: unknown): string {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message || e.name;
  if (typeof e === "object") {
    const o = e as {
      message?: string;
      shortMessage?: string;
      code?: number | string;
      data?: { message?: string };
    };
    if (o.shortMessage) return o.shortMessage;
    if (o.message) return o.message;
    if (o.data?.message) return o.data.message;
    if (o.code === 4001) return "Request rejected in wallet.";
    if (o.code === -32002) return "Wallet popup already open.";
    try {
      return JSON.stringify(o);
    } catch {
      return "Connect failed";
    }
  }
  return String(e);
}

export async function connectDemo(): Promise<{
  address: Address;
  walletClient: WalletClient;
}> {
  throw new Error(
    "Demo Connect is Anvil-only. Use MetaMask on Creditcoin Testnet (102031)."
  );
}

export async function connectWallet(): Promise<{
  address: Address;
  walletClient: WalletClient;
}> {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("No browser wallet found. Install MetaMask and refresh.");
  }

  let accounts: string[];
  try {
    // Forces MetaMask's account picker instead of silently
    // reusing the last connected address.
    await ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    accounts = (await ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
  } catch (e) {
    throw new Error(errMsg(e));
  }

  if (!accounts?.length) {
    throw new Error("Wallet has no account. Unlock MetaMask and try again.");
  }

  // Creditcoin testnet chainId 102031 = 0x18e8f
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x18e8f" }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x18e8f",
              chainName: "Creditcoin Testnet",
              nativeCurrency: { name: "Creditcoin", symbol: "tCTC", decimals: 18 },
              rpcUrls: [RPC],
              blockExplorerUrls: ["https://creditcoin-testnet.blockscout.com"],
            },
          ],
        });
      } catch (e2) {
        throw new Error(errMsg(e2));
      }
    } else if (code === 4001) {
      throw new Error("Network switch rejected.");
    }
  }

  const walletClient = createWalletClient({
    account: accounts[0] as Address,
    chain: creditcoinTestnet,
    transport: custom(ethereum as never),
  });

  return { address: accounts[0] as Address, walletClient };
}
