
import React, { useState, useEffect } from "react";
import { Medication } from "@/api/entities";
import { Info, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "@/utils"; // Corrected import path

import MedicationCard from "../components/medications/MedicationCard";
import MedicationComparison from "../components/medications/MedicationComparison";
import AdSlot from "../components/common/AdSlot";
import GuideCTA from "../components/common/GuideCTA";
import SEOHead from "../components/seo/SEOHead";

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default medications if none in database
  const defaultMedications = [
    {
      id: "wegovy",
      name: "Wegovy",
      generic_name: "Semaglutide",
      description: "Weekly injection for chronic weight management in adults with obesity or overweight.",
      how_it_works: "Mimics GLP-1 hormone to slow digestion, reduce appetite, and help you feel full longer.",
      dosage_options: ["0.25mg", "0.5mg", "1mg", "1.7mg", "2.4mg"],
      side_effects: ["Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Constipation"],
      average_price: 199,
      price_range: "£179-£219",
      approval_status: "MHRA Approved",
      brand_color: "bg-blue-500"
    },
    {
      id: "mounjaro",
      name: "Mounjaro",
      generic_name: "Tirzepatide",
      description: "Dual-action weekly injection that targets both GLP-1 and GIP receptors.",
      how_it_works: "Works on two hormone pathways to provide enhanced appetite control and weight loss.",
      dosage_options: ["2.5mg", "5mg", "7.5mg", "10mg", "12.5mg", "15mg"],
      side_effects: ["Nausea", "Diarrhea", "Vomiting", "Constipation", "Stomach discomfort"],
      average_price: 229,
      price_range: "£209-£249",
      approval_status: "MHRA Approved",
      brand_color: "bg-purple-500"
    },
    {
      id: "saxenda",
      name: "Saxenda",
      generic_name: "Liraglutide",
      description: "Daily injection for weight management in adults with BMI ≥30 or ≥27 with comorbidities.",
      how_it_works: "GLP-1 receptor agonist that slows gastric emptying and promotes satiety.",
      dosage_options: ["0.6mg", "1.2mg", "1.8mg", "2.4mg", "3mg"],
      side_effects: ["Nausea", "Hypoglycemia", "Diarrhea", "Constipation", "Headache"],
      average_price: 159,
      price_range: "£139-£179",
      approval_status: "MHRA Approved",
      brand_color: "bg-green-500"
    },
    {
      id: "ozempic",
      name: "Ozempic",
      generic_name: "Semaglutide",
      description: "Originally for diabetes, used off-label for weight management.",
      how_it_works: "Same mechanism as Wegovy but licensed primarily for diabetes treatment.",
      dosage_options: ["0.25mg", "0.5mg", "1mg"],
      side_effects: ["Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Constipation"],
      average_price: 179,
      price_range: "£159-£199",
      approval_status: "Off-label use",
      brand_color: "bg-orange-500"
    }
  ];

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const data = await Medication.list();
      setMedications(data.length > 0 ? data : defaultMedications);
    } catch (error) {
      console.error("Error loading medications:", error);
      setMedications(defaultMedications);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMedicationSelection = (medication) => {
    setSelectedMedications(prev => {
      const isSelected = prev.some(m => m.id === medication.id);
      if (isSelected) {
        return prev.filter(m => m.id !== medication.id);
      } else if (prev.length < 3) {
        return [...prev, medication];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* SEO Head with Schema */}
      <SEOHead
        title="Weight Loss Medications Comparison - UK Guide"
        description="Compare MHRA-approved weight loss injections including Wegovy, Mounjaro, and Saxenda. Understand dosages, side effects, and pricing from UK providers."
        keywords="weight loss medications, Wegovy vs Mounjaro, Saxenda comparison, MHRA approved, weight loss injections, UK medication guide"
        image={`${typeof window !== 'undefined' ? window.location.origin : ''}/medications-og.jpg`}
        schemas={[
          {
            type: "FAQPage",
            data: {
              faqs: [
                {
                  question: "What are the most effective weight loss injections available in the UK?",
                  answer: "The most effective MHRA-approved weight loss injections in the UK are Wegovy (semaglutide), Mounjaro (tirzepatide), and Saxenda (liraglutide). These are GLP-1 receptor agonists that help reduce appetite and promote weight loss."
                },
                {
                  question: "How much do weight loss injections cost in the UK?",
                  answer: "Weight loss injections typically cost between £139-£249 per month in the UK, depending on the medication and provider. Wegovy averages £199, Mounjaro £229, and Saxenda £159 per month."
                },
                {
                  question: "Do I need a prescription for weight loss injections?",
                  answer: "Yes, all weight loss injections including Wegovy, Mounjaro, and Saxenda are prescription-only medicines in the UK and require consultation with a qualified healthcare provider."
                }
              ]
            }
          },
          ...medications.slice(0, 3).map(medication => ({
            type: "Product",
            data: medication
          }))
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
            Weight Loss Medications
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Compare MHRA-approved weight loss injections available from UK providers.
            All medications require a prescription from a registered healthcare professional.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-amber-800 mb-1">Important Medical Information</p>
                <p className="text-sm text-amber-700">
                  These medications are prescription-only and require medical supervision.
                  Always consult with a qualified healthcare provider before starting treatment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* New Callout to Ultimate Guide */}
        <div className="mb-12">
          <Card className="border-0 shadow-elegant bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Want a Deeper Dive?</h2>
                <p className="text-neutral-600">Read our ultimate guide comparing Mounjaro, Wegovy, and Saxenda head-to-head.</p>
              </div>
              <a href={createPageUrl("Article?slug=uk-weight-loss-injections-mounjaro-wegovy-saxenda")}>
                <Button size="lg" className="gradient-brand text-white shadow-lg hover:shadow-xl transition-shadow">
                  Read the Ultimate Guide
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* AD PLACEMENT: Medication Page Top */}
        <div className="mb-8">
          <AdSlot placementName="medication-page-top" />
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-elegant">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="compare" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Compare ({selectedMedications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Medication Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {medications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  isSelected={selectedMedications.some(m => m.id === medication.id)}
                  onToggleSelection={toggleMedicationSelection}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {/* New Guide CTA Section */}
            <div className="my-16">
              <GuideCTA />
            </div>

            {/* AD PLACEMENT: Medication Page Middle */}
            <div className="my-8">
              <AdSlot placementName="medication-page-middle" />
            </div>

            {/* Educational Content */}
            <section className="bg-white rounded-3xl shadow-elegant p-8 md:p-12">
              <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
                Understanding Weight Loss Injections
              </h2>

              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">How They Work</h3>
                  <div className="space-y-4 text-neutral-600">
                    <p>
                      These medications work by mimicking natural gut hormones (like GLP-1) that regulate appetite and blood sugar. They slow down how quickly your stomach empties and send signals to your brain that you're full, which helps reduce overall calorie intake.
                    </p>
                    <p>
                      Most are GLP-1 receptor agonists, first developed for diabetes. Mounjaro is unique as it's a dual-agonist, targeting both GLP-1 and GIP receptors for potentially enhanced effects.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">Who is Eligible?</h3>
                  <div className="space-y-4 text-neutral-600">
                    <p>
                      According to MHRA and NICE guidelines, these treatments are typically prescribed for adults with:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>A Body Mass Index (BMI) of 30 kg/m² or higher (obesity).</li>
                      <li>A BMI between 27 and 30 kg/m² (overweight) who also have at least one weight-related health condition, such as high blood pressure or type 2 diabetes.</li>
                    </ul>
                    <p className="text-xs italic">This is part of a holistic weight management plan that includes diet and exercise.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
                  <p className="text-sm text-neutral-500">This information is for educational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.</p>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="compare" className="space-y-8">
            {/* Medication Comparison Section with new wrapper */}
            <div className="my-16">
              <MedicationComparison medications={selectedMedications} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
