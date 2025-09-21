import type { MetaMaskInpageProvider } from "@metamask/providers";

export interface WalletState {
  setAccount: (account: string | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsCorrectNetwork: (isCorrectNetwork: boolean) => void;
  setError: (error: string | null) => void;
}

export interface WalletListeners {
  onAccountsChanged: (accounts: string[]) => void;
  onChainChanged: () => void;
}

// ✅ Always keep decimal + hex versions in sync
export const BLOCKDAG_CHAIN_ID_DEC =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 1043;
export const BLOCKDAG_CHAIN_ID_HEX = `0x${BLOCKDAG_CHAIN_ID_DEC.toString(16)}`;

export const BLOCKDAG_CONFIG = {
  chainId: BLOCKDAG_CHAIN_ID_HEX,
  chainName: "Primordial BlockDAG Testnet",
  rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.blockdag.network"],
  nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
  blockExplorerUrls: [
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ||
      "https://explorer.blockdag.network",
  ],
};

// ✅ Safe getter for MetaMask provider
export function getEthereumProviderOrThrow(): MetaMaskInpageProvider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not found. Please install MetaMask.");
  }
  return window.ethereum as MetaMaskInpageProvider;
}

// Existing getEthereumProvider (nullable) if you still need it
export function getEthereumProvider(): MetaMaskInpageProvider | null {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum as MetaMaskInpageProvider;
  }
  return null;
}


export async function connectWallet({
  setAccount,
  setIsConnected,
  setIsCorrectNetwork,
  setError,
}: WalletState) {
  const provider = getEthereumProvider();
  if (!provider) {
    setError("MetaMask is not installed");
    return;
  }
  try {
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    const chainId = (await provider.request({
      method: "eth_chainId",
    })) as string;

    setAccount(accounts[0]);
    setIsConnected(true);
    setIsCorrectNetwork(parseInt(chainId, 16) === BLOCKDAG_CHAIN_ID_DEC);
    setError(null);
  } catch (err: any) {
    setError("Failed to connect wallet: " + err.message);
    console.error(err);
  }
}

export async function switchToBlockDAGNetwork({
  setIsCorrectNetwork,
  setError,
}: Pick<WalletState, "setIsCorrectNetwork" | "setError">) {
  const provider = getEthereumProvider();
  if (!provider) {
    setError("MetaMask is not installed");
    return;
  }
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BLOCKDAG_CHAIN_ID_HEX }],
    });
    setIsCorrectNetwork(true);
    setError(null);
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [BLOCKDAG_CONFIG],
        });
        setIsCorrectNetwork(true);
        setError(null);
      } catch (addError: any) {
        setError(`Failed to add BlockDAG network: ${addError.message}`);
        console.error(addError);
      }
    } else {
      setError(`Failed to switch network: ${switchError.message}`);
      console.error(switchError);
    }
  }
}

// ✅ Typed wrapper for event listeners
export function setupWalletListeners({
  onAccountsChanged,
  onChainChanged,
}: WalletListeners) {
  const provider = getEthereumProvider();
  if (!provider) return;

  const accountsHandler = (accounts: unknown) =>
    onAccountsChanged(accounts as string[]);
  const chainHandler = () => onChainChanged();

  provider.on("accountsChanged", accountsHandler);
  provider.on("chainChanged", chainHandler);

  // Return cleanup function
  return () => {
    provider.removeListener("accountsChanged", accountsHandler as any);
    provider.removeListener("chainChanged", chainHandler as any);
  };
}
