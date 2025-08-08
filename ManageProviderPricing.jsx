
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Provider } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Save,
  XCircle,
  DollarSign,
  Upload,
  FileText,
  Download,
  Info,
  AlertCircle as AlertCircleIcon,
  Loader2 // Added for loading states
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Define common medication dosages for UI generation
const medicationDosages = {
  Wegovy: ["0.25mg", "0.5mg", "1mg", "1.7mg", "2.4mg"],
  Mounjaro: ["2.5mg", "5mg", "7.5mg", "10mg", "12.5mg", "15mg"],
  Saxenda: ["0.6mg", "1.2mg", "1.8mg", "2.4mg", "3mg"],
  Ozempic: ["0.25mg", "0.5mg", "1mg"],
};

const expectedPricingColumns = {
  'provider_name': 'Provider Name (must match exactly with existing provider)',
  'medication_name': 'Medication Name (Wegovy, Mounjaro, Saxenda, Ozempic)',
  'dosage': 'Dosage (e.g., 0.25mg, 5mg, 3mg)',
  'price': 'Price in GBP (e.g., 180.50)'
};

export default function ManageProviderPricing() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [currentProvider, setCurrentProvider] = useState(null);
  const [pricingData, setPricingData] = useState({}); // Stores prices for current provider
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  
  // States for bulk upload
  const [selectedPricingFile, setSelectedPricingFile] = useState(null);
  const [isUploadingPricing, setIsUploadingPricing] = useState(false);
  const [pricingUploadProgress, setPricingUploadProgress] = useState(0);
  const [pricingUploadResult, setPricingUploadResult] = useState(null);
  const [pricingPreviewData, setPricingPreviewData] = useState(null);
  const [isProcessingPricing, setIsProcessingPricing] = useState(false);

  // States for data cleanup tool
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  useEffect(() => {
    const checkUserAndLoadProviders = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.role !== "admin") {
          window.location.href = createPageUrl("Home"); // Redirect non-admins
          return;
        }
        const allProviders = await Provider.list();
        setProviders(allProviders);
      } catch (error) {
        console.error("Error loading user or providers:", error);
        window.location.href = createPageUrl("Home"); // Redirect if not logged in or error
      } finally {
        setIsLoadingUser(false);
      }
    };
    checkUserAndLoadProviders();
  }, []);

  useEffect(() => {
    const loadProviderPricing = async () => {
      if (selectedProviderId) {
        setIsLoading(true);
        try {
          // Find provider in the current 'providers' state, which is kept up-to-date
          const providerData = providers.find(
            (p) => p.id === selectedProviderId
          );
          setCurrentProvider(providerData);
          setPricingData(providerData?.medications || {});
          setSaveSuccess(false);
          setSaveError(false);
        } catch (error) {
          console.error("Error loading provider pricing:", error);
          setCurrentProvider(null);
          setPricingData({});
          setSaveError(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentProvider(null);
        setPricingData({});
      }
    };
    loadProviderPricing();
  }, [selectedProviderId, providers]); // Depend on 'providers' to refresh when the global list changes

  const handlePriceChange = (medicationName, dosage, value) => {
    setPricingData((prevData) => ({
      ...prevData,
      [medicationName]: {
        ...(prevData[medicationName] || {}),
        [dosage]: value === "" ? null : parseFloat(value), // Store as number or null
      },
    }));
  };

  const handleSavePricing = async () => {
    if (!currentProvider) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);

    try {
      // Create a deep copy and round all prices before saving
      const roundedPricingData = JSON.parse(JSON.stringify(pricingData));
      for (const med in roundedPricingData) {
        for (const dose in roundedPricingData[med]) {
          const price = roundedPricingData[med][dose];
          if (typeof price === 'number') {
            roundedPricingData[med][dose] = Math.round(price);
          }
        }
      }

      await Provider.update(currentProvider.id, { medications: roundedPricingData });
      setSaveSuccess(true);
      // Re-fetch all providers to get the updated (rounded) data.
      // The useEffect hook will then update the UI automatically.
      const updatedProviders = await Provider.list();
      setProviders(updatedProviders);
      // Ensure the currentProvider state also reflects the rounded data immediately
      const updatedCurrentProvider = updatedProviders.find(p => p.id === currentProvider.id);
      if (updatedCurrentProvider) {
        setCurrentProvider(updatedCurrentProvider);
        setPricingData(updatedCurrentProvider.medications || {});
      }

    } catch (error) {
      console.error("Error saving pricing:", error);
      setSaveError(true);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(false);
      }, 3000); // Hide messages after 3 seconds
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

  const handlePricingUpload = async () => {
    if (!selectedPricingFile) return;

    setIsUploadingPricing(true);
    setPricingUploadProgress(0);
    setPricingUploadResult(null); // Clear previous results

    try {
      setPricingUploadProgress(25);
      const { file_url } = await UploadFile({ file: selectedPricingFile });
      
      setPricingUploadProgress(50);
      
      const pricingSchema = {
        type: "array", // Expect an array of objects
        items: {
          type: "object",
          properties: {
            provider_name: { type: "string" },
            medication_name: { type: "string" },
            dosage: { type: "string" },
            price: { type: "number" }
          },
          required: ["provider_name", "medication_name", "dosage", "price"]
        }
      };

      setPricingUploadProgress(75);
      
      const extractResult = await ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: pricingSchema
      });

      if (extractResult.status === 'success' && extractResult.output && Array.isArray(extractResult.output)) {
        setPricingPreviewData(extractResult.output);
        setPricingUploadProgress(100);
        setPricingUploadResult({
          success: true,
          message: `Successfully extracted ${extractResult.output.length} pricing records. Review the data below before importing. Prices will be rounded to the nearest pound upon import.`,
          count: extractResult.output.length
        });
      } else {
        setPricingUploadResult({
          success: false,
          message: extractResult.details || 'Failed to extract pricing data from CSV. Please check CSV format and content.'
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

  const handleImportPricing = async () => {
    if (!pricingPreviewData || pricingPreviewData.length === 0) return;

    setIsProcessingPricing(true);

    try {
      // Get all current providers to ensure we have the latest data
      const allProviders = await Provider.list();
      const providerUpdates = {};
      const unmatchedProviders = new Set();
      let successfulRows = 0;

      // Group pricing data by provider from the CSV
      pricingPreviewData.forEach(row => {
        const { provider_name, medication_name, dosage, price } = row;
        
        if (!provider_name || !medication_name || !dosage || price === null || price === undefined) {
          return; // Skip invalid rows
        }

        const matchingProvider = allProviders.find(p => 
          p.name.toLowerCase() === provider_name.toLowerCase()
        );

        if (matchingProvider) {
          if (!providerUpdates[matchingProvider.id]) {
            // Initialize with existing provider data to preserve other info
            providerUpdates[matchingProvider.id] = {
              ...matchingProvider,
              medications: { ...matchingProvider.medications }
            };
          }
          if (!providerUpdates[matchingProvider.id].medications[medication_name]) {
            providerUpdates[matchingProvider.id].medications[medication_name] = {};
          }
          // Round the price before assigning it
          providerUpdates[matchingProvider.id].medications[medication_name][dosage] = Math.round(price);
          successfulRows++;
        } else {
          unmatchedProviders.add(provider_name);
        }
      });

      const updatePromises = Object.values(providerUpdates).map(providerData =>
        Provider.update(providerData.id, { medications: providerData.medications })
      );

      await Promise.all(updatePromises);
      
      let resultMessage = `Successfully updated pricing for ${Object.keys(providerUpdates).length} providers (${successfulRows} price entries)! All prices were rounded to the nearest pound.`;
      if (unmatchedProviders.size > 0) {
        resultMessage += ` Warning: Could not find providers: ${Array.from(unmatchedProviders).join(', ')}. Please check names match exactly.`;
      }

      setPricingUploadResult({
        success: true,
        message: resultMessage,
        imported: true,
      });
      
      // Refresh provider data in the state to reflect changes in the manual tab
      const updatedProviders = await Provider.list();
      setProviders(updatedProviders);

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

  const downloadPricingSampleCSV = () => {
    const sampleData = [
      'provider_name,medication_name,dosage,price',
      'Sample Pharmacy,Wegovy,0.25mg,180.50',
      'Sample Pharmacy,Wegovy,0.5mg,200.00',
      'Sample Pharmacy,Mounjaro,2.5mg,210.00',
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRoundAllPrices = async () => {
    setIsCleaning(true);
    setCleanupResult(null);
    try {
        const allProviders = await Provider.list();
        let providersToUpdateCount = 0;
        const updatePromises = [];

        for (const provider of allProviders) {
            let needsUpdate = false;
            // Deep copy to avoid mutating state directly
            const roundedMedications = JSON.parse(JSON.stringify(provider.medications || {}));

            for (const medName in roundedMedications) {
                for (const dosage in roundedMedications[medName]) {
                    const price = roundedMedications[medName][dosage];
                    // Check if price is a number and has a decimal part
                    if (typeof price === 'number' && price % 1 !== 0) {
                        roundedMedications[medName][dosage] = Math.round(price);
                        needsUpdate = true;
                    }
                }
            }

            if (needsUpdate) {
                providersToUpdateCount++;
                updatePromises.push(Provider.update(provider.id, { medications: roundedMedications }));
            }
        }

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
        }

        setCleanupResult({ success: true, message: `Cleanup complete! Checked ${allProviders.length} providers and rounded prices for ${providersToUpdateCount} providers.` });
        // Refresh provider data to reflect changes
        const updatedProviders = await Provider.list();
        setProviders(updatedProviders);

    } catch (error) {
        console.error("Price cleanup error:", error);
        setCleanupResult({ success: false, message: "An error occurred during cleanup: " + error.message });
    } finally {
        setIsCleaning(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <p className="text-neutral-600 text-lg">Loading admin tools...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    // Should be redirected by useEffect, but as a fallback
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to={createPageUrl("Providers")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Providers
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            Manage Provider Medication Pricing
          </h1>
          <p className="text-lg text-neutral-600">
            Select a provider and update the pricing for their available
            medication dosages, or use the bulk upload tool.
          </p>
        </div>

        <Card className="border-0 shadow-elegant mb-8">
            <CardHeader>
                <CardTitle>Data Integrity Tools</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-neutral-600 mb-4">Use this tool for a one-time cleanup to round all existing medication prices to the nearest pound across all providers.</p>
                <Button onClick={handleRoundAllPrices} disabled={isCleaning}>
                    {isCleaning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Round All Existing Prices
                </Button>
                {cleanupResult && (
                    <Alert className={`mt-4 ${cleanupResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        {cleanupResult.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircleIcon className="h-4 w-4 text-red-600" />}
                        <AlertDescription className={cleanupResult.success ? 'text-green-800' : 'text-red-800'}>
                            {cleanupResult.message}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>

        <Tabs defaultValue="manual" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-elegant">
            <TabsTrigger value="manual" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Manual Edit
            </TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Bulk Upload via CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-8">
            <Card className="border-0 shadow-elegant mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Select Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedProviderId}
                  onValueChange={setSelectedProviderId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a provider to manage pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name} ({provider.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {isLoading ? (
              <Card className="border-0 shadow-elegant p-8 text-center">
                <p className="text-neutral-600">Loading pricing data...</p>
              </Card>
            ) : currentProvider ? (
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl">Pricing for {currentProvider.name}</h3>
                      <p className="text-sm text-neutral-600 font-normal">{currentProvider.type}</p>
                    </div>
                    <Button
                      onClick={handleSavePricing}
                      disabled={isSaving}
                      className="gradient-brand text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Pricing"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Success/Error Messages */}
                  {saveSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Pricing updated successfully!</span>
                    </div>
                  )}
                  
                  {saveError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error saving pricing. Please try again.</span>
                    </div>
                  )}

                  {Object.keys(medicationDosages).map((medicationName) => (
                    <div key={medicationName}>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                        <div className={`w-8 h-8 ${
                          medicationName === 'Wegovy' ? 'bg-blue-500' :
                          medicationName === 'Mounjaro' ? 'bg-purple-500' :
                          medicationName === 'Saxenda' ? 'bg-green-500' :
                          'bg-orange-500'
                        } rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                          {medicationName[0]}
                        </div>
                        {medicationName}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {medicationDosages[medicationName].map((dosage) => (
                          <div key={dosage} className="space-y-2">
                            <Label htmlFor={`${medicationName}-${dosage}`} className="text-sm font-medium">
                              {dosage}
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                                £
                              </span>
                              <Input
                                id={`${medicationName}-${dosage}`}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-8"
                                value={
                                  pricingData[medicationName]?.[dosage] === null
                                    ? ""
                                    : pricingData[medicationName]?.[dosage] || ""
                                }
                                onChange={(e) =>
                                  handlePriceChange(
                                    medicationName,
                                    dosage,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {medicationName !== "Ozempic" && <Separator className="my-6" />}
                    </div>
                  ))}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-blue-800 mb-2">Pricing Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Enter prices in GBP (£) without the currency symbol</li>
                      <li>• Leave fields empty for dosages not offered by this provider</li>
                      <li>• Prices should reflect the monthly cost for each dosage strength</li>
                      <li>• Click "Save Pricing" to update the provider's medication costs</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-elegant p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Select a Provider
                </h3>
                <p className="text-neutral-600">
                  Choose a provider from the dropdown above to manage their medication pricing.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bulk" className="space-y-8">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  CSV Format Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-neutral-600">
                  Your CSV file must contain the following columns:
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
                <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                  <Button onClick={downloadPricingSampleCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Pricing CSV
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
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Select Pricing CSV File</h3>
                    <p className="text-neutral-600">Click to browse and select your CSV file</p>

                  </label>
                </div>
                {selectedPricingFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <p className="font-medium text-green-800">{selectedPricingFile.name}</p>
                  </div>
                )}
                {isUploadingPricing && <Progress value={pricingUploadProgress} className="w-full" />}
                <Button 
                  onClick={handlePricingUpload}
                  disabled={!selectedPricingFile || isUploadingPricing}
                  className="gradient-brand text-white"
                >
                  {isUploadingPricing ? 'Processing...' : 'Upload & Preview'}
                </Button>
              </CardContent>
            </Card>
            
            {pricingUploadResult && (
              <Alert className={pricingUploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {pricingUploadResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircleIcon className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={pricingUploadResult.success ? 'text-green-800' : 'text-red-800'}>
                  {pricingUploadResult.message}
                </AlertDescription>
              </Alert>
            )}

            {pricingPreviewData && !pricingUploadResult?.imported && (
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Preview ({pricingPreviewData.length} records)</span>
                    <Button
                      onClick={handleImportPricing}
                      disabled={isProcessingPricing}
                      className="gradient-brand text-white"
                    >
                      {isProcessingPricing ? 'Importing...' : 'Confirm & Import Prices'}
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
                        {pricingPreviewData.slice(0, 5).map((p, i) => (
                          <tr key={i} className="border-b border-neutral-100">
                            <td className="p-3">{p.provider_name}</td>
                            <td className="p-3">{p.medication_name}</td>
                            <td className="p-3">{p.dosage}</td>
                            <td className="p-3 font-medium">£{p.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pricingPreviewData.length > 5 && <p className="text-center py-3 text-neutral-600">... and {pricingPreviewData.length - 5} more records</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
