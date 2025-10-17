import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SelfQRcodeWrapper, SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';

const QRVerification = () => {
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'scanning' | 'verified' | 'expired'>('pending');
    const [selfApp, setSelfApp] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    // Generate SelfXYZ app configuration
    useEffect(() => {
        const generateSelfApp = () => {
            const userId = uuidv4();
            const merchantId = `merchant_${Math.random().toString(36).substring(2, 8)}`;
            
            const app = new SelfAppBuilder({
                appName: "Merchant Verification Portal",
                scope: "merchant-verification",
                endpoint: "https://api.merchant-verification.com/verify",
                userId,
                disclosures: {
                    minimumAge: 18,
                    excludedCountries: ['IRN', 'PRK'],
                    ofac: true,
                    name: true,
                    nationality: true,
                    passport: true
                },
                metadata: {
                    merchantId,
                    verificationType: 'passport',
                    timestamp: Date.now()
                }
            }).build();
            
            setSelfApp(app);
        };

        generateSelfApp();
    }, []);

    // Timer countdown
    useEffect(() => {
        if (verificationStatus === 'scanning' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setVerificationStatus('expired');
        }
    }, [verificationStatus, timeLeft]);

    const startVerification = () => {
        setVerificationStatus('scanning');
        setTimeLeft(300);
        
        // Simulate verification process
        setTimeout(() => {
            setVerificationStatus('verified');
        }, 8000); // Simulate 8 seconds for verification
    };

    const regenerateQR = () => {
        setVerificationStatus('pending');
        setTimeLeft(300);
        
        // Generate new SelfXYZ app configuration
        const userId = uuidv4();
        const merchantId = `merchant_${Math.random().toString(36).substring(2, 8)}`;
        
        const app = new SelfAppBuilder({
            appName: "Merchant Verification Portal",
            scope: "merchant-verification",
            endpoint: "https://api.merchant-verification.com/verify",
            userId,
            disclosures: {
                minimumAge: 18,
                excludedCountries: ['IRN', 'PRK'],
                ofac: true,
                name: true,
                nationality: true,
                passport: true
            },
            metadata: {
                merchantId,
                verificationType: 'passport',
                timestamp: Date.now()
            }
        }).build();
        
        setSelfApp(app);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusBadge = () => {
        switch (verificationStatus) {
            case 'pending':
                return <Badge variant="secondary">Ready to Scan</Badge>;
            case 'scanning':
                return <Badge className="bg-business-warning text-white">Awaiting Verification</Badge>;
            case 'verified':
                return <Badge className="bg-business-success text-white">Verified ✓</Badge>;
            case 'expired':
                return <Badge variant="destructive">Expired</Badge>;
        }
    };

    return (
        <Card className="shadow-medium">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-primary" />
                            Passport Verification
                        </CardTitle>
                        <CardDescription>
                            Verify your identity using the SelfXYZ protocol
                        </CardDescription>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {verificationStatus === 'verified' ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-business-success mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-business-success mb-2">
                            Identity Verified!
                        </h3>
                        <p className="text-muted-foreground">
                            Your passport has been successfully verified through SelfXYZ
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* QR Code Display */}
                            <div className="flex-1">
                                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-border mx-auto max-w-sm">
                                    {verificationStatus === 'pending' || verificationStatus === 'expired' ? (
                                        <div className="text-center">
                                            <QrCode className="w-32 h-32 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-sm text-muted-foreground">
                                                QR Code will appear here
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            {/* SelfXYZ QR Code Component */}
                                            {selfApp && (
                                                <div className="flex flex-col items-center">
                                                    <SelfQRcodeWrapper
                                                        selfApp={selfApp}
                                                        onSuccess={() => {
                                                            console.log('SelfXYZ verification successful!');
                                                            setVerificationStatus('verified');
                                                        }}
                                                        onError={(error: any) => {
                                                            console.error('SelfXYZ verification error:', error);
                                                        }}
                                                        style={{
                                                            width: '200px',
                                                            height: '200px',
                                                            margin: '0 auto'
                                                        }}
                                                    />
                                                    {verificationStatus === 'scanning' && (
                                                        <div className="flex items-center justify-center gap-2 text-business-warning mt-4">
                                                            <Clock className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                Expires in {formatTime(timeLeft)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-merchant-secondary rounded-lg">
                                    <Smartphone className="w-8 h-8 text-primary" />
                                    <div>
                                        <h4 className="font-medium">Scan with SelfXYZ App</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Open the SelfXYZ app on your phone and scan this QR code for passport verification
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium">SelfXYZ Verification Process:</h4>
                                    <ol className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">1</span>
                                            Click "Start Verification" to generate SelfXYZ QR code
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">2</span>
                                            Scan QR code with your SelfXYZ mobile app
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">3</span>
                                            Complete passport verification using SelfXYZ protocol
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">4</span>
                                            Verification status will update automatically via SelfXYZ
                                        </li>
                                    </ol>
                                    
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <h5 className="font-medium text-blue-900 mb-2">SelfXYZ Protocol Features:</h5>
                                        <ul className="text-xs text-blue-800 space-y-1">
                                            <li>• Zero-knowledge proof verification</li>
                                            <li>• Privacy-preserving identity verification</li>
                                            <li>• OFAC compliance checking</li>
                                            <li>• Age verification (18+ required)</li>
                                            <li>• Country exclusion filtering</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            {verificationStatus === 'pending' && (
                                <Button 
                                    onClick={startVerification}
                                    className="gradient-primary text-white shadow-medium"
                                >
                                    <QrCode className="w-4 h-4 mr-2" />
                                    Start Verification
                                </Button>
                            )}
                            {verificationStatus === 'scanning' && (
                                <Button 
                                    variant="outline"
                                    disabled
                                    className="animate-pulse-soft"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Waiting for verification...
                                </Button>
                            )}
                            {verificationStatus === 'expired' && (
                                <Button 
                                    onClick={regenerateQR}
                                    variant="outline"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Generate New QR Code
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default QRVerification;
