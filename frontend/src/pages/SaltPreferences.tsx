import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck, Wallet } from "lucide-react";

export default function SaltPreferences() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [vaultAddress, setVaultAddress] = useState("");

    const handleDeploy = () => {
        if (!vaultAddress) {
            toast({
                title: "Error",
                description: "Please enter a Salt Vault Address.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        // Simulate deployment delay
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Policy Deployed Successfully",
                description: "Your Salt Policy is now active on-chain.",
            });
        }, 1500);
    };

    return (
        <div className="flex-1 p-6 overflow-y-auto bg-background h-screen">
            <div className="max-w-2xl mx-auto space-y-8 pb-12">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Salt Preferences</h1>
                    <p className="text-muted-foreground">
                        Configure your AI Agent's on-chain constraints and permissions.
                    </p>
                </div>

                {/* Wallet Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Salt Vault Configuration
                        </CardTitle>
                        <CardDescription>Connect your programmable Salt account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="vault-address">Salt Vault Address</Label>
                            <Input
                                id="vault-address"
                                placeholder="0x..."
                                value={vaultAddress}
                                onChange={(e) => setVaultAddress(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                All agent trades will be executed through this smart contract wallet.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Policy Constraints */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Policy Constraints
                        </CardTitle>
                        <CardDescription>Set strict boundaries for the AI Agent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Allowed Networks */}
                        <div className="space-y-2">
                            <Label>Allowed Networks</Label>
                            <Select defaultValue="hyperevm">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hyperevm">HyperEVM Mainnet</SelectItem>
                                    <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                                    <SelectItem value="arbitrum">Arbitrum One</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Max Trade Size */}
                        <div className="space-y-2">
                            <Label htmlFor="max-trade">Max Trade Size (USD)</Label>
                            <Input id="max-trade" type="number" placeholder="5000" />
                        </div>

                        {/* Allowed Assets */}
                        <div className="space-y-3">
                            <Label>Allowed Assets</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="asset-hype" defaultChecked />
                                    <Label htmlFor="asset-hype">HYPE (Native)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="asset-wbtc" defaultChecked />
                                    <Label htmlFor="asset-wbtc">wBTC</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="asset-weth" defaultChecked />
                                    <Label htmlFor="asset-weth">wETH</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="asset-usdc" defaultChecked />
                                    <Label htmlFor="asset-usdc">USDC</Label>
                                </div>
                            </div>
                        </div>

                        {/* Risk Parameters */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="slippage">Max Slippage (%)</Label>
                                <Input id="slippage" type="number" placeholder="0.5" defaultValue="0.5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="funding">Min Hourly Funding (%)</Label>
                                <Input id="funding" type="number" placeholder="-0.01" defaultValue="-0.01" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setVaultAddress("")} disabled={loading}>
                        Reset
                    </Button>
                    <Button onClick={handleDeploy} disabled={loading} className="w-40">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deploying...
                            </>
                        ) : (
                            "Deploy Policy"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
