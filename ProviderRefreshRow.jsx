
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Provider } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Check, RefreshCw, Save, Sparkles, ThumbsDown, X, Loader2 } from 'lucide-react';

const fieldsToRefresh = {
  rating: { type: "number", description: "The provider's average star rating (e.g., 4.8)." },
  review_count: { type: "number", description: "The total number of reviews (e.g., 150)." },
  consultation_fee: { type: "number", description: "The cost of an initial consultation in GBP (numeric only)." },
  wait_time: { type: "string", description: "The typical wait time for an appointment (e.g., 'Same day', '2-3 days')." },
  special_offers: { type: "string", description: "Any special offers or discounts currently advertised." },
  description: { type: "string", description: "A brief, updated description of the provider's services." },
};

const ProviderRefreshRow = forwardRef(({ provider, onUpdate, onNewDataAvailable }, ref) => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error, saving
  const [newData, setNewData] = useState(null);
  const [error, setError] = useState(null);

  const handleRefresh = async () => {
    setStatus('loading');
    setError(null);
    onNewDataAvailable(provider.id, null); // Clear old proposed changes

    if (!provider.website) {
      setError("Provider has no website URL to scan.");
      setStatus('error');
      return;
    }

    try {
      const responseSchema = {
        type: "object",
        properties: fieldsToRefresh,
      };

      const prompt = `You are a data extraction agent. Visit the provider's website at ${provider.website}. Extract the following information accurately. If a piece of information is not available, return null for that field. Do not guess or make up data. Focus only on information present on their website.
      Provider Name: ${provider.name}`;
      
      const result = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: responseSchema,
      });

      if (result) {
        // Filter out null values from the result before checking for changes
        const filteredResult = Object.fromEntries(
            Object.entries(result).filter(([_, value]) => value !== null)
        );
        const hasChanges = Object.keys(filteredResult).some(key => {
            // Compare current provider value with new value. Handle potential type differences (e.g., number vs string)
            return String(provider[key]) !== String(filteredResult[key]);
        });
        
        if (Object.keys(filteredResult).length > 0 && hasChanges) {
          setNewData(result); // Keep original result with nulls for comparison logic
          setStatus('success');
          onNewDataAvailable(provider.id, result);
        } else {
           setStatus('idle'); // No changes found, revert to idle
           onNewDataAvailable(provider.id, null);
        }

      } else {
        throw new Error("AI returned no data. The website might be inaccessible or information wasn't found.");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred while fetching data.");
      setStatus('error');
    }
  };

  useImperativeHandle(ref, () => ({
    triggerRefresh: handleRefresh,
    resetState: () => handleDiscard(false) // Don't report up on parent-forced reset
  }));

  const handleSave = async () => {
    if (!newData) return;
    setStatus('saving');
    setError(null);
    try {
      // Filter out null values so we don't overwrite existing data with null
      const updatePayload = Object.fromEntries(
        Object.entries(newData).filter(([_, value]) => value !== null)
      );

      if (Object.keys(updatePayload).length > 0) {
        await Provider.update(provider.id, updatePayload);
        onUpdate(provider.id, updatePayload);
      }
      setStatus('idle');
      setNewData(null);
      onNewDataAvailable(provider.id, null); // Report that changes are resolved
    } catch (err) {
      setError(err.message || "Failed to save updated data.");
      setStatus('error');
    }
  };

  const handleDiscard = (reportUp = true) => {
    setStatus('idle');
    setNewData(null);
    setError(null);
    if(reportUp) {
      onNewDataAvailable(provider.id, null); // Report that changes are resolved
    }
  };
  
  const renderComparison = () => {
    if (!newData) return null;

    const changes = Object.keys(fieldsToRefresh)
      .map(key => ({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        oldValue: provider[key],
        newValue: newData[key]
      }))
      .filter(c => c.newValue !== null && String(c.newValue).trim() !== "" && String(c.oldValue) !== String(c.newValue));

    if (changes.length === 0) {
      return (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>No new information found. The provider's data is already up-to-date!</AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="space-y-2 mt-4 text-sm">
        {changes.map(change => (
          <div key={change.key} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
            <span className="font-medium text-neutral-700">{change.label}</span>
            <div className="flex items-center gap-3 text-right">
              <span className="text-neutral-500 line-through">{String(change.oldValue) || "N/A"}</span>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
              <span className="font-semibold text-green-600">{String(change.newValue)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-lg text-neutral-800">{provider.name}</h4>
          <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
            {provider.website || "No website URL"}
          </a>
        </div>
        <div className="flex items-center gap-2">
          {status === 'idle' && (
            <Button onClick={handleRefresh}>
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          )}
          {status === 'loading' && <Button disabled><Loader2 className="w-4 h-4 mr-2 animate-spin" />Fetching...</Button>}
          {status === 'saving' && <Button disabled><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</Button>}
        </div>
      </div>

      {status === 'success' && (
        <div className="mt-4 p-4 bg-blue-50/50 rounded-lg">
          <h5 className="font-semibold text-blue-800 mb-2">Review Proposed Changes</h5>
          {renderComparison()}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => handleDiscard()}>
              <ThumbsDown className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" />
              Approve & Save
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <Alert variant="destructive" className="mt-4">
          <X className="w-4 h-4" />
          <AlertDescription>
            {error}
            <Button variant="link" size="sm" className="p-0 h-auto ml-2" onClick={() => handleDiscard()}>Try Again</Button>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
});

export default ProviderRefreshRow;
