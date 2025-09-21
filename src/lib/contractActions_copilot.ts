import { ethers } from "ethers";
import { getEthereumProviderOrThrow } from "./wallet";
import type { FloodMetrics } from "@/types/noaa";

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Validate contract address
if (
  !CONTRACT_ADDRESS ||
  CONTRACT_ADDRESS === "" ||
  CONTRACT_ADDRESS === "0x..."
) {
  console.error("⚠️ CONTRACT_ADDRESS not set in environment variables");
}

// Contract ABI - Essential functions only
const CONTRACT_ABI = [
  // Write functions
  "function updateAllMetrics(uint256 _waterLevel, uint256 _tidePrediction, uint256 _currentSpeed) external",
  "function depositAsSponsor() external payable",
  "function depositAsInvestor() external payable",
  "function addBeneficiary(address _beneficiary) external",
  "function triggerInvestorWithdrawals() external",

  // Read functions - exactly as in your contract
  "function owner() external view returns (address)",
  "function getContractBalance() external view returns (uint256)",
  "function getInvestorDeposit(address _investor) external view returns (uint256 amount, uint256 depositTime, bool withdrawn)",
  "function waterLevel() external view returns (uint256)",
  "function tidePrediction() external view returns (uint256)",
  "function currentSpeed() external view returns (uint256)",
  "function currentThreatLevel() external view returns (uint8)",
  "function totalSponsorFunds() external view returns (uint256)",
  "function totalInvestorFunds() external view returns (uint256)",

  // Events
  "event DataUpdated(uint256 waterLevel, uint256 tidePrediction, uint256 currentSpeed)",
  "event ThreatLevelUpdated(uint8 level)",
  "event SponsorDeposited(address indexed sponsor, uint256 amount)",
  "event InvestorDeposited(address indexed investor, uint256 amount)",
  "event FundsDisbursedToBeneficiaries(uint256 totalAmount)",
  "event InvestorWithdrawn(address indexed investor, uint256 amount, bool withInterest)",
];

// Helper to validate contract deployment
async function validateContract() {
  if (
    !CONTRACT_ADDRESS ||
    CONTRACT_ADDRESS === "" ||
    CONTRACT_ADDRESS === "0x..."
  ) {
    throw new Error(
      "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file"
    );
  }

  if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error(`Invalid contract address: ${CONTRACT_ADDRESS}`);
  }

  try {
    const provider = new ethers.BrowserProvider(getEthereumProviderOrThrow());
    const code = await provider.getCode(CONTRACT_ADDRESS);

    if (code === "0x") {
      throw new Error(
        `No contract deployed at address ${CONTRACT_ADDRESS}. Please verify the contract is deployed on the current network.`
      );
    }

    return true;
  } catch (error) {
    console.error("Contract validation failed:", error);
    throw error;
  }
}

// Helper to get contract instance
async function getContract() {
  await validateContract();
  const provider = new ethers.BrowserProvider(getEthereumProviderOrThrow());
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Helper to get read-only contract instance
async function getReadOnlyContract() {
  await validateContract();
  const provider = new ethers.BrowserProvider(getEthereumProviderOrThrow());
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// Convert metrics to contract format (multiply by 100 for 2 decimal precision)
function formatMetricsForContract(metrics: FloodMetrics) {
  return {
    waterLevel: Math.floor(metrics.waterLevel * 100), // e.g., 1.23m -> 123
    tidePrediction: Math.floor(metrics.tidePrediction * 100), // e.g., 1.50m -> 150
    currentSpeed: Math.floor(metrics.currentSpeed * 100), // e.g., 2.00cm/s -> 200
  };
}

// Send flood metrics to contract
export async function sendDataToContract(metrics: FloodMetrics): Promise<void> {
  try {
    console.log("Sending metrics to contract:", metrics);
    const contract = await getContract();
    const formatted = formatMetricsForContract(metrics);

    console.log("Formatted metrics for contract:", formatted);

    // Check if user is the owner first
    const provider = new ethers.BrowserProvider(getEthereumProviderOrThrow());
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    console.log("User address:", userAddress);
    console.log("Contract address:", CONTRACT_ADDRESS);

    // Estimate gas first to catch errors before sending
    try {
      const gasEstimate = await contract.updateAllMetrics.estimateGas(
        formatted.waterLevel,
        formatted.tidePrediction,
        formatted.currentSpeed
      );
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (gasError: any) {
      console.error("Gas estimation failed:", gasError);

      // Check if it's an ownership error
      if (gasError.data && gasError.data.includes("118cdaa7")) {
        throw new Error(
          "Access denied: Only the contract owner can update metrics. Please make sure you're connected with the owner wallet."
        );
      }

      throw new Error(
        `Transaction will fail: ${
          gasError.reason || gasError.message || "Unknown error"
        }`
      );
    }

    const tx = await contract.updateAllMetrics(
      formatted.waterLevel,
      formatted.tidePrediction,
      formatted.currentSpeed,
      {
        gasLimit: 300000, // Set a reasonable gas limit
      }
    );

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed");
  } catch (error: any) {
    console.error("Error sending data to contract:", error);

    // Parse common error messages
    if (error.message.includes("user rejected")) {
      throw new Error("Transaction cancelled by user");
    }

    if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient ETH balance for transaction");
    }

    if (error.code === "CALL_EXCEPTION" && error.data) {
      if (error.data.includes("118cdaa7")) {
        throw new Error(
          "Access denied: Only the contract owner can update flood metrics"
        );
      }
    }

    throw new Error(error.reason || error.message || "Transaction failed");
  }
}

// Deposit as sponsor (0.1 ETH default)
export async function depositAsSponsor(amount: string = "0.1"): Promise<void> {
  try {
    const contract = await getContract();
    const tx = await contract.depositAsSponsor({
      value: ethers.parseEther(amount),
    });
    await tx.wait();
  } catch (error: any) {
    console.error("Error depositing as sponsor:", error);
    throw new Error(error.reason || error.message || "Transaction failed");
  }
}

// Deposit as investor (0.1 ETH default)
export async function depositAsInvestor(amount: string = "0.1"): Promise<void> {
  try {
    const contract = await getContract();
    const tx = await contract.depositAsInvestor({
      value: ethers.parseEther(amount),
    });
    await tx.wait();
  } catch (error: any) {
    console.error("Error depositing as investor:", error);
    throw new Error(error.reason || error.message || "Transaction failed");
  }
}

// Add beneficiary (owner only)
export async function addBeneficiary(
  beneficiaryAddress: string
): Promise<void> {
  try {
    if (!ethers.isAddress(beneficiaryAddress)) {
      throw new Error("Invalid Ethereum address");
    }

    const contract = await getContract();
    const tx = await contract.addBeneficiary(beneficiaryAddress);
    await tx.wait();
  } catch (error: any) {
    console.error("Error adding beneficiary:", error);
    throw new Error(error.reason || error.message || "Transaction failed");
  }
}

// Trigger investor withdrawals
export async function triggerWithdrawals(): Promise<void> {
  try {
    const contract = await getContract();
    const tx = await contract.triggerInvestorWithdrawals();
    await tx.wait();
  } catch (error: any) {
    console.error("Error triggering withdrawals:", error);
    throw new Error(error.reason || error.message || "Transaction failed");
  }
}

// Read contract balance
export async function readContractBalance(): Promise<string> {
  try {
    console.log("Reading contract balance from:", CONTRACT_ADDRESS);
    const contract = await getReadOnlyContract();

    // Try using the contract's balance getter first
    try {
      const balance = await contract.getContractBalance();
      return ethers.formatEther(balance);
    } catch (err) {
      console.log(
        "getContractBalance() failed, trying direct balance check:",
        err
      );
      // Fallback: get balance directly from provider
      const provider = new ethers.BrowserProvider(getEthereumProviderOrThrow());
      const balance = await provider.getBalance(CONTRACT_ADDRESS);
      return ethers.formatEther(balance);
    }
  } catch (error: any) {
    console.error("Error reading contract balance:", error);
    throw new Error(`Failed to read balance: ${error.reason || error.message}`);
  }
}

// Read user's deposit info
export async function readMyDeposit(userAddress: string): Promise<{
  amount: string;
  depositTime: number;
  withdrawn: boolean;
}> {
  try {
    console.log("Reading deposit for user:", userAddress);
    const contract = await getReadOnlyContract();

    try {
      const result = await contract.getInvestorDeposit(userAddress);
      console.log("Raw deposit result:", result);

      // Handle both array and object returns
      const amount = result[0] || result.amount || BigInt(0);
      const depositTime = result[1] || result.depositTime || BigInt(0);
      const withdrawn = result[2] || result.withdrawn || false;

      return {
        amount: ethers.formatEther(amount),
        depositTime: Number(depositTime),
        withdrawn: Boolean(withdrawn),
      };
    } catch (err) {
      console.log("getInvestorDeposit() failed, returning empty deposit:", err);
      // Return empty deposit if function fails
      return {
        amount: "0",
        depositTime: 0,
        withdrawn: false,
      };
    }
  } catch (error: any) {
    console.error("Error reading deposit:", error);
    throw new Error(`Failed to read deposit: ${error.reason || error.message}`);
  }
}

// Read on-chain metrics
export async function readOnChainMetrics(): Promise<{
  waterLevel: number;
  tidePrediction: number;
  currentSpeed: number;
  threatLevel: number;
}> {
  try {
    console.log("Reading on-chain metrics from:", CONTRACT_ADDRESS);
    const contract = await getReadOnlyContract();

    try {
      const [waterLevel, tidePrediction, currentSpeed, threatLevel] =
        await Promise.all([
          contract.waterLevel().catch(() => BigInt(0)),
          contract.tidePrediction().catch(() => BigInt(0)),
          contract.currentSpeed().catch(() => BigInt(0)),
          contract.currentThreatLevel().catch(() => 0),
        ]);

      console.log("Raw metrics:", {
        waterLevel,
        tidePrediction,
        currentSpeed,
        threatLevel,
      });

      return {
        waterLevel: Number(waterLevel) / 100, // Convert back from contract format
        tidePrediction: Number(tidePrediction) / 100,
        currentSpeed: Number(currentSpeed) / 100,
        threatLevel: Number(threatLevel),
      };
    } catch (err) {
      console.log("Failed to read some metrics, returning defaults:", err);
      return {
        waterLevel: 0,
        tidePrediction: 0,
        currentSpeed: 0,
        threatLevel: 0,
      };
    }
  } catch (error: any) {
    console.error("Error reading on-chain metrics:", error);
    throw new Error(`Failed to read metrics: ${error.reason || error.message}`);
  }
}

// Get total funds info
export async function readFundsInfo(): Promise<{
  sponsorFunds: string;
  investorFunds: string;
  totalFunds: string;
}> {
  try {
    console.log("Reading funds info from:", CONTRACT_ADDRESS);
    const contract = await getReadOnlyContract();

    try {
      const [sponsorFunds, investorFunds] = await Promise.all([
        contract.totalSponsorFunds().catch(() => BigInt(0)),
        contract.totalInvestorFunds().catch(() => BigInt(0)),
      ]);

      const sponsorEth = ethers.formatEther(sponsorFunds);
      const investorEth = ethers.formatEther(investorFunds);
      const totalEth = ethers.formatEther(sponsorFunds + investorFunds);

      return {
        sponsorFunds: sponsorEth,
        investorFunds: investorEth,
        totalFunds: totalEth,
      };
    } catch (err) {
      console.log("Failed to read funds info, returning defaults:", err);
      return {
        sponsorFunds: "0",
        investorFunds: "0",
        totalFunds: "0",
      };
    }
  } catch (error: any) {
    console.error("Error reading funds info:", error);
    throw new Error(`Failed to read funds: ${error.reason || error.message}`);
  }
}

// Debug function to check contract deployment
export async function debugContract(): Promise<{
  address: string;
  isDeployed: boolean;
  balance: string;
  network: string;
  owner?: string;
  userAddress?: string;
  isOwner?: boolean;
}> {
  try {
    const provider = new ethers.BrowserProvider(getEthereumProviderOrThrow());
    const network = await provider.getNetwork();
    const code = await provider.getCode(CONTRACT_ADDRESS);
    const balance = await provider.getBalance(CONTRACT_ADDRESS);

    let owner, userAddress, isOwner;

    try {
      const signer = await provider.getSigner();
      userAddress = await signer.getAddress();

      if (code !== "0x") {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        owner = await contract.owner();
        isOwner = userAddress.toLowerCase() === owner.toLowerCase();
      }
    } catch (err) {
      console.log("Could not get owner info:", err);
    }

    return {
      address: CONTRACT_ADDRESS,
      isDeployed: code !== "0x",
      balance: ethers.formatEther(balance),
      network: `${network.name} (${network.chainId})`,
      owner,
      userAddress,
      isOwner,
    };
  } catch (error: any) {
    console.error("Debug contract failed:", error);
    throw error;
  }
}
