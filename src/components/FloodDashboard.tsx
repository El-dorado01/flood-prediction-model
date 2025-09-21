import React, { useState } from "react";
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

interface ThreatLevel {
  level: "low" | "medium" | "high";
  label: string;
  description: string;
  color: string;
}

const FloodDashboard: React.FC = () => {
  const [currentThreat] = useState<ThreatLevel>({
    level: "medium",
    label: "Medium Risk",
    description: "Water levels are elevated but stable",
    color: "yellow",
  });

  const [waterLevel] = useState(85);
  const [tideHeight] = useState(72);
  const [currentSpeed] = useState(45);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdateMetrics = () => {
    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
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
                  {waterLevel}%
                </span>
              </div>
              <Progress value={waterLevel} className="h-3 bg-slate-200" />
              <div className="text-xs text-slate-500">Threshold: 2.00m</div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-white/60 border border-slate-200/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Tide Height
                </span>
                <span className="text-sm font-bold text-cyan-600">
                  {tideHeight}%
                </span>
              </div>
              <Progress value={tideHeight} className="h-3 bg-slate-200" />
              <div className="text-xs text-slate-500">High tide at 3:42 PM</div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-white/60 border border-slate-200/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Current Speed
                </span>
                <span className="text-sm font-bold text-teal-600">
                  {currentSpeed}%
                </span>
              </div>
              <Progress value={currentSpeed} className="h-3 bg-slate-200" />
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
            <div className="text-3xl font-bold text-blue-700">15.2 ft</div>
            <p className="text-sm text-red-600 font-medium">
              +2.3 ft from normal
            </p>
            <div className="mt-3">
              <Progress value={waterLevel} className="h-2 bg-blue-100" />
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
            <div className="text-3xl font-bold text-cyan-700">High Tide</div>
            <p className="text-sm text-slate-600">Peak at 3:42 PM</p>
            <div className="mt-3">
              <Progress value={tideHeight} className="h-2 bg-cyan-100" />
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
            <div className="text-3xl font-bold text-teal-700">3.8 kt</div>
            <p className="text-sm text-orange-600 font-medium">
              Increasing trend
            </p>
            <div className="mt-3">
              <Progress value={currentSpeed} className="h-2 bg-teal-100" />
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
          disabled={isUpdating}
        >
          {isUpdating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {isUpdating ? "Updating..." : "Update Metrics"}
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
