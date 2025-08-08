
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, ArrowRight, Info, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopularMedications({ medications, isLoading, providers = [] }) {
  const defaultMedications = [
    {
      name: "Wegovy",
      generic_name: "Semaglutide",
      description: "Weekly injection for weight management",
      average_price: 199,
      brand_color: "bg-blue-500",
      approval_status: "MHRA Approved"
    },
    {
      name: "Mounjaro",
      generic_name: "Tirzepatide",
      description: "Dual-action weekly injection",
      average_price: 229,
      brand_color: "bg-purple-500",
      approval_status: "MHRA Approved"
    },
    {
      name: "Saxenda",
      generic_name: "Liraglutide",
      description: "Daily injection for weight loss",
      average_price: 159,
      brand_color: "bg-green-500",
      approval_status: "MHRA Approved"
    },
    {
      name: "Ozempic",
      generic_name: "Semaglutide",
      description: "Weekly injection (off-label)",
      average_price: 179,
      brand_color: "bg-orange-500",
      approval_status: "Off-label use"
    }
  ];

  const displayMedications = medications.length > 0 ? medications : defaultMedications;

  // Helper function to get cheapest price for a medication from all providers
  const getCheapestPrice = (medicationName) => {
    if (!providers || providers.length === 0) return null;
    
    let cheapestPrice = Infinity;
    let providerWithCheapest = null;
    
    providers.forEach(provider => {
      if (provider.medications && provider.medications[medicationName]) {
        const dosages = provider.medications[medicationName];
        Object.values(dosages).forEach(price => {
          if (typeof price === 'number' && price < cheapestPrice) {
            cheapestPrice = price;
            providerWithCheapest = provider.name;
          }
        });
      }
    });
    
    return cheapestPrice === Infinity ? null : { price: cheapestPrice, provider: providerWithCheapest };
  };

  if (isLoading) {
    return (
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            Popular Medications
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Compare the most requested weight loss injection medications
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-6 w-16 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
          Popular Medications
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Compare the most requested weight loss injection medications and find the best prices
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {displayMedications.slice(0, 4).map((medication, index) => {
          const cheapestInfo = getCheapestPrice(medication.name);
          
          return (
            <Card key={medication.id || index} className="group border-0 shadow-elegant hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${medication.brand_color || 'bg-blue-500'} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                    {medication.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 group-hover:text-blue-700 transition-colors duration-300">
                      {medication.name}
                    </h3>
                    <p className="text-xs text-neutral-600">{medication.generic_name}</p>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {medication.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    {medication.approval_status}
                  </Badge>
                  <div className="text-right">
                    <div className="text-xs text-neutral-600">From</div>
                    <div className="font-bold text-lg text-neutral-800">
                      {cheapestInfo ? (
                        <div>
                          <div>£{cheapestInfo.price}</div>
                          <div className="text-xs text-green-600 font-normal">{cheapestInfo.provider}</div>
                        </div>
                      ) : (
                        `£${medication.average_price}`
                      )}
                    </div>
                  </div>
                </div>

                <Link to={`${createPageUrl("Providers")}?medication=${encodeURIComponent(medication.name)}&sortBy=medication_price_low`}>
                  <Button variant="outline" className="w-full group-hover:gradient-brand group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Compare Prices
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Link to={createPageUrl("Medications")}>
          <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50">
            View All Medications
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
