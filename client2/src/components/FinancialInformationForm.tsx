import React, { useState } from 'react';
import { DollarSign, TrendingUp, PieChart, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FinancialInformation {
    annualRevenue: string;
    revenueRange: string;
    primaryPaymentMethods: string[];
    averageTransactionAmount: string;
    monthlyTransactionVolume: string;
    bankName: string;
    accountType: string;
    hasBusinessLicense: boolean;
    taxId: string;
    businessRegistrationNumber: string;
}

const FinancialInformationForm = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState<FinancialInformation>({
        annualRevenue: '',
        revenueRange: '',
        primaryPaymentMethods: [],
        averageTransactionAmount: '',
        monthlyTransactionVolume: '',
        bankName: '',
        accountType: '',
        hasBusinessLicense: false,
        taxId: '',
        businessRegistrationNumber: ''
    });
    
    const [isOptional, setIsOptional] = useState(true);

    const handleInputChange = (field: keyof FinancialInformation, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePaymentMethodChange = (method: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            primaryPaymentMethods: checked 
                ? [...prev.primaryPaymentMethods, method]
                : prev.primaryPaymentMethods.filter(m => m !== method)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        toast({
            title: "Financial Information Saved",
            description: "Your financial information has been securely saved.",
        });
    };

    const paymentMethods = [
        'Credit Cards',
        'Debit Cards',
        'Bank Transfers',
        'Digital Wallets',
        'Cryptocurrency',
        'Cash',
        'Checks'
    ];

    return (
        <Card className="shadow-medium">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Financial Information
                        </CardTitle>
                        <CardDescription>
                            Provide financial details to enhance your merchant profile
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Optional
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 p-4 bg-merchant-secondary rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-business-warning flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-business-warning mb-1">Privacy Notice</h4>
                            <p className="text-sm text-muted-foreground">
                                Financial information is encrypted and used only for merchant verification and risk assessment. 
                                This information is optional and can be skipped.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Revenue Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Revenue Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="revenueRange">Annual Revenue Range</Label>
                                <Select 
                                    value={formData.revenueRange} 
                                    onValueChange={(value) => handleInputChange('revenueRange', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select revenue range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="under-50k">Under $50,000</SelectItem>
                                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                                        <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                                        <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                                        <SelectItem value="1m-5m">$1,000,000 - $5,000,000</SelectItem>
                                        <SelectItem value="over-5m">Over $5,000,000</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="annualRevenue">Specific Annual Revenue (Optional)</Label>
                                <Input
                                    id="annualRevenue"
                                    type="number"
                                    value={formData.annualRevenue}
                                    onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                                    placeholder="Enter specific amount"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transaction Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <PieChart className="w-4 h-4" />
                            Transaction Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="averageTransaction">Average Transaction Amount</Label>
                                <Input
                                    id="averageTransaction"
                                    type="number"
                                    value={formData.averageTransactionAmount}
                                    onChange={(e) => handleInputChange('averageTransactionAmount', e.target.value)}
                                    placeholder="$0.00"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="monthlyVolume">Monthly Transaction Volume</Label>
                                <Select 
                                    value={formData.monthlyTransactionVolume} 
                                    onValueChange={(value) => handleInputChange('monthlyTransactionVolume', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select monthly volume" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="under-100">Under 100 transactions</SelectItem>
                                        <SelectItem value="100-500">100-500 transactions</SelectItem>
                                        <SelectItem value="500-1000">500-1,000 transactions</SelectItem>
                                        <SelectItem value="1000-5000">1,000-5,000 transactions</SelectItem>
                                        <SelectItem value="over-5000">Over 5,000 transactions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Primary Payment Methods Accepted</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {paymentMethods.map((method) => (
                                    <div key={method} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={method}
                                            checked={formData.primaryPaymentMethods.includes(method)}
                                            onCheckedChange={(checked) => 
                                                handlePaymentMethodChange(method, checked as boolean)
                                            }
                                        />
                                        <Label htmlFor={method} className="text-sm">{method}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Banking Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Banking Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Primary Bank Name</Label>
                                <Input
                                    id="bankName"
                                    value={formData.bankName}
                                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                                    placeholder="Enter bank name"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="accountType">Account Type</Label>
                                <Select 
                                    value={formData.accountType} 
                                    onValueChange={(value) => handleInputChange('accountType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="business-checking">Business Checking</SelectItem>
                                        <SelectItem value="business-savings">Business Savings</SelectItem>
                                        <SelectItem value="merchant-account">Merchant Account</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Legal & Registration */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Legal & Registration</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="businessLicense"
                                    checked={formData.hasBusinessLicense}
                                    onCheckedChange={(checked) => 
                                        handleInputChange('hasBusinessLicense', checked as boolean)
                                    }
                                />
                                <Label htmlFor="businessLicense">
                                    I have a valid business license
                                </Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                                    <Input
                                        id="taxId"
                                        value={formData.taxId}
                                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                                        placeholder="XX-XXXXXXX"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="registrationNumber">Business Registration Number</Label>
                                    <Input
                                        id="registrationNumber"
                                        value={formData.businessRegistrationNumber}
                                        onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                                        placeholder="Enter registration number"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => toast({ 
                                title: "Skipped", 
                                description: "Financial information has been skipped." 
                            })}
                        >
                            Skip This Step
                        </Button>
                        <Button 
                            type="submit" 
                            className="gradient-primary text-white shadow-medium"
                        >
                            Save Financial Information
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default FinancialInformationForm;
