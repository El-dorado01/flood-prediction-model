import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Waves,
  Users,
  TrendingUp,
  Eye,
  Heart,
  Loader2,
  LogOut,
} from "lucide-react";
import { sponsors } from "./sponsors";
// import { readOnChainMetrics, depositAsSponsor } from "@/lib/contractActions";

// Define local FloodMetrics type to match readOnChainMetrics output
interface FloodMetrics {
  waterLevel: number;
  tidePrediction: number;
  currentSpeed: number;
  threatLevel: number;
}

interface HeroProps {
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleConnectWallet: () => Promise<void>;
  handleSwitchNetwork: () => Promise<void>;
  handleDisconnectWallet: () => void;
}

// Utility function to map threatLevel number to string
const mapThreatLevelToString = (threatLevel: number): string => {
  switch (threatLevel) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    default:
      return "Unknown";
  }
};

const Hero: React.FC<HeroProps> = ({
  account,
  isConnected,
  isCorrectNetwork,
  error,
  isLoading,
  // setIsLoading,
  handleConnectWallet,
  handleSwitchNetwork,
  handleDisconnectWallet,
}) => {
  // const [transactionStatus, setTransactionStatus] = useState<string | null>(
  //   null
  // );
  // const [metrics, setMetrics] = useState<FloodMetrics | null>(null);
  // const [showMetrics, setShowMetrics] = useState<boolean>(false);

  // Monitor flood risk handler
  // const handleMonitorFloodRisk = async () => {
  //   if (!isConnected) {
  //     setTransactionStatus("Please connect your wallet first");
  //     return;
  //   }
  //   if (!isCorrectNetwork) {
  //     setTransactionStatus("Please switch to the Primordial BlockDAG Testnet");
  //     return;
  //   }
  //   setIsLoading(true);
  //   setTransactionStatus(null);
  //   try {
  //     const fetchedMetrics = await readOnChainMetrics();
  //     setMetrics(fetchedMetrics);
  //     setShowMetrics(true);
  //     setTransactionStatus("Successfully fetched flood metrics");
  //   } catch (err: any) {
  //     setTransactionStatus(err.message || "Failed to fetch flood metrics");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Support community (deposit as sponsor) handler
  // const handleSupportCommunity = async () => {
  //   if (!isConnected) {
  //     setTransactionStatus("Please connect your wallet first");
  //     return;
  //   }
  //   if (!isCorrectNetwork) {
  //     setTransactionStatus("Please switch to the Primordial BlockDAG Testnet");
  //     return;
  //   }
  //   setIsLoading(true);
  //   setTransactionStatus(null);
  //   try {
  //     await depositAsSponsor("0.1");
  //     setTransactionStatus("Successfully deposited 0.1 ETH as sponsor!");
  //   } catch (err: any) {
  //     setTransactionStatus(err.message || "Failed to deposit as sponsor");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/hero-flood-prediction.jpg')]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-background/90" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-20 w-3 h-3 bg-accent/40 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-20 w-2 h-2 bg-primary/20 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-60 right-10 w-4 h-4 bg-accent/30 rounded-full animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Status badge */}
        <Badge className="mb-6 status-low animate-fade-in">
          🟢 System Online • Real-time Monitoring Active
        </Badge>

        {/* Wallet status */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          {isConnected ? (
            <>
              <Badge variant="outline" className="bg-success/10 text-success">
                Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
              </Badge>
              {!isCorrectNetwork && (
                <Button
                  size="sm"
                  onClick={handleSwitchNetwork}
                  disabled={isLoading}
                  className="bg-warning"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    "Switch to BlockDAG Testnet"
                  )}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleDisconnectWallet}
                disabled={isLoading}
                className="bg-destructive/80"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="bg-[#0c3355]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>

        {/* Error and transaction status */}
        {error && (
          <Badge variant="destructive" className="mb-6">
            {error}
          </Badge>
        )}
        {/* {transactionStatus && (
          <Badge variant="outline" className="mb-6 bg-success/10 text-success">
            {transactionStatus}
          </Badge>
        )} */}

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-ocean bg-clip-text text-transparent animate-fade-in">
          FloodPredictor
        </h1>

        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90 mb-4 animate-fade-in">
          Decentralized Flood Risk Management
        </h2>

        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed animate-fade-in">
          Combining real-time NOAA weather data with blockchain technology for
          transparent, automated flood prediction and community-driven disaster
          relief funding.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in">
          <Button
            size="lg"
            // onClick={handleMonitorFloodRisk}
            // disabled={isLoading}
            className="pulse-glow bg-[#0c3355]"
          >
            <Eye className="h-5 w-5 mr-2" />
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Monitor Flood Risk"
            )}
          </Button>
          <Button
            size="lg"
            // onClick={handleSupportCommunity}
            // disabled={isLoading}
            className="bg-[#61b092]"
          >
            <Heart className="h-5 w-5 mr-2" />
            Support Community
          </Button>
        </div>

        {/* Metrics Display */}
        {/* {showMetrics && metrics && (
          <Card className="card-float glass-effect mb-16 w-full max-w-2xl animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Flood Risk Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Water Level
                  </p>
                  <p className="text-lg font-semibold">
                    {metrics.waterLevel} ft
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tide Prediction
                  </p>
                  <p className="text-lg font-semibold">
                    {metrics.tidePrediction} ft
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Speed
                  </p>
                  <p className="text-lg font-semibold">
                    {metrics.currentSpeed} knots
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Threat Level
                  </p>
                  <p className="text-lg font-semibold">
                    {mapThreatLevelToString(metrics.threatLevel)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-6 w-full"
                onClick={() => setShowMetrics(false)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )} */}

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl animate-fade-in">
          <Card className="card-float glass-effect">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Waves className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Live NOAA data integration for accurate flood risk assessment
              </p>
            </CardContent>
          </Card>

          <Card className="card-float glass-effect">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Automated Protection</h3>
              <p className="text-sm text-muted-foreground">
                Smart contracts automatically manage and distribute emergency
                funds
              </p>
            </CardContent>
          </Card>

          <Card className="card-float glass-effect">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                Transparent funding from sponsors and investors for disaster
                relief
              </p>
            </CardContent>
          </Card>

          <Card className="card-float glass-effect">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Investor Returns</h3>
              <p className="text-sm text-muted-foreground">
                5% annual returns on investments while supporting communities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trusted Sponsors Section */}
        <div className="mt-16 w-full max-w-6xl animate-fade-in">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold mb-2">
              Trusted by Leading Organizations
            </h3>
            <p className="text-muted-foreground">
              Supporting communities through innovative flood prediction
              technology
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sponsors.map((sponsor, index) => (
              <Card
                key={sponsor.name}
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group cursor-pointer shadow-lg hover:shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 flex items-center justify-center bg-background rounded-full border-2 border-border group-hover:border-primary/30 transition-colors">
                      <img
                        src={sponsor.logo}
                        alt={`${sponsor.name} logo`}
                        className="w-12 h-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground/90 group-hover:text-primary transition-colors">
                        {sponsor.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sponsor.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-muted-foreground animate-fade-in">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Blockchain Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4" />
            <span className="text-sm">NOAA Verified Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">Community Governed</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default Hero;
