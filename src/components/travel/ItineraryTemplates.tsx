import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Template {
  id: string;
  title: string;
  description: string;
  duration: number;
  cities: string[];
  highlights: string[];
}

const templates: Template[] = [
  {
    id: "ubud-weekend",
    title: "Week-end à Ubud",
    description: "Immersion culturelle et nature",
    duration: 3,
    cities: ["Ubud"],
    highlights: ["Rizières", "Temples", "Spa & Yoga"]
  },
  {
    id: "south-bali",
    title: "Tour de Bali Sud",
    description: "Plages et temples iconiques",
    duration: 5,
    cities: ["Seminyak", "Uluwatu", "Sanur"],
    highlights: ["Plages", "Surf", "Sunset"]
  },
  {
    id: "complete-tour",
    title: "Grand Tour de Bali",
    description: "L'essentiel de l'île",
    duration: 10,
    cities: ["Seminyak", "Ubud", "Munduk", "Amed"],
    highlights: ["Plages", "Rizières", "Volcans", "Temples"]
  },
  {
    id: "north-adventure",
    title: "Aventure Nord Bali",
    description: "Hors des sentiers battus",
    duration: 7,
    cities: ["Munduk", "Lovina", "Pemuteran"],
    highlights: ["Cascades", "Dauphins", "Plongée"]
  }
];

interface ItineraryTemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

export function ItineraryTemplates({ onSelectTemplate }: ItineraryTemplatesProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {t('travelPlanner.templates.title')}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t('travelPlanner.templates.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="p-6 hover:shadow-lg transition-all border-border/50 bg-background"
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-foreground mb-1">
                  {template.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{template.duration} jours</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{template.cities.length} villes</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {template.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <Button
                onClick={() => onSelectTemplate(template)}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {t('travelPlanner.templates.use')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
