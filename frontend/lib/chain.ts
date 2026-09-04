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
export const SESSION_KEY = "factorx-session";

export const publicClient = createPublicClient({
  chain: creditcoinTestnet,
  transport: http(RPC),
});

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isZerion?: boolean;
  providers?: EthereumProvider[];
};

export function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  if (!eth) return null;
  // Use the announcing provider. Do not force MetaMask — that breaks Zerion.
  return eth;
}

export function hasInjectedWallet() {
  return !!getEthereum();
}

export function walletDeepLink(path = "/dashboard") {
  const host =
    typeof window !== "undefined" ? window.location.host : "factorx.vercel.app";
  // MetaMask mobile dapp link: no protocol, keep the path so we don't land on /
  return `https://metamask.app.link/dapp/${host}${path}`;
}

export function readSession(): Address | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (raw && /^0x[a-fA-F0-9]{40}$/.test(raw)) return raw as Address;
  } catch {
    /* private mode */
  }
  return null;
}

export function writeSession(address: Address) {
  try {
    localStorage.setItem(SESSION_KEY, address);
    sessionStorage.setItem(SESSION_KEY, address);
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
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
    const blob = `${o.shortMessage || ""} ${o.message || ""} ${o.data?.message || ""}`.toLowerCase();
    if (blob.includes("method not found") || o.code === -32601) {
      return "Wallet skipped an unsupported method. Try Connect again.";
    }
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

function isUnsupported(e: unknown) {
  const o = e as { code?: number; message?: string; shortMessage?: string };
  const blob = `${o?.message || ""} ${o?.shortMessage || ""}`.toLowerCase();
  return o?.code === -32601 || blob.includes("method not found") || blob.includes("does not exist");
}

async function requestAccounts(ethereum: EthereumProvider, pickAccount: boolean) {
  // Zerion / many mobile wallets do not implement wallet_requestPermissions.
  if (pickAccount) {
    try {
      await ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (e) {
      if (!isUnsupported(e) && (e as { code?: number })?.code !== 4001) {
        // fall through to eth_requestAccounts
      }
    }
  }
  let accounts: string[] = [];
  try {
    accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
  } catch (e) {
    if (isUnsupported(e)) {
      accounts = (await ethereum.request({ method: "eth_accounts" })) as string[];
    } else {
      throw e;
    }
  }
  if (!accounts?.length) {
    throw new Error("Wallet has no account. Unlock and try again.");
  }
  return accounts[0] as Address;
}

async function ensureChain(ethereum: EthereumProvider) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x18e8f" }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902 || isUnsupported(err)) {
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
        if (!isUnsupported(e2) && (e2 as { code?: number })?.code !== 4001) {
          // keep going — reads still work on our RPC
        }
      }
    }
  }
}

function clientFor(ethereum: EthereumProvider, account: Address): WalletClient {
  return createWalletClient({
    account,
    chain: creditcoinTestnet,
    transport: custom(ethereum as never),
  });
}

export async function connectWallet(opts?: { pickAccount?: boolean }): Promise<{
  address: Address;
  walletClient: WalletClient;
}> {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("NO_PROVIDER");
  }
  const address = await requestAccounts(ethereum, opts?.pickAccount === true);
  await ensureChain(ethereum);
  writeSession(address);
  return { address, walletClient: clientFor(ethereum, address) };
}

/** Restore after in-app wallet reload. No permission prompt. */
export async function resumeWallet(): Promise<{
  address: Address;
  walletClient: WalletClient;
} | null> {
  const saved = readSession();
  const ethereum = getEthereum();
  if (!ethereum) {
    return saved ? { address: saved, walletClient: undefined as unknown as WalletClient } : null;
  }
  let accounts: string[] = [];
  try {
    accounts = (await ethereum.request({ method: "eth_accounts" })) as string[];
  } catch {
    accounts = [];
  }
  const address = (accounts[0] as Address | undefined) || saved;
  if (!address) return null;
  writeSession(address);
  try {
    await ensureChain(ethereum);
  } catch {
    /* reads still work */
  }
  return { address, walletClient: clientFor(ethereum, address) };
}

export function disconnectWallet() {
  clearSession();
}

export async function connectDemo(): Promise<{
  address: Address;
  walletClient: WalletClient;
}> {
  throw new Error(
    "Demo Connect is Anvil-only. Use MetaMask on Creditcoin Testnet (102031)."
  );
}
