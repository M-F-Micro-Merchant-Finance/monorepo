import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const QRVerification = () => {
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'scanning' | 'verified' | 'expired'>('pending');
    const [qrCode, setQrCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    // Generate a mock QR code data for SelfXYZ protocol
    useEffect(() => {
        const generateQRData = () => {
            const sessionId = Math.random().toString(36).substring(2, 15);
            const timestamp = Date.now();
            const qrData = `selfxyz://verify?sessionId=${sessionId}&type=passport&timestamp=${timestamp}&merchantId=merchant_${Math.random().toString(36).substring(2, 8)}`;
            setQrCode(qrData);
        };

        generateQRData();
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
        const sessionId = Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now();
        const qrData = `selfxyz://verify?sessionId=${sessionId}&type=passport&timestamp=${timestamp}&merchantId=merchant_${Math.random().toString(36).substring(2, 8)}`;
        setQrCode(qrData);
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
                                            {/* Mock QR Code - In real implementation, use a QR code library */}
                                            <div className="w-48 h-48 bg-black mx-auto mb-4 relative">
                                                <div className="absolute inset-4 bg-white">
                                                    <div className="grid grid-cols-8 gap-1 p-2 h-full">
                                                        {Array.from({length: 64}).map((_, i) => (
                                                            <div 
                                                                key={i} 
                                                                className={`w-full h-full ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {verificationStatus === 'scanning' && (
                                                <div className="flex items-center justify-center gap-2 text-business-warning">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        Expires in {formatTime(timeLeft)}
                                                    </span>
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
                                            Open the SelfXYZ app on your phone and scan this QR code
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium">How it works:</h4>
                                    <ol className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">1</span>
                                            Click "Start Verification" to generate QR code
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">2</span>
                                            Scan QR code with your SelfXYZ mobile app
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">3</span>
                                            Complete passport verification on your phone
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">4</span>
                                            Verification status will update automatically
                                        </li>
                                    </ol>
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
