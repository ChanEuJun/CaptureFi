import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

interface LiFiBridgeProps {
    targetAmount?: number;
    recipientAddress?: string;
    sourceChain?: number;
}

const widgetConfig: WidgetConfig = {
    integrator: 'CaptureFi-Hackathon',
    containerStyle: {
        border: '1px solid rgb(var(--border))',
        borderRadius: '16px',
    },
    theme: {
        palette: {
            primary: { main: '#3b82f6' },
            secondary: { main: '#64748b' },
        },
        shape: {
            borderRadius: 16,
            borderRadiusSecondary: 12,
        },
    },
    // Pre-configured for HyperEVM (Assuming Chain ID 999 for demo, realistically need to check supported chains)
    // If 999 not supported, let's default to Base -> Optimism as a proxy for the demo.
    toChain: 10, // Optimism (Proxy for HyperEVM)
    toToken: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // USDC on OP
};

const LiFiBridge = ({ targetAmount, recipientAddress }: LiFiBridgeProps) => {
    // Mock Status Steps
    const steps = [
        { title: "Funds at Source", status: "completed" },
        { title: "Bridging", status: "active" },
        { title: "Arrived on HyperEVM", status: "pending" },
    ];

    return (
        <div className="space-y-6">
            {/* Custom Status Tracker */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Bridge Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2">
                                {step.status === "completed" ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : step.status === "active" ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground" />
                                )}
                                <span className={`text-sm ${step.status === "active" ? "font-bold text-foreground" :
                                        step.status === "completed" ? "text-foreground" : "text-muted-foreground"
                                    }`}>
                                    {step.title}
                                </span>
                                {i < steps.length - 1 && (
                                    <ArrowRight className="w-4 h-4 text-border mx-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Widget Container */}
            <div className="h-[600px] w-full max-w-[400px] mx-auto">
                <LiFiWidget
                    config={{
                        ...widgetConfig,
                        toAddress: recipientAddress,
                        fromAmount: targetAmount ? targetAmount.toString() : undefined
                    }}
                    integrator="capture-fi"
                />
            </div>
        </div>
    );
};

export default LiFiBridge;
