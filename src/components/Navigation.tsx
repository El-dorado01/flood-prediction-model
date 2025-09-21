import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Waves,
  Menu,
  X,
  Shield,
  TrendingUp,
  Eye,
  LogOut,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface NavigationProps {
  onSectionChange?: (section: string) => void;
  currentSection?: string;
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
  isLoading: boolean;
  handleConnectWallet: () => Promise<void>;
  handleSwitchNetwork: () => Promise<void>;
  handleDisconnectWallet: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  onSectionChange,
  currentSection = "hero",
  account,
  isConnected,
  isCorrectNetwork,
  error,
  isLoading,
  handleConnectWallet,
  handleSwitchNetwork,
  handleDisconnectWallet,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "Home", icon: Waves },
    { id: "dashboard", label: "Monitor", icon: Eye },
    { id: "funding", label: "Fund", icon: TrendingUp },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-ocean">
              <Image src={"/logo.svg"} alt="Logo" width={30} height={30} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">AidFund</h1>
              <Badge variant="secondary" className="text-xs">
                dApp
              </Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onSectionChange?.(item.id)}
                  className={`flex items-center gap-2 text-black ${
                    isActive && "bg-[#0c3355] text-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Status indicator and wallet controls */}
          <div className="hidden md:flex items-center gap-4">
            <Badge className="status-low">🟢 Online</Badge>
            {isConnected ? (
              <>
                <Badge variant="outline" className="bg-success/10 text-success">
                  Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                </Badge>
                {!isCorrectNetwork && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchNetwork}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      "Switch to BlockDAG"
                    )}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDisconnectWallet}
                  disabled={isLoading}
                >
                  <LogOut className="h-4 w-4 " />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectWallet}
                disabled={isLoading}
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

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => onSectionChange?.(item.id)}
                    className={`w-full justify-start gap-2 ${
                      isActive && "bg-[#0c3355]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
              <div className="pt-4 mt-4 border-t border-border">
                {isConnected ? (
                  <>
                    <Badge
                      variant="outline"
                      className="w-full justify-center mb-2 bg-success/10 text-success"
                    >
                      Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                    </Badge>
                    {!isCorrectNetwork && (
                      <Button
                        variant="outline"
                        className="w-full mb-2"
                        onClick={handleSwitchNetwork}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          "Switch to BlockDAG"
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mb-2"
                      onClick={handleDisconnectWallet}
                      disabled={isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={handleConnectWallet}
                    disabled={isLoading}
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
                <div className="flex justify-center">
                  <Badge className="status-low">🟢 System Online</Badge>
                </div>
                {error && (
                  <div className="flex justify-center mt-2">
                    <Badge variant="destructive">{error}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
