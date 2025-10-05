import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS, es, id as idLocale, zhCN } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";
import { useItineraries, type Itinerary } from "@/hooks/useItineraries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ItineraryListProps {
  itineraries: Itinerary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const localeMap = {
  fr: fr,
  en: enUS,
  es: es,
  id: idLocale,
  zh: zhCN,
};

export function ItineraryList({ itineraries, selectedId, onSelect }: ItineraryListProps) {
  const { t, language } = useTranslation();
  const { deleteItinerary } = useItineraries();
  const currentLocale = localeMap[language] || fr;

  return (
    <div className="space-y-3">
      {itineraries.map((itinerary) => (
        <Card
          key={itinerary.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedId === itinerary.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onSelect(itinerary.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{itinerary.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(itinerary.start_date), "PP", { locale: currentLocale })} -{" "}
                  {format(new Date(itinerary.end_date), "PP", { locale: currentLocale })}
                </span>
              </div>
              {itinerary.is_active && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {t('travelPlanner.active')}
                </span>
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('travelPlanner.confirmDelete')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('travelPlanner.confirmDeleteDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteItinerary.mutate(itinerary.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
    </div>
  );
}
