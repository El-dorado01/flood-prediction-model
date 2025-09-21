import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  TrendingUp,
  Shield,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  depositAsSponsor,
  depositAsInvestor,
  readFundsInfo,
  addBeneficiary,
  manualDisbursement,
} from "@/lib/contractActions";

interface FundingData {
  totalFunds: string;
  sponsorFunds: string;
  investorFunds: string;
}

interface FundingInterfaceProps {
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const FundingInterface: React.FC<FundingInterfaceProps> = ({
  account,
  isConnected,
  isCorrectNetwork,
  error,
  isLoading,
  setIsLoading,
}) => {
  const [sponsorAmount, setSponsorAmount] = useState("");
  const [investorAmount, setInvestorAmount] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );
  const [fundingData, setFundingData] = useState<FundingData | null>(null);
  const fundingGoal = 200; // Static goal in ETH, configurable via .env if needed

  // Fetch funding data on mount
  useEffect(() => {
    const fetchFundingData = async () => {
      if (!isConnected || !isCorrectNetwork) return;
      setIsLoading(true);
      setTransactionStatus(null);
      try {
        const data = await readFundsInfo();
        setFundingData({
          totalFunds: data.totalFunds,
          sponsorFunds: data.sponsorFunds,
          investorFunds: data.investorFunds,
        });
      } catch (err: any) {
        setTransactionStatus(err.message || "Failed to fetch funding data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFundingData();
  }, [isConnected, isCorrectNetwork, setIsLoading]);

  const progressPercentage = fundingData
    ? (Number(fundingData.totalFunds) / fundingGoal) * 100
    : 0;

  const handleSponsorSubmit = async () => {
    if (!isConnected) {
      setTransactionStatus("Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      setTransactionStatus("Please switch to the Primordial BlockDAG Testnet");
      return;
    }
    if (
      !sponsorAmount ||
      isNaN(Number(sponsorAmount)) ||
      Number(sponsorAmount) <= 0
    ) {
      setTransactionStatus("Please enter a valid sponsorship amount");
      return;
    }
    setIsLoading(true);
    setTransactionStatus(null);
    try {
      await depositAsSponsor(sponsorAmount);
      setTransactionStatus(`Successfully sponsored ${sponsorAmount} ETH`);
      setSponsorAmount("");
      // Refresh funding data
      const data = await readFundsInfo();
      setFundingData({
        totalFunds: data.totalFunds,
        sponsorFunds: data.sponsorFunds,
        investorFunds: data.investorFunds,
      });
    } catch (err: any) {
      setTransactionStatus(err.message || "Failed to sponsor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestorSubmit = async () => {
    if (!isConnected) {
      setTransactionStatus("Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      setTransactionStatus("Please switch to the Primordial BlockDAG Testnet");
      return;
    }
    if (
      !investorAmount ||
      isNaN(Number(investorAmount)) ||
      Number(investorAmount) <= 0
    ) {
      setTransactionStatus("Please enter a valid investment amount");
      return;
    }
    setIsLoading(true);
    setTransactionStatus(null);
    try {
      await depositAsInvestor(investorAmount);
      setTransactionStatus(`Successfully invested ${investorAmount} ETH`);
      setInvestorAmount("");
      // Refresh funding data
      const data = await readFundsInfo();
      setFundingData({
        totalFunds: data.totalFunds,
        sponsorFunds: data.sponsorFunds,
        investorFunds: data.investorFunds,
      });
    } catch (err: any) {
      setTransactionStatus(err.message || "Failed to invest");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBeneficiary = async () => {
    if (!isConnected) {
      setTransactionStatus("Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      setTransactionStatus("Please switch to the Primordial BlockDAG Testnet");
      return;
    }
    if (
      !beneficiaryAddress ||
      !/^0x[a-fA-F0-9]{40}$/.test(beneficiaryAddress)
    ) {
      setTransactionStatus("Please enter a valid Ethereum address");
      return;
    }
    setIsLoading(true);
    setTransactionStatus(null);
    try {
      await addBeneficiary(beneficiaryAddress);
      setTransactionStatus(
        `Successfully added beneficiary ${beneficiaryAddress.slice(0, 6)}...`
      );
      setBeneficiaryAddress("");
      // Refresh funding data
      const data = await readFundsInfo();
      setFundingData({
        totalFunds: data.totalFunds,
        sponsorFunds: data.sponsorFunds,
        investorFunds: data.investorFunds,
      });
    } catch (err: any) {
      setTransactionStatus(err.message || "Failed to add beneficiary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualDisbursement = async () => {
    if (!isConnected) {
      setTransactionStatus("Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      setTransactionStatus("Please switch to the Primordial BlockDAG Testnet");
      return;
    }
    setIsLoading(true);
    setTransactionStatus(null);
    try {
      await manualDisbursement();
      setTransactionStatus("Successfully triggered manual disbursement");
      // Refresh funding data
      const data = await readFundsInfo();
      setFundingData({
        totalFunds: data.totalFunds,
        sponsorFunds: data.sponsorFunds,
        investorFunds: data.investorFunds,
      });
    } catch (err: any) {
      setTransactionStatus(err.message || "Failed to trigger disbursement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      {/* Error and Transaction Status */}
      {error && (
        <Badge variant="destructive" className="mb-6">
          {error}
        </Badge>
      )}
      {transactionStatus && (
        <Badge variant="outline" className="mb-6 bg-success/10 text-success">
          {transactionStatus}
        </Badge>
      )}

      {/* Funding Overview */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
            <Heart className="h-8 w-8 text-white drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Community Disaster Relief Fund
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Transparent, automated flood response funding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 rounded-lg bg-white/60 border border-slate-200/50 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {fundingData
                  ? `${Number(fundingData.totalFunds).toFixed(2)} ETH`
                  : "N/A"}
              </div>
              <p className="text-sm text-slate-600 font-medium">Total Funds</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/60 border border-slate-200/50 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {fundingData
                  ? `${Number(fundingData.sponsorFunds).toFixed(2)} ETH`
                  : "N/A"}
              </div>
              <p className="text-sm text-slate-600 font-medium">
                Sponsor Funds
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/60 border border-slate-200/50 shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {fundingData
                  ? `${Number(fundingData.investorFunds).toFixed(2)} ETH`
                  : "N/A"}
              </div>
              <p className="text-sm text-slate-600 font-medium">
                Investor Funds
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-lg bg-white/60 border border-slate-200/50">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-700">Progress to Goal</span>
              <span className="text-slate-900">
                {fundingData
                  ? `${Number(fundingData.totalFunds).toFixed(2)} ETH`
                  : "N/A"}{" "}
                / {fundingGoal} ETH
              </span>
            </div>
            <Progress value={progressPercentage} className="h-4 bg-slate-200" />
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">
                {Math.round(progressPercentage)}% funded
              </span>
              <span className="text-slate-600">
                {fundingData
                  ? `${(fundingGoal - Number(fundingData.totalFunds)).toFixed(
                      2
                    )} ETH`
                  : "N/A"}{" "}
                remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Options */}
      <Tabs defaultValue="sponsor" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 shadow-sm">
          <TabsTrigger
            value="sponsor"
            className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 font-medium"
          >
            <Heart className="h-4 w-4" />
            Sponsor
          </TabsTrigger>
          <TabsTrigger
            value="investor"
            className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 font-medium"
          >
            <TrendingUp className="h-4 w-4" />
            Invest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sponsor" className="space-y-6 mt-6">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-green-800">Become a Sponsor</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Make a non-refundable contribution for disaster relief. Your
                funds will be used to help communities during flood emergencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="sponsor-amount"
                  className="text-sm font-semibold text-slate-700"
                >
                  Sponsorship Amount (ETH)
                </Label>
                <Input
                  id="sponsor-amount"
                  type="number"
                  placeholder="0.1"
                  value={sponsorAmount}
                  onChange={(e) => setSponsorAmount(e.target.value)}
                  className="text-lg h-12 border-2 border-slate-200 focus:border-green-400 transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-green-50/80 border border-green-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 mb-1">
                      Direct Impact
                    </p>
                    <p className="text-sm text-green-700">
                      100% goes to disaster relief
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tax Deductible
                </Badge>
              </div>

              <Button
                size="lg"
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={handleSponsorSubmit}
                disabled={!sponsorAmount || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Heart className="h-5 w-5 mr-2" />
                )}
                {isLoading ? "Processing..." : "Sponsor Community Relief"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investor" className="space-y-6 mt-6">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-blue-800">Become an Investor</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Make a refundable investment with 5% annual interest. Funds are
                locked for 365 days and help provide emergency liquidity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="investor-amount"
                  className="text-sm font-semibold text-slate-700"
                >
                  Investment Amount (ETH)
                </Label>
                <Input
                  id="investor-amount"
                  type="number"
                  placeholder="1.0"
                  value={investorAmount}
                  onChange={(e) => setInvestorAmount(e.target.value)}
                  className="text-lg h-12 border-2 border-slate-200 focus:border-blue-400 transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-blue-50/80 border border-blue-200 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="font-bold text-blue-800 text-lg">5% APY</p>
                  <p className="text-sm text-blue-700">Annual return</p>
                </div>
                <div className="p-6 bg-purple-50/80 border border-purple-200 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="font-bold text-purple-800 text-lg">365 Days</p>
                  <p className="text-sm text-purple-700">Lock period</p>
                </div>
              </div>

              <div className="p-6 bg-orange-50/80 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-full mt-1">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800 mb-1">
                      Risk Notice
                    </p>
                    <p className="text-sm text-orange-700">
                      Withdrawals blocked during high flood threat periods.
                      Funds may be used for emergency disbursement.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={handleInvestorSubmit}
                disabled={!investorAmount || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-5 w-5 mr-2" />
                )}
                {isLoading ? "Processing..." : "Invest in Community Safety"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fund Distribution Status */}
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-full">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <span className="text-slate-800">Fund Distribution Status</span>
          </CardTitle>
          <CardDescription className="text-slate-600">
            Automatic disbursement to registered beneficiaries during high
            threat events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-6 border-2 border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors">
              <div className="text-3xl font-bold text-blue-600 mb-2">Auto</div>
              <p className="text-sm text-slate-600 font-medium">
                Distribution Mode
              </p>
            </div>
            <div className="text-center p-6 border-2 border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                Ready
              </div>
              <p className="text-sm text-slate-600 font-medium">
                System Status
              </p>
            </div>
            {/* TODO: Reintroduce Active Beneficiaries card when getBeneficiariesCount function is available */}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label
                htmlFor="beneficiary-address"
                className="text-sm font-semibold text-slate-700"
              >
                Add Beneficiary (Ethereum Address)
              </Label>
              <Input
                id="beneficiary-address"
                type="text"
                placeholder="0x..."
                value={beneficiaryAddress}
                onChange={(e) => setBeneficiaryAddress(e.target.value)}
                className="text-lg h-12 border-2 border-slate-200 focus:border-blue-400 transition-colors"
                disabled={isLoading}
              />
            </div>
            <Button
              size="lg"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleAddBeneficiary}
              disabled={!beneficiaryAddress || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Users className="h-5 w-5 mr-2" />
              )}
              {isLoading ? "Processing..." : "Add Beneficiary"}
            </Button>
            <Button
              size="lg"
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleManualDisbursement}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <DollarSign className="h-5 w-5 mr-2" />
              )}
              {isLoading ? "Processing..." : "Trigger Manual Disbursement"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundingInterface;
