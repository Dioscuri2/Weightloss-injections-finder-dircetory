import React from "react";
import { Shield, Users, MapPin, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function QuickStats({ providers }) {
  const stats = [
    {
      icon: Shield,
      label: "Verified Providers",
      value: providers.length || "50+",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Users,
      label: "Happy Patients",
      value: "10K+",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: MapPin,
      label: "UK Locations",
      value: "200+",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Award,
      label: "Average Rating",
      value: "4.8★",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-elegant hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-neutral-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-neutral-600">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}