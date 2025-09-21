"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FloodDashboard from "@/components/FloodDashboard";
import FundingInterface from "@/components/FundingInterface";
import {
  connectWallet,
  switchToBlockDAGNetwork,
  setupWalletListeners,
  WalletState,
  BLOCKDAG_CHAIN_ID_DEC,
} from "@/lib/wallet";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("hero");
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  let cleanupWalletListeners: (() => void) | undefined = undefined;

  // Wallet connection handler
  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connectWallet({
        setAccount,
        setIsConnected,
        setIsCorrectNetwork,
        setError,
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Network switch handler
  const handleSwitchNetwork = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await switchToBlockDAGNetwork({ setIsCorrectNetwork, setError });
    } catch (err: any) {
      setError(err.message || "Failed to switch network");
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet handler
  const handleDisconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    setError(null);
    if (cleanupWalletListeners) {
      cleanupWalletListeners();
      cleanupWalletListeners = undefined;
    }
  };

  // Setup wallet listeners
  useEffect(() => {
    cleanupWalletListeners = setupWalletListeners({
      onAccountsChanged: (accounts) => {
        setAccount(accounts[0] || null);
        setIsConnected(!!accounts[0]);
        setError(null);
      },
      onChainChanged: async () => {
        const provider = window.ethereum;
        if (provider) {
          const chainId = (await provider.request({
            method: "eth_chainId",
          })) as string;
          setIsCorrectNetwork(parseInt(chainId, 16) === BLOCKDAG_CHAIN_ID_DEC);
        }
      },
    });
    return () => {
      if (cleanupWalletListeners) {
        cleanupWalletListeners();
      }
    };
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case "hero":
        return (
          <Hero
            account={account}
            isConnected={isConnected}
            isCorrectNetwork={isCorrectNetwork}
            error={error}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            handleConnectWallet={handleConnectWallet}
            handleSwitchNetwork={handleSwitchNetwork}
            handleDisconnectWallet={handleDisconnectWallet}
          />
        );
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
              <FloodDashboard
                account={account}
                isConnected={isConnected}
                isCorrectNetwork={isCorrectNetwork}
                error={error}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
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
              <FundingInterface
                account={account}
                isConnected={isConnected}
                isCorrectNetwork={isCorrectNetwork}
                error={error}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        );
      default:
        return (
          <Hero
            account={account}
            isConnected={isConnected}
            isCorrectNetwork={isCorrectNetwork}
            error={error}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            handleConnectWallet={handleConnectWallet}
            handleSwitchNetwork={handleSwitchNetwork}
            handleDisconnectWallet={handleDisconnectWallet}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        account={account}
        isConnected={isConnected}
        isCorrectNetwork={isCorrectNetwork}
        error={error}
        isLoading={isLoading}
        handleConnectWallet={handleConnectWallet}
        handleSwitchNetwork={handleSwitchNetwork}
        handleDisconnectWallet={handleDisconnectWallet}
      />
      {renderSection()}
    </div>
  );
};

export default Index;
