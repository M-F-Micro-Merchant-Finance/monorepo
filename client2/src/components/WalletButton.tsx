import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Copy, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletService, type WalletState } from '@/lib/walletService';
import { useToast } from '@/hooks/use-toast';
import CopyToClipboard from 'react-copy-to-clipboard';

const WalletButton = () => {
    const { toast } = useToast();
    const walletServiceRef = useRef<WalletService | null>(null);
    const [walletState, setWalletState] = useState<WalletState>({
        account: '',
        currentNetwork: '',
        isConnecting: false,
        balance: '',
        isLoadingBalance: false
    });
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const walletService = new WalletService({
            onToast: (title: string, description: string) => {
                toast({ title, description });
            }
        });

        walletService.onStateUpdate(setWalletState);
        walletServiceRef.current = walletService;

        return () => {
            walletService.destroy();
        };
    }, [toast]);

    const connectWallet = () => {
        walletServiceRef.current?.connectWallet();
    };

    const disconnectWallet = () => {
        walletServiceRef.current?.disconnectWallet();
        setShowDropdown(false);
    };

    const formatAddress = (address: string) => {
        return walletServiceRef.current?.formatAddress(address) || '';
    };

    const { account, isConnecting, balance, isLoadingBalance } = walletState;

    if (!account) {
        return (
            <Button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
            >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
        );
    }

    return (
        <div className="relative">
            <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 shadow-soft"
            >
                <div className="w-2 h-2 bg-business-success rounded-full animate-pulse-soft" />
                <span className="font-mono text-sm">{formatAddress(account)}</span>
                <ChevronDown className="w-4 h-4" />
            </Button>

            {showDropdown && (
                <Card className="absolute right-0 top-full mt-2 w-80 p-4 shadow-large z-50">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-business-success text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Wallet Connected
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 p-2 bg-muted rounded text-xs font-mono">
                                    {account}
                                </code>
                                <CopyToClipboard
                                    text={account}
                                    onCopy={() => toast({ title: "Copied!", description: "Address copied to clipboard" })}
                                >
                                    <Button variant="outline" size="sm">
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </CopyToClipboard>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Balance</label>
                            <div className="mt-1">
                                {isLoadingBalance ? (
                                    <div className="text-sm text-muted-foreground">Loading...</div>
                                ) : (
                                    <div className="font-mono text-sm">{balance} CELO</div>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="destructive"
                            onClick={disconnectWallet}
                            className="w-full"
                        >
                            Disconnect Wallet
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default WalletButton;
