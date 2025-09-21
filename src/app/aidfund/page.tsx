"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FloodDashboard from "@/components/FloodDashboard";
import FundingInterface from "@/components/FundingInterface";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("hero");

  const renderSection = () => {
    switch (currentSection) {
      case "hero":
        return <Hero />;
      case "dashboard":
        return (
          <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent">
                  Flood Risk Monitoring
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Real-time NOAA data integration for accurate flood threat
                  assessment and automated response
                </p>
              </div>
              <FloodDashboard />
            </div>
          </div>
        );
      case "funding":
        return (
          <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  Community Funding
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Support disaster relief through sponsorships or earn returns
                  through investment
                </p>
              </div>
              <FundingInterface />
            </div>
          </div>
        );
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      {renderSection()}
    </div>
  );
};

export default Index;
