"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ContractDebug from "@/components/ContractDebug";
import {
  RefreshCw,
  Wallet,
  TrendingUp,
  Shield,
  Users,
  AlertTriangle,
  Droplets,
  Waves,
  Activity,
} from "lucide-react";
import {
  connectWallet,
  switchToBlockDAGNetwork,
  setupWalletListeners,
  getEthereumProvider,
  BLOCKDAG_CHAIN_ID_DEC,
} from "@/lib/wallet";
import {
  sendDataToContract,
  depositAsSponsor,
  depositAsInvestor,
  addBeneficiary,
  triggerWithdrawals,
  readContractBalance,
  readMyDeposit,
  readOnChainMetrics,
  readFundsInfo,
} from "@/lib/contractActions";
import type { FloodMetrics } from "@/types/noaa";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);

  const [floodData, setFloodData] = useState<FloodMetrics | null>(null);
  const [loadingFloodData, setLoadingFloodData] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [contractBalance, setContractBalance] = useState<string>("0");
  const [myDeposit, setMyDeposit] = useState<{
    amount: string;
    depositTime: number;
    withdrawn: boolean;
  } | null>(null);
  const [onChainMetrics, setOnChainMetrics] = useState<{
    waterLevel: number;
    tidePrediction: number;
    currentSpeed: number;
    threatLevel: number;
  } | null>(null);
  const [fundsInfo, setFundsInfo] = useState<{
    sponsorFunds: string;
    investorFunds: string;
    totalFunds: string;
  } | null>(null);

  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null);
      setIsConnected(!!accounts[0]);
    };

    const handleChainChanged = async () => {
      const chainId = (await provider.request({
        method: "eth_chainId",
      })) as string;
      setIsCorrectNetwork(parseInt(chainId, 16) === BLOCKDAG_CHAIN_ID_DEC);
    };

    const checkNetwork = async () => {
      const chainId = (await provider.request({
        method: "eth_chainId",
      })) as string;
      setIsCorrectNetwork(parseInt(chainId, 16) === BLOCKDAG_CHAIN_ID_DEC);
    };

    const checkIfAlreadyConnected = async () => {
      if (manuallyDisconnected) return;
      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
        await checkNetwork();
      }
    };

    const cleanup = setupWalletListeners({
      onAccountsChanged: handleAccountsChanged,
      onChainChanged: handleChainChanged,
    });

    checkIfAlreadyConnected();

    return () => {
      if (cleanup) cleanup();
    };
  }, [manuallyDisconnected]);

  const fetchFloodMetricsData = async () => {
    try {
      setLoadingFloodData(true);
      setError(null);
      const res = await fetch("/api/noaa?type=all");
      const json = await res.json();
      if (json.success) {
        setFloodData(json.data as FloodMetrics);
      } else {
        setError(json.error || "Failed to fetch flood data");
      }
    } catch (err: any) {
      setError("Error fetching flood data: " + err.message);
    } finally {
      setLoadingFloodData(false);
    }
  };

  const handleSendData = async () => {
    if (!floodData) return setError("No flood data to send");
    try {
      setTxStatus("Sending transaction...");
      await sendDataToContract(floodData);
      setTxStatus("Metrics updated on-chain successfully!");
      await Promise.all([
        handleReadOnChainMetrics(),
        handleReadContractBalance(),
        handleReadFundsInfo(),
      ]);
    } catch (err: any) {
      setTxStatus(null);
      setError(err.message);
    }
  };

  const handleDepositSponsor = async (amount?: string) => {
    const depositAmount =
      amount || prompt("Enter deposit amount in ETH:", "0.1");
    if (!depositAmount) return;

    try {
      setTxStatus("Processing sponsor deposit...");
      await depositAsSponsor(depositAmount);
      setTxStatus(`Sponsor deposit of ${depositAmount} ETH confirmed!`);
      await Promise.all([handleReadContractBalance(), handleReadFundsInfo()]);
    } catch (err: any) {
      setTxStatus(null);
      setError(err.message);
    }
  };

  const handleDepositInvestor = async (amount?: string) => {
    const depositAmount =
      amount || prompt("Enter investment amount in ETH:", "0.1");
    if (!depositAmount) return;

    try {
      setTxStatus("Processing investor deposit...");
      await depositAsInvestor(depositAmount);
      setTxStatus(`Investment of ${depositAmount} ETH confirmed!`);
      await Promise.all(
        [
          handleReadContractBalance(),
          handleReadFundsInfo(),
          account && handleReadMyDeposit(),
        ].filter(Boolean)
      );
    } catch (err: any) {
      setTxStatus(null);
      setError(err.message);
    }
  };

  const handleAddBeneficiary = async () => {
    const address = prompt("Enter beneficiary wallet address:");
    if (!address) return;
    try {
      setTxStatus("Adding beneficiary...");
      await addBeneficiary(address);
      setTxStatus("Beneficiary added successfully!");
    } catch (err: any) {
      setTxStatus(null);
      setError(err.message);
    }
  };

  const handleTriggerWithdrawals = async () => {
    try {
      setTxStatus("Processing investor withdrawals...");
      await triggerWithdrawals();
      setTxStatus("Investor withdrawals processed!");
      await Promise.all(
        [
          handleReadContractBalance(),
          handleReadFundsInfo(),
          account && handleReadMyDeposit(),
        ].filter(Boolean)
      );
    } catch (err: any) {
      setTxStatus(null);
      setError(err.message);
    }
  };

  const handleReadContractBalance = async () => {
    try {
      const bal = await readContractBalance();
      setContractBalance(bal);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReadMyDeposit = async () => {
    if (!account) return;
    try {
      const dep = await readMyDeposit(account);
      setMyDeposit(dep);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReadOnChainMetrics = async () => {
    try {
      const metrics = await readOnChainMetrics();
      setOnChainMetrics(metrics);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReadFundsInfo = async () => {
    try {
      const funds = await readFundsInfo();
      setFundsInfo(funds);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const refreshAllData = async () => {
    if (!isConnected) return;

    try {
      await Promise.all(
        [
          handleReadContractBalance(),
          handleReadOnChainMetrics(),
          handleReadFundsInfo(),
          account && handleReadMyDeposit(),
        ].filter(Boolean)
      );
    } catch (err: any) {
      setError("Failed to refresh data: " + err.message);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    setFloodData(null);
    setOnChainMetrics(null);
    setMyDeposit(null);
    setFundsInfo(null);
    setTxStatus(null);
    setError(null);
    setManuallyDisconnected(true);
  };

  const getThreatLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "text-green-600";
      case 1:
        return "text-yellow-600";
      case 2:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getThreatLevelText = (level: number) => {
    switch (level) {
      case 0:
        return "Low";
      case 1:
        return "Medium";
      case 2:
        return "High";
      default:
        return "Unknown";
    }
  };

  const formatTime = (ts?: number) =>
    ts ? new Date(ts * 1000).toLocaleString() : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌊 FloodPredictor dApp
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Predict flood risks using real-time NOAA data and smart contract
            automation for community protection
          </p>
        </div>

        {/* Wallet Connection */}
        <Card className="border-blue-200 bg-white/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isConnected ? (
              <Button
                onClick={() =>
                  connectWallet({
                    setAccount,
                    setIsConnected,
                    setIsCorrectNetwork,
                    setError,
                  })
                }
                className="w-full sm:w-auto contract-action-btn"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask Wallet
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-sm">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={disconnectWallet}
                    >
                      Disconnect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshAllData}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Refresh
                    </Button>
                  </div>
                </div>

                {!isCorrectNetwork && (
                  <Alert className="border-yellow-500 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>
                        Switch to BlockDAG Network to interact with the contract
                      </span>
                      <Button
                        onClick={() =>
                          switchToBlockDAGNetwork({
                            setIsCorrectNetwork,
                            setError,
                          })
                        }
                        size="sm"
                        className="ml-2"
                      >
                        Switch Network
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {txStatus && (
              <Alert className="border-blue-500 bg-blue-50">
                <Activity className="h-4 w-4" />
                <AlertDescription>{txStatus}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Flood Metrics Dashboard */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* NOAA Data */}
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-blue-600" />
                Live Flood Metrics (NOAA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={fetchFloodMetricsData}
                  disabled={loadingFloodData}
                  variant="outline"
                >
                  {loadingFloodData ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Droplets className="mr-2 h-4 w-4" />
                  )}
                  {loadingFloodData ? "Fetching..." : "Fetch NOAA Data"}
                </Button>

                <Button
                  onClick={handleSendData}
                  disabled={!floodData || !isConnected || !isCorrectNetwork}
                  className="bg-blue-600 text-white hover:bg-blue-700 contract-action-btn"
                >
                  📤 Send to Contract
                </Button>
              </div>

              {floodData && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/70 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Water Level</div>
                    <div className="text-xl font-bold text-blue-700">
                      {floodData.waterLevel.toFixed(2)}m
                    </div>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Next High Tide</div>
                    <div className="text-xl font-bold text-cyan-700">
                      {floodData.tidePrediction.toFixed(2)}m
                    </div>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Current Speed</div>
                    <div className="text-xl font-bold text-teal-700">
                      {floodData.currentSpeed.toFixed(2)} cm/s
                    </div>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Flood Risk</div>
                    <div
                      className={`text-xl font-bold ${
                        floodData.floodRisk ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {floodData.floodRisk ? "🚨 HIGH" : "✅ LOW"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* On-chain Data */}
          <Card className="border-purple-200 bg-purple-50/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                On-Chain Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleReadOnChainMetrics}
                disabled={!isConnected}
              >
                📊 Read Contract Data
              </Button>

              {onChainMetrics && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      Water Level:{" "}
                      <span className="font-bold">
                        {onChainMetrics.waterLevel.toFixed(2)}m
                      </span>
                    </div>
                    <div>
                      Tide Prediction:{" "}
                      <span className="font-bold">
                        {onChainMetrics.tidePrediction.toFixed(2)}m
                      </span>
                    </div>
                    <div>
                      Current Speed:{" "}
                      <span className="font-bold">
                        {onChainMetrics.currentSpeed.toFixed(2)} cm/s
                      </span>
                    </div>
                    <div>
                      Threat Level:
                      <span
                        className={`font-bold ml-1 ${getThreatLevelColor(
                          onChainMetrics.threatLevel
                        )}`}
                      >
                        {getThreatLevelText(onChainMetrics.threatLevel)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-purple-200">
                <div className="text-sm text-gray-600">Contract Balance</div>
                <div className="text-2xl font-bold text-purple-700">
                  {contractBalance} ETH
                </div>
                {fundsInfo && (
                  <div className="text-xs text-gray-500 mt-1">
                    Sponsors: {fundsInfo.sponsorFunds} ETH • Investors:{" "}
                    {fundsInfo.investorFunds} ETH
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Actions */}
        <Card className="border-green-200 bg-green-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Funding & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                onClick={() => handleDepositSponsor()}
                disabled={!isConnected || !isCorrectNetwork}
                className="contract-action-btn bg-blue-600 hover:bg-blue-700"
              >
                💰 Sponsor Deposit
              </Button>
              <Button
                onClick={() => handleDepositInvestor()}
                disabled={!isConnected || !isCorrectNetwork}
                className="contract-action-btn bg-green-600 hover:bg-green-700"
              >
                📈 Investor Deposit
              </Button>
              <Button
                onClick={handleAddBeneficiary}
                disabled={!isConnected || !isCorrectNetwork}
                className="contract-action-btn bg-purple-600 hover:bg-purple-700"
              >
                👥 Add Beneficiary
              </Button>
              <Button
                onClick={handleTriggerWithdrawals}
                disabled={!isConnected || !isCorrectNetwork}
                className="contract-action-btn bg-orange-600 hover:bg-orange-700"
              >
                💸 Trigger Withdrawals
              </Button>
            </div>

            {/* My Investment Info */}
            {myDeposit && parseFloat(myDeposit.amount) > 0 && (
              <div className="mt-4 p-4 bg-white/70 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  My Investment
                </h4>
                <div className="grid sm:grid-cols-3 gap-2 text-sm">
                  <div>
                    Amount:{" "}
                    <span className="font-bold">{myDeposit.amount} ETH</span>
                  </div>
                  <div>
                    Deposited:{" "}
                    <span className="font-mono">
                      {formatTime(myDeposit.depositTime)}
                    </span>
                  </div>
                  <div>
                    Status:{" "}
                    <span
                      className={`font-bold ${
                        myDeposit.withdrawn ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {myDeposit.withdrawn ? "Withdrawn" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-green-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTxStatus(null)}
              >
                Clear Status
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                Clear Errors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAllData}
                disabled={!isConnected}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Refresh All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contract Debug (only show if there are connection issues) */}
        <ContractDebug />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>
            🌊 FloodPredictor dApp • Powered by NOAA Data & BlockDAG Network
          </p>
        </div>
      </div>
    </div>
  );
}
