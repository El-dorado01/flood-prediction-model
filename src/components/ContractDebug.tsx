"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bug, CheckCircle, XCircle, AlertTriangle, Users } from "lucide-react";
import { debugContract } from "@/lib/contractActions";

interface DebugInfo {
  address: string;
  isDeployed: boolean;
  balance: string;
  network: string;
  owner?: string;
  userAddress?: string;
  isOwner?: boolean;
  beneficiaryCount?: number;
  canDisburse?: boolean;
}

export default function ContractDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDebug = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await debugContract();
      setDebugInfo(info);
    } catch (err: any) {
      setError(err.message);
      setDebugInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-orange-600" />
          Contract Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDebug}
          disabled={loading}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {loading ? "Checking..." : "🔍 Debug Contract"}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                <span className="font-medium">Contract Address:</span>
                <span className="font-mono text-xs break-all">
                  {debugInfo.address}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                <span className="font-medium">Contract Deployed:</span>
                <span className="flex items-center gap-2">
                  {debugInfo.isDeployed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-bold">YES</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-bold">NO</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                <span className="font-medium">Contract Balance:</span>
                <span className="font-bold">{debugInfo.balance} ETH</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                <span className="font-medium">Network:</span>
                <span className="font-mono text-xs">{debugInfo.network}</span>
              </div>

              {debugInfo.owner && (
                <>
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <span className="font-medium">Contract Owner:</span>
                    <span className="font-mono text-xs break-all">
                      {debugInfo.owner}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <span className="font-medium">Your Address:</span>
                    <span className="font-mono text-xs break-all">
                      {debugInfo.userAddress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <span className="font-medium">You are Owner:</span>
                    <span className="flex items-center gap-2">
                      {debugInfo.isOwner ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-bold">YES</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-bold">NO</span>
                        </>
                      )}
                    </span>
                  </div>

                  {typeof debugInfo.beneficiaryCount !== "undefined" && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                        <span className="font-medium">
                          Beneficiaries Count:
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-bold">
                            {debugInfo.beneficiaryCount}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                        <span className="font-medium">
                          Can Disburse on High Threat:
                        </span>
                        <span className="flex items-center gap-2">
                          {debugInfo.canDisburse ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-bold">
                                YES
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-red-600 font-bold">NO</span>
                            </>
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {!debugInfo.isDeployed && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Contract not found!</strong> Please check:
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Contract address in .env.local is correct</li>
                    <li>Contract is deployed on the current network</li>
                    <li>MetaMask is connected to the right network</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {debugInfo.isDeployed && debugInfo.isOwner === false && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Limited Access:</strong> You are not the contract
                  owner. Only the owner can:
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Add beneficiaries for flood relief</li>
                    <li>Trigger manual disbursements</li>
                  </ul>
                  <div className="mt-2 text-sm">
                    <strong>You can still:</strong> Update flood metrics, make
                    sponsor/investor deposits, and trigger withdrawals.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {debugInfo.isDeployed && debugInfo.beneficiaryCount === 0 && (
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>No Beneficiaries Configured:</strong> The contract has
                  no beneficiaries added yet.
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Funds cannot be disbursed during high threat events</li>
                    <li>Only the contract owner can add beneficiaries</li>
                    <li>
                      At least one beneficiary is required for automatic
                      disbursements
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500 mt-4">
              <strong>Environment Check:</strong>
              <div className="mt-1">
                CONTRACT_ADDRESS:{" "}
                {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "❌ Not set"}
              </div>
              <div>
                CHAIN_ID: {process.env.NEXT_PUBLIC_CHAIN_ID || "❌ Not set"}
              </div>
              <div>
                RPC_URL: {process.env.NEXT_PUBLIC_RPC_URL || "❌ Not set"}
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
              <strong>Recent Updates:</strong>
              <ul className="mt-1 space-y-1">
                <li>
                  • Anyone can now update flood metrics (no owner restriction)
                </li>
                <li>
                  • Direct deposits to contract address are automatically
                  treated as sponsor deposits
                </li>
                <li>
                  • Beneficiaries must be added before funds can be disbursed
                  during high threat
                </li>
                <li>• Added manual disbursement function for contract owner</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
