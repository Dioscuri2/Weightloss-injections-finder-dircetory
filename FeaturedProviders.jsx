import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Star, MapPin, Shield, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProviders({ providers, isLoading }) {
  if (isLoading) {
    return (
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            Top Rated Providers
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Discover the most trusted weight loss injection providers in the UK
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
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
          Top Rated Providers
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Discover the most trusted weight loss injection providers in the UK
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {providers.slice(0, 6).map((provider) => (
          <Card key={provider.id} className="group overflow-hidden border-0 shadow-elegant hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
              {provider.image_url ? (
                <img 
                  src={provider.image_url} 
                  alt={provider.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-neutral-800 border-0">
                  {provider.type}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">{provider.rating || "4.8"}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                {provider.name}
              </h3>
              
              <div className="flex items-center gap-2 text-neutral-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{provider.coverage || "UK Wide"}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {provider.gphc_registered && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    GPHC Registered
                  </Badge>
                )}
                {provider.cqc_regulated && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    CQC Regulated
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="w-4 h-4" />
                  <span>{provider.wait_time || "Same day"}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">From</div>
                  <div className="text-lg font-bold text-neutral-800">
                    £{provider.consultation_fee || "49"}
                  </div>
                </div>
              </div>

              <Link to={`${createPageUrl("Provider")}?id=${provider.id}`}>
                <Button className="w-full group-hover:gradient-brand group-hover:text-white transition-all duration-300">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link to={createPageUrl("Providers")}>
          <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50">
            View All Providers
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}