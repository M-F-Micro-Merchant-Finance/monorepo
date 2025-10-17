import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shield, CheckCircle, Building2, DollarSign } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WalletButton from '@/components/WalletButton';
import QRVerification from '@/components/QRVerification';
import BusinessMetadataForm from '@/components/BusinessMetadataForm';
import FinancialInformationForm from '@/components/FinancialInformationForm';
import LogoDisplay from '@/components/LogoDisplay';

const MerchantDashboard = () => {
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);

    const steps = [
        {
            id: 'verification',
            title: 'Identity Verification',
            description: 'Verify your passport using SelfXYZ',
            icon: Shield,
            component: <QRVerification />
        },
        {
            id: 'business',
            title: 'Business Information',
            description: 'Enter your business metadata',
            icon: Building2,
            component: <BusinessMetadataForm />
        },
        {
            id: 'financial',
            title: 'Financial Details',
            description: 'Provide financial information (optional)',
            icon: DollarSign,
            component: <FinancialInformationForm />
        }
    ];

    const [activeStep, setActiveStep] = useState('verification');

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-merchant-surface to-background relative">
            {/* Logo Display - Fixed on Right */}
            <LogoDisplay />
            
            {/* Header */}
            <header className="glass-effect border-b shadow-3d relative z-20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-3d">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-3d text-foreground">Merchant Dashboard</h1>
                                <p className="text-sm text-muted-foreground">Complete your merchant verification</p>
                            </div>
                        </div>
                        <WalletButton />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pr-56"> {/* Added right padding for logo space */}
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-3d sticky top-8 glass-effect">
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4 text-3d text-foreground">Verification Steps</h2>
                                <div className="space-y-3">
                                    {steps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isActive = activeStep === step.id;
                                        const isCompleted = completedSteps.includes(step.id);
                                        
                                        return (
                                            <button
                                                key={step.id}
                                                onClick={() => setActiveStep(step.id)}
                                                className={`w-full text-left p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                                    isActive 
                                                        ? 'gradient-primary text-primary-foreground shadow-3d-hover animate-pulse-soft' 
                                                        : 'hover:shadow-3d glass-effect'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inset transition-all ${
                                                        isCompleted 
                                                            ? 'bg-business-success text-white' 
                                                            : isActive 
                                                                ? 'bg-white/20' 
                                                                : 'bg-merchant-secondary'
                                                    }`}>
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-4 h-4" />
                                                        ) : (
                                                            <Icon className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-sm truncate">
                                                                {step.title}
                                                            </h3>
                                                            {step.id === 'financial' && (
                                                                <Badge variant="secondary" className="text-xs glass-effect">
                                                                    Optional
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className={`text-xs truncate ${
                                                            isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                                        }`}>
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Progress Summary */}
                                <div className="mt-6 pt-4 border-t border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-foreground">Progress</span>
                                        <span className="text-sm text-muted-foreground">
                                            {completedSteps.length}/{steps.length}
                                        </span>
                                    </div>
                                    <div className="w-full bg-merchant-secondary rounded-full h-2 shadow-inset">
                                        <div 
                                            className="gradient-primary h-2 rounded-full transition-all duration-500 shadow-glow"
                                            style={{ 
                                                width: `${(completedSteps.length / steps.length) * 100}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="animate-fade-in">
                            {steps.find(step => step.id === activeStep)?.component}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<MerchantDashboard />} />
            </Routes>
            <Toaster />
        </>
    );
};

export default App;
