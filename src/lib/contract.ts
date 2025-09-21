import { Contract, JsonRpcSigner, Provider } from "ethers";
import FloodPredictorABI from "@/abi/FloodPredictor.json";
import { getEthereumProviderOrThrow } from "./wallet";

// ✅ Replace with your deployed contract address
export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x8AB8315fa4aFD44923E834623f04b757b23f039e";

export async function getContract(signerOrProvider: JsonRpcSigner | Provider) {
  const provider =
    signerOrProvider instanceof JsonRpcSigner
      ? (signerOrProvider.provider as Provider)
      : signerOrProvider;

  const code = await provider.getCode(CONTRACT_ADDRESS);
  console.log(`Contract code at ${CONTRACT_ADDRESS}:`, code);
  
  if (code === "0x") {
    throw new Error(
      `No contract deployed at ${CONTRACT_ADDRESS} on this network. Check the address and network in MetaMask.`
    );
  }

  return new Contract(CONTRACT_ADDRESS, FloodPredictorABI, signerOrProvider);
}
