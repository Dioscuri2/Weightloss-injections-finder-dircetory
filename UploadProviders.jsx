import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Provider } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  ArrowLeft,
  DollarSign,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UploadProviders() {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  // Provider upload states
  const [selectedProviderFile, setSelectedProviderFile] = useState(null);
  const [isUploadingProviders, setIsUploadingProviders] = useState(false);
  const [providerUploadProgress, setProviderUploadProgress] = useState(0);
  const [providerUploadResult, setProviderUploadResult] = useState(null);
  const [providerPreviewData, setProviderPreviewData] = useState(null);
  const [isProcessingProviders, setIsProcessingProviders] = useState(false);

  // Pricing upload states
  const [selectedPricingFile, setSelectedPricingFile] = useState(null);
  const [isUploadingPricing, setIsUploadingPricing] = useState(false);
  const [pricingUploadProgress, setPricingUploadProgress] = useState(0);
  const [pricingUploadResult, setPricingUploadResult] = useState(null);
  const [pricingPreviewData, setPricingPreviewData] = useState(null);
  const [isProcessingPricing, setIsProcessingPricing] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl("Home");
        }
      } catch (error) {
        window.location.href = createPageUrl("Home");
      } finally {
        setIsLoadingUser(false);
      }
    };
    checkUser();
  }, []);

  // Expected CSV columns mapping to Provider entity fields
  const expectedProviderColumns = {
    'name': 'Provider Name (Required)',
    'type': 'Provider Type (Pharmacy Chain, Private Clinic, Online Doctor Service)',
    'website': 'Website URL',
    'phone': 'Phone Number',
    'email': 'Email Address',
    'address': 'Physical Address',
    'coverage': 'Coverage Area',
    'trust_score': 'Trust Score (0-10)',
    'gphc_registered': 'GPHC Registered (true/false)',
    'cqc_regulated': 'CQC Regulated (true/false)',
    'mhra_compliant': 'MHRA Compliant (true/false)',
    'gmc_doctors': 'GMC Doctors (true/false)',
    'consultation_fee': 'Consultation Fee (GBP)',
    'consultation_method': 'Consultation Method',
    'bmi_requirement': 'BMI Requirements',
    'wait_time': 'Wait Time',
    'special_offers': 'Special Offers',
    'delivery_options': 'Delivery Options',
    'rating': 'Rating (0-5)',
    'review_count': 'Review Count',
    'image_url': 'Image URL',
    'description': 'Provider Description'
  };

  // Expected pricing CSV columns
  const expectedPricingColumns = {
    'provider_name': 'Provider Name (must match exactly with existing provider)',
    'medication_name': 'Medication Name (Wegovy, Mounjaro, Saxenda, Ozempic)',
    'dosage': 'Dosage (e.g., 0.25mg, 5mg, 3mg)',
    'price': 'Price in GBP (e.g., 180.50)'
  };

  const handleProviderFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedProviderFile(file);
      setProviderUploadResult(null);
      setProviderPreviewData(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handlePricingFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedPricingFile(file);
      setPricingUploadResult(null);
      setPricingPreviewData(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleProviderUpload = async () => {
    if (!selectedProviderFile) return;

    setIsUploadingProviders(true);
    setProviderUploadProgress(0);

    try {
      setProviderUploadProgress(25);
      const { file_url } = await UploadFile({ file: selectedProviderFile });
      
      setProviderUploadProgress(50);
      
      const providerSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          type: { type: "string" },
          website: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
          coverage: { type: "string" },
          trust_score: { type: "number" },
          gphc_registered: { type: "boolean" },
          cqc_regulated: { type: "boolean" },
          mhra_compliant: { type: "boolean" },
          gmc_doctors: { type: "boolean" },
          medications: { type: "object" },
          consultation_fee: { type: "number" },
          consultation_method: { type: "string" },
          bmi_requirement: { type: "string" },
          wait_time: { type: "string" },
          special_offers: { type: "string" },
          delivery_options: { type: "string" },
          locations: { type: "array", items: { type: "string" } },
          rating: { type: "number" },
          review_count: { type: "number" },
          image_url: { type: "string" },
          description: { type: "string" }
        }
      };

      setProviderUploadProgress(75);
      
      const extractResult = await ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: providerSchema
      });

      if (extractResult.status === 'success' && extractResult.output) {
        setProviderPreviewData(extractResult.output);
        setProviderUploadProgress(100);
        setProviderUploadResult({
          success: true,
          message: `Successfully extracted ${extractResult.output.length} provider records. Review the data below before importing.`,
          count: extractResult.output.length
        });
      } else {
        setProviderUploadResult({
          success: false,
          message: extractResult.details || 'Failed to extract data from CSV'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setProviderUploadResult({
        success: false,
        message: 'Failed to upload file: ' + error.message
      });
    } finally {
      setIsUploadingProviders(false);
    }
  };

  const handlePricingUpload = async () => {
    if (!selectedPricingFile) return;

    setIsUploadingPricing(true);
    setPricingUploadProgress(0);

    try {
      setPricingUploadProgress(25);
      const { file_url } = await UploadFile({ file: selectedPricingFile });
      
      setPricingUploadProgress(50);
      
      const pricingSchema = {
        type: "object",
        properties: {
          provider_name: { type: "string" },
          medication_name: { type: "string" },
          dosage: { type: "string" },
          price: { type: "number" }
        }
      };

      setPricingUploadProgress(75);
      
      const extractResult = await ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: pricingSchema
      });

      if (extractResult.status === 'success' && extractResult.output) {
        setPricingPreviewData(extractResult.output);
        setPricingUploadProgress(100);
        setPricingUploadResult({
          success: true,
          message: `Successfully extracted ${extractResult.output.length} pricing records. Review the data below before importing.`,
          count: extractResult.output.length
        });
      } else {
        setPricingUploadResult({
          success: false,
          message: extractResult.details || 'Failed to extract pricing data from CSV'
        });
      }
    } catch (error) {
      console.error('Pricing upload error:', error);
      setPricingUploadResult({
        success: false,
        message: 'Failed to upload pricing file: ' + error.message
      });
    } finally {
      setIsUploadingPricing(false);
    }
  };

  const handleImportProviders = async () => {
    if (!providerPreviewData || providerPreviewData.length === 0) return;

    setIsProcessingProviders(true);

    try {
      // Get existing providers to check for duplicates
      const existingProviders = await Provider.list();
      const existingProviderNames = existingProviders.map(p => p.name.toLowerCase());
      
      let newProviders = 0;
      let updatedProviders = 0;
      let skippedProviders = 0;

      for (const providerData of providerPreviewData) {
        if (!providerData.name) {
          skippedProviders++;
          continue;
        }

        const cleanedData = {
          ...providerData,
          slug: providerData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          trust_score: providerData.trust_score ? Math.min(10, Math.max(0, providerData.trust_score)) : 5,
          rating: providerData.rating ? Math.min(5, Math.max(0, providerData.rating)) : null,
          consultation_fee: providerData.consultation_fee ? Math.max(0, providerData.consultation_fee) : null,
          review_count: providerData.review_count ? Math.max(0, providerData.review_count) : 0,
          locations: providerData.coverage ? [providerData.coverage] : [],
          medications: {} // Initialize empty medications object
        };

        // Check if provider already exists
        const existingProvider = existingProviders.find(p => 
          p.name.toLowerCase() === providerData.name.toLowerCase()
        );

        if (existingProvider) {
          // Update existing provider (preserve existing medications)
          const updateData = {
            ...cleanedData,
            medications: existingProvider.medications || {} // Preserve existing pricing
          };
          await Provider.update(existingProvider.id, updateData);
          updatedProviders++;
        } else {
          // Create new provider
          await Provider.create(cleanedData);
          newProviders++;
        }
      }

      setProviderUploadResult({
        success: true,
        message: `Import completed! Created ${newProviders} new providers, updated ${updatedProviders} existing providers${skippedProviders > 0 ? `, skipped ${skippedProviders} invalid records` : ''}.`,
        imported: true,
        details: {
          new: newProviders,
          updated: updatedProviders,
          skipped: skippedProviders
        }
      });
    } catch (error) {
      console.error('Import error:', error);
      setProviderUploadResult({
        success: false,
        message: 'Failed to import data: ' + error.message
      });
    } finally {
      setIsProcessingProviders(false);
    }
  };

  const handleImportPricing = async () => {
    if (!pricingPreviewData || pricingPreviewData.length === 0) return;

    setIsProcessingPricing(true);

    try {
      // Get all current providers
      const allProviders = await Provider.list();
      const providerUpdates = {};
      const unmatchedProviders = new Set();
      let successfulRows = 0;

      // Group pricing data by provider
      pricingPreviewData.forEach(row => {
        const { provider_name, medication_name, dosage, price } = row;
        
        if (!provider_name || !medication_name || !dosage || price === null || price === undefined) {
          return; // Skip invalid rows
        }

        // Find matching provider (case-insensitive)
        const matchingProvider = allProviders.find(p => 
          p.name.toLowerCase() === provider_name.toLowerCase()
        );

        if (matchingProvider) {
          if (!providerUpdates[matchingProvider.id]) {
            providerUpdates[matchingProvider.id] = {
              ...matchingProvider,
              medications: { ...matchingProvider.medications }
            };
          }

          // Initialize medication object if it doesn't exist
          if (!providerUpdates[matchingProvider.id].medications[medication_name]) {
            providerUpdates[matchingProvider.id].medications[medication_name] = {};
          }

          // Set the price for this dosage
          providerUpdates[matchingProvider.id].medications[medication_name][dosage] = price;
          successfulRows++;
        } else {
          unmatchedProviders.add(provider_name);
        }
      });

      // Update all providers with new pricing data
      const updatePromises = Object.entries(providerUpdates).map(([providerId, providerData]) =>
        Provider.update(providerId, { medications: providerData.medications })
      );

      await Promise.all(updatePromises);

      let resultMessage = `Successfully updated pricing for ${Object.keys(providerUpdates).length} providers (${successfulRows} price entries)!`;
      
      if (unmatchedProviders.size > 0) {
        resultMessage += ` Warning: Could not find providers: ${Array.from(unmatchedProviders).join(', ')}. Please check provider names match exactly.`;
      }

      setPricingUploadResult({
        success: true,
        message: resultMessage,
        imported: true,
        details: {
          providersUpdated: Object.keys(providerUpdates).length,
          priceEntriesProcessed: successfulRows,
          unmatchedProviders: Array.from(unmatchedProviders)
        }
      });
    } catch (error) {
      console.error('Pricing import error:', error);
      setPricingUploadResult({
        success: false,
        message: 'Failed to import pricing data: ' + error.message
      });
    } finally {
      setIsProcessingPricing(false);
    }
  };

  const downloadProviderSampleCSV = () => {
    const sampleData = [
      'name,type,website,phone,email,address,coverage,trust_score,gphc_registered,cqc_regulated,mhra_compliant,gmc_doctors,consultation_fee,consultation_method,bmi_requirement,wait_time,special_offers,delivery_options,rating,review_count,image_url,description',
      'Sample Pharmacy,"Pharmacy Chain",https://example.com,01234567890,info@example.com,"123 High Street, London",UK Wide,8.5,true,true,true,true,49,Online & In-person,BMI 30+,Same day,"First consultation free","Free UK delivery",4.8,150,https://example.com/image.jpg,"Comprehensive weight loss support with qualified healthcare professionals"'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'provider_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPricingSampleCSV = () => {
    const sampleData = [
      'provider_name,medication_name,dosage,price',
      'Sample Pharmacy,Wegovy,0.25mg,180.50',
      'Sample Pharmacy,Wegovy,0.5mg,200.00',
      'Sample Pharmacy,Wegovy,1mg,220.00',
      'Sample Pharmacy,Mounjaro,2.5mg,210.00',
      'Sample Pharmacy,Mounjaro,5mg,230.00',
      'Sample Pharmacy,Saxenda,3mg,160.00',
      'Sample Pharmacy,Ozempic,0.5mg,179.00',
      'Another Provider,Wegovy,2.4mg,260.00',
      'Another Provider,Mounjaro,15mg,280.00'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <p>Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl("Providers")} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Providers
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            Upload Provider Data
          </h1>
          <p className="text-lg text-neutral-600">
            Import providers and medication pricing from CSV files. The system will automatically prevent duplicates and update existing providers.
          </p>
        </div>

        <Tabs defaultValue="providers" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-elegant">
            <TabsTrigger value="providers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-8">
            {/* Enhanced Provider Instructions Card */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Provider CSV Format Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-blue-800">
                    <strong>Smart Import:</strong> The system will automatically check for existing providers by name. If a provider already exists, it will be updated with new information. If it's new, it will be created. This prevents duplicates!
                  </AlertDescription>
                </Alert>

                <p className="text-neutral-600">
                  Your CSV file should contain the following columns (column names must match exactly):
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(expectedProviderColumns).map(([field, description]) => (
                    <div key={field} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {field}
                      </Badge>
                      <span className="text-neutral-600">{description}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                  <Button onClick={downloadProviderSampleCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample CSV
                  </Button>
                  <span className="text-sm text-neutral-500">
                    Use this template to format your provider data correctly
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Provider Upload Card */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Provider CSV File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleProviderFileSelect}
                    className="hidden"
                    id="provider-csv-upload"
                  />
                  <label htmlFor="provider-csv-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      Select Provider CSV File
                    </h3>
                    <p className="text-neutral-600">
                      Click here to browse and select your provider data CSV file
                    </p>
                  </label>
                </div>

                {selectedProviderFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{selectedProviderFile.name}</p>
                        <p className="text-sm text-green-600">
                          Size: {(selectedProviderFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isUploadingProviders && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing file...</span>
                      <span>{providerUploadProgress}%</span>
                    </div>
                    <Progress value={providerUploadProgress} className="w-full" />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleProviderUpload}
                    disabled={!selectedProviderFile || isUploadingProviders}
                    className="gradient-brand text-white"
                  >
                    {isUploadingProviders ? 'Processing...' : 'Upload & Preview'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Provider Results */}
            {providerUploadResult && (
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <Alert className={providerUploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {providerUploadResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <AlertDescription className={providerUploadResult.success ? 'text-green-800' : 'text-red-800'}>
                        {providerUploadResult.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Provider Preview Data */}
            {providerPreviewData && providerPreviewData.length > 0 && !providerUploadResult?.imported && (
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Provider Data Preview ({providerPreviewData.length} records)</span>
                    <Button
                      onClick={handleImportProviders}
                      disabled={isProcessingProviders}
                      className="gradient-brand text-white"
                    >
                      {isProcessingProviders ? 'Processing...' : `Import ${providerPreviewData.length} Providers`}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Website</th>
                          <th className="text-left p-3 font-medium">Trust Score</th>
                          <th className="text-left p-3 font-medium">Consultation Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providerPreviewData.slice(0, 5).map((provider, index) => (
                          <tr key={index} className="border-b border-neutral-100">
                            <td className="p-3 font-medium">{provider.name || 'N/A'}</td>
                            <td className="p-3">{provider.type || 'N/A'}</td>
                            <td className="p-3">
                              {provider.website ? (
                                <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                  {provider.website.length > 30 ? provider.website.substring(0, 30) + '...' : provider.website}
                                </a>
                              ) : 'N/A'}
                            </td>
                            <td className="p-3">{provider.trust_score || 'N/A'}</td>
                            <td className="p-3">£{provider.consultation_fee || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {providerPreviewData.length > 5 && (
                      <p className="text-center py-3 text-neutral-600">
                        ... and {providerPreviewData.length - 5} more records
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-8">
            {/* Enhanced Pricing Instructions Card */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing CSV Format Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-blue-800">
                    <strong>Provider Matching:</strong> The system will match pricing data to existing providers by name. Make sure provider names in your pricing CSV exactly match the names of providers already in your system.
                  </AlertDescription>
                </Alert>

                <p className="text-neutral-600">
                  Your pricing CSV file should contain the following columns (column names must match exactly):
                </p>
                
                <div className="grid md:grid-cols-1 gap-4 text-sm">
                  {Object.entries(expectedPricingColumns).map(([field, description]) => (
                    <div key={field} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {field}
                      </Badge>
                      <span className="text-neutral-600">{description}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Provider names must match exactly with existing providers in your database</li>
                    <li>• Medication names should be: Wegovy, Mounjaro, Saxenda, or Ozempic</li>
                    <li>• Dosages should include units (e.g., "0.25mg", "5mg", "3mg")</li>
                    <li>• Prices should be in GBP without currency symbols</li>
                    <li>• One row per provider-medication-dosage combination</li>
                  </ul>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                  <Button onClick={downloadPricingSampleCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample CSV
                  </Button>
                  <span className="text-sm text-neutral-500">
                    Use this template to format your pricing data correctly
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Upload Card */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Pricing CSV File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handlePricingFileSelect}
                    className="hidden"
                    id="pricing-csv-upload"
                  />
                  <label htmlFor="pricing-csv-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      Select Pricing CSV File
                    </h3>
                    <p className="text-neutral-600">
                      Click here to browse and select your medication pricing CSV file
                    </p>
                  </label>
                </div>

                {selectedPricingFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{selectedPricingFile.name}</p>
                        <p className="text-sm text-green-600">
                          Size: {(selectedPricingFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isUploadingPricing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing pricing file...</span>
                      <span>{pricingUploadProgress}%</span>
                    </div>
                    <Progress value={pricingUploadProgress} className="w-full" />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handlePricingUpload}
                    disabled={!selectedPricingFile || isUploadingPricing}
                    className="gradient-brand text-white"
                  >
                    {isUploadingPricing ? 'Processing...' : 'Upload & Preview'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Results */}
            {pricingUploadResult && (
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <Alert className={pricingUploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {pricingUploadResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <AlertDescription className={pricingUploadResult.success ? 'text-green-800' : 'text-red-800'}>
                        {pricingUploadResult.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Pricing Preview Data */}
            {pricingPreviewData && pricingPreviewData.length > 0 && !pricingUploadResult?.imported && (
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pricing Data Preview ({pricingPreviewData.length} records)</span>
                    <Button
                      onClick={handleImportPricing}
                      disabled={isProcessingPricing}
                      className="gradient-brand text-white"
                    >
                      {isProcessingPricing ? 'Processing...' : `Import ${pricingPreviewData.length} Price Records`}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Provider</th>
                          <th className="text-left p-3 font-medium">Medication</th>
                          <th className="text-left p-3 font-medium">Dosage</th>
                          <th className="text-left p-3 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingPreviewData.slice(0, 10).map((pricing, index) => (
                          <tr key={index} className="border-b border-neutral-100">
                            <td className="p-3">{pricing.provider_name || 'N/A'}</td>
                            <td className="p-3">{pricing.medication_name || 'N/A'}</td>
                            <td className="p-3">{pricing.dosage || 'N/A'}</td>
                            <td className="p-3 font-medium">£{pricing.price || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pricingPreviewData.length > 10 && (
                      <p className="text-center py-3 text-neutral-600">
                        ... and {pricingPreviewData.length - 10} more records
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Success Cards */}
        {providerUploadResult?.imported && (
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">
                Provider Import Complete!
              </h3>
              <p className="text-neutral-600 mb-6">
                {providerUploadResult.details?.new || 0} new providers created, {providerUploadResult.details?.updated || 0} existing providers updated.
              </p>
              <Link to={createPageUrl("Providers")}>
                <Button className="gradient-brand text-white">
                  View Providers Directory
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {pricingUploadResult?.imported && (
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">
                Pricing Import Complete!
              </h3>
              <p className="text-neutral-600 mb-6">
                Medication pricing has been successfully updated for {pricingUploadResult.details?.providersUpdated || 0} providers.
              </p>
              {pricingUploadResult.details?.unmatchedProviders?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Note:</strong> Some provider names couldn't be matched:
                  </p>
                  <p className="text-xs text-yellow-700">
                    {pricingUploadResult.details.unmatchedProviders.join(', ')}
                  </p>
                </div>
              )}
              <Link to={createPageUrl("Providers")}>
                <Button className="gradient-brand text-white">
                  View Updated Providers
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}