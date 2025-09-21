import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Droplets,
  Waves,
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock,
  RefreshCw,
} from "lucide-react";
import { readOnChainMetrics, sendDataToContract } from "@/lib/contractActions";
import { FloodMetrics } from "@/types/noaa";

// Define ThreatLevel interface for UI
interface ThreatLevel {
  level: "low" | "medium" | "high";
  label: string;
  description: string;
  color: string;
}

interface FloodDashboardProps {
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const FloodDashboard: React.FC<FloodDashboardProps> = ({
  account,
  isConnected,
  isCorrectNetwork,
  error,
  isLoading,
  setIsLoading,
}) => {
  const [metrics, setMetrics] = useState<FloodMetrics | null>(null);
  const [threatLevel, setThreatLevel] = useState<number | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  // Map numeric threatLevel from readOnChainMetrics to FloodMetrics with floodRisk
  const mapToFloodMetrics = (data: {
    waterLevel: number;
    tidePrediction: number;
    currentSpeed: number;
    threatLevel: number;
  }): FloodMetrics => ({
    waterLevel: data.waterLevel,
    tidePrediction: data.tidePrediction,
    currentSpeed: data.currentSpeed,
    floodRisk: data.threatLevel >= 2, // Map threatLevel >= 2 to true, 1 to false
  });

  // Map threatLevel (number) to ThreatLevel for UI
  const mapThreatLevel = (threatLevel: number | null): ThreatLevel => {
    switch (threatLevel) {
      case 1:
        return {
          level: "low",
          label: "Low Risk",
          description: "Water levels are normal and stable",
          color: "green",
        };
      case 2:
        return {
          level: "medium",
          label: "Medium Risk",
          description: "Water levels are elevated but stable",
          color: "yellow",
        };
      case 3:
        return {
          level: "high",
          label: "High Risk",
          description: "Critical water levels, immediate action required",
          color: "red",
        };
      default:
        return {
          level: "low",
          label: "Unknown",
          description: "No valid threat level data",
          color: "gray",
        };
    }
  };

  // Fetch initial metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!isConnected || !isCorrectNetwork) return;
      setIsLoading(true);
      setTransactionStatus(null);
      try {
        const fetchedMetrics = await readOnChainMetrics();
        setMetrics(mapToFloodMetrics(fetchedMetrics));
        setThreatLevel(fetchedMetrics.threatLevel);
      } catch (err: any) {
        setTransactionStatus(err.message || "Failed to fetch metrics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, [isConnected, isCorrectNetwork, setIsLoading]);

  const getThreatBadge = (threat: ThreatLevel) => {
    switch (threat.level) {
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Low Risk
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-colors">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            Medium Risk
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-colors animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
            High Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            Unknown
          </Badge>
        );
    }
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500";
    if (value < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleUpdateMetrics = async () => {
    if (!isConnected) {
      setTransactionStatus("Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      setTransactionStatus("Please switch to the Primordial BlockDAG Testnet");
      return;
    }
    if (!metrics) {
      setTransactionStatus("No metrics available to update");
      return;
    }
    setIsLoading(true);
    setTransactionStatus(null);
    try {
      await sendDataToContract(metrics);
      setTransactionStatus("Successfully updated metrics on-chain");
      // Refresh metrics after update
      const fetchedMetrics = await readOnChainMetrics();
      setMetrics(mapToFloodMetrics(fetchedMetrics));
      setThreatLevel(fetchedMetrics.threatLevel);
    } catch (err: any) {
      setTransactionStatus(err.message || "Failed to update metrics");
    } finally {
      setIsLoading(false);
    }
  };

  const currentThreat = mapThreatLevel(threatLevel);

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

      {/* Current Threat Status */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
            <Waves className="h-10 w-10 text-white drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
            Current Flood Status
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            {currentThreat.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-8">
          <div className="flex justify-center mb-8">
            {getThreatBadge(currentThreat)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 p-4 rounded-lg bg-white/60 border border-slate-200/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Water Level
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {metrics ? `${metrics.waterLevel} ft` : "N/A"}
                </span>
              </div>
              <Progress
                value={metrics ? metrics.waterLevel : 0}
                className={`h-3 bg-slate-200 ${getProgressColor(metrics ? metrics.waterLevel : 0)}`}
              />
              <div className="text-xs text-slate-500">Threshold: 2.00m</div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-white/60 border border-slate-200/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Tide Height
                </span>
                <span className="text-sm font-bold text-cyan-600">
                  {metrics ? `${metrics.tidePrediction} ft` : "N/A"}
                </span>
              </div>
              <Progress
                value={metrics ? metrics.tidePrediction : 0}
                className={`h-3 bg-slate-200 ${getProgressColor(metrics ? metrics.tidePrediction : 0)}`}
              />
              <div className="text-xs text-slate-500">High tide at 3:42 PM</div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-white/60 border border-slate-200/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Current Speed
                </span>
                <span className="text-sm font-bold text-teal-600">
                  {metrics ? `${metrics.currentSpeed} kt` : "N/A"}
                </span>
              </div>
              <Progress
                value={metrics ? metrics.currentSpeed : 0}
                className={`h-3 bg-slate-200 ${getProgressColor(metrics ? metrics.currentSpeed : 0)}`}
              />
              <div className="text-xs text-slate-500">Increasing trend</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NOAA Data Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-white group hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Water Level
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
              <Droplets className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-blue-700">
              {metrics ? `${metrics.waterLevel} ft` : "N/A"}
            </div>
            <p className="text-sm text-red-600 font-medium">
              {metrics ? `+${(metrics.waterLevel - 12.9).toFixed(1)} ft from normal` : "N/A"}
            </p>
            <div className="mt-3">
              <Progress
                value={metrics ? metrics.waterLevel : 0}
                className={`h-2 bg-blue-100 ${getProgressColor(metrics ? metrics.waterLevel : 0)}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-white group hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Tide Prediction
            </CardTitle>
            <div className="p-2 bg-cyan-100 rounded-full group-hover:bg-cyan-200 transition-colors">
              <Waves className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-cyan-700">
              {metrics ? `${metrics.tidePrediction} ft` : "N/A"}
            </div>
            <p className="text-sm text-slate-600">Peak at 3:42 PM</p>
            <div className="mt-3">
              <Progress
                value={metrics ? metrics.tidePrediction : 0}
                className={`h-2 bg-cyan-100 ${getProgressColor(metrics ? metrics.tidePrediction : 0)}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-teal-50 to-white group hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Current Speed
            </CardTitle>
            <div className="p-2 bg-teal-100 rounded-full group-hover:bg-teal-200 transition-colors">
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-teal-700">
              {metrics ? `${metrics.currentSpeed} kt` : "N/A"}
            </div>
            <p className="text-sm text-orange-600 font-medium">
              {metrics ? "Increasing trend" : "N/A"}
            </p>
            <div className="mt-3">
              <Progress
                value={metrics ? metrics.currentSpeed : 0}
                className={`h-2 bg-teal-100 ${getProgressColor(metrics ? metrics.currentSpeed : 0)}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
        <Button
          size="lg"
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={handleUpdateMetrics}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {isLoading ? "Updating..." : "Update Metrics"}
        </Button>

        <Button
          size="lg"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Clock className="h-4 w-4" />
          View History
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="flex items-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <AlertTriangle className="h-4 w-4" />
          Emergency Alert
        </Button>
      </div>
    </div>
  );
};

export default FloodDashboard;