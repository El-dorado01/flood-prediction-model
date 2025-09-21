// "use client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { WagmiProvider, createConfig, http } from "wagmi";
// import { sepolia } from "wagmi/chains"; // Replace with BlockDAG chain config
// import { injected, metaMask } from "@wagmi/connectors";
// import { ReactNode } from "react";

// // BlockDAG testnet chain config (customize with their RPC URL, chain ID, etc.)
// const blockDAGChain = {
//   id: 12345, // Replace with actual BlockDAG testnet chain ID
//   name: "BlockDAG Testnet",
//   nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 },
//   rpcUrls: { default: { http: ["https://testnet.blockdag.rpc"] } }, // Replace with actual RPC
// };

// const config = createConfig({
//   chains: [blockDAGChain],
//   connectors: [injected(), metaMask()],
//   transports: { [blockDAGChain.id]: http() },
// });

// const queryClient = new QueryClient();

// export function Providers({ children }: { children: ReactNode }) {
//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//     </WagmiProvider>
//   );
// }
