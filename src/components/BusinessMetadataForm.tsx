import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface BusinessMetadata {
    businessName: string;
    businessType: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    employeeCount: string;
    yearEstablished: string;
}

const BusinessMetadataForm = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState<BusinessMetadata>({
        businessName: '',
        businessType: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        employeeCount: '',
        yearEstablished: ''
    });

    const handleInputChange = (field: keyof BusinessMetadata, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.businessName || !formData.businessType || !formData.email) {
            toast({
                title: "Missing Required Fields",
                description: "Please fill in all required fields marked with *",
            });
            return;
        }

        // Simulate saving data
        toast({
            title: "Business Metadata Saved",
            description: "Your business information has been successfully saved.",
        });
    };

    return (
        <Card className="shadow-medium">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Business Metadata
                </CardTitle>
                <CardDescription>
                    Enter your business information for merchant verification
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Business Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name *</Label>
                                <Input
                                    id="businessName"
                                    value={formData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    placeholder="Enter your business name"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="businessType">Business Type *</Label>
                                <Select 
                                    value={formData.businessType} 
                                    onValueChange={(value) => handleInputChange('businessType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select business type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                                        <SelectItem value="service">Service Provider</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Business Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe your business and what you do"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Business Address
                        </h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="Enter street address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    placeholder="City"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="state">State/Province</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    placeholder="State/Province"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                    placeholder="ZIP/Postal Code"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select 
                                value={formData.country} 
                                onValueChange={(value) => handleInputChange('country', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="us">United States</SelectItem>
                                    <SelectItem value="ca">Canada</SelectItem>
                                    <SelectItem value="uk">United Kingdom</SelectItem>
                                    <SelectItem value="au">Australia</SelectItem>
                                    <SelectItem value="de">Germany</SelectItem>
                                    <SelectItem value="fr">France</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Contact Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="business@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website" className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Website
                            </Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                                placeholder="https://www.yourbusiness.com"
                            />
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Additional Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employeeCount" className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Number of Employees
                                </Label>
                                <Select 
                                    value={formData.employeeCount} 
                                    onValueChange={(value) => handleInputChange('employeeCount', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employee count" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Just me</SelectItem>
                                        <SelectItem value="2-10">2-10 employees</SelectItem>
                                        <SelectItem value="11-50">11-50 employees</SelectItem>
                                        <SelectItem value="51-200">51-200 employees</SelectItem>
                                        <SelectItem value="200+">200+ employees</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="yearEstablished">Year Established</Label>
                                <Input
                                    id="yearEstablished"
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    value={formData.yearEstablished}
                                    onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                                    placeholder="2020"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button 
                            type="submit" 
                            className="gradient-primary text-white shadow-medium"
                        >
                            Save Business Information
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default BusinessMetadataForm;
