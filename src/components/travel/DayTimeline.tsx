import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS, es, id as idLocale, zhCN } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";
import { useItineraryDays, type ItineraryDay } from "@/hooks/useItineraryDays";
import { usePlannedOffers } from "@/hooks/usePlannedOffers";
import { useState } from "react";
import { EditDayModal } from "./EditDayModal";
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

interface DayTimelineProps {
  itineraryId: string;
  days: ItineraryDay[];
  selectedDayId: string | null;
  onSelectDay: (id: string) => void;
}

const localeMap = {
  fr: fr,
  en: enUS,
  es: es,
  id: idLocale,
  zh: zhCN,
};

export function DayTimeline({ itineraryId, days, selectedDayId, onSelectDay }: DayTimelineProps) {
  const { t, language, getTranslatedText } = useTranslation();
  const { deleteDay } = useItineraryDays(itineraryId);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const currentLocale = localeMap[language] || fr;

  const handleEdit = (day: ItineraryDay, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDay(day);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingDay(null);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('travelPlanner.dayTimeline')}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {days.length} {days.length === 1 ? t('travelPlanner.day') : t('travelPlanner.days')}
          </p>
        </div>
        <Button 
          onClick={handleAddNew} 
          className="bg-primary/90 hover:bg-primary shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('travelPlanner.addDay')}
        </Button>
      </div>

      {/* Timeline with connecting line */}
      <div className="relative space-y-4 md:space-y-6">
        {/* Vertical line connector - hidden on small mobile */}
        {days.length > 1 && (
          <div className="hidden sm:block absolute left-6 md:left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40" />
        )}
        
        {days.map((day, index) => (
          <DayCard
            key={day.id}
            day={day}
            dayNumber={index + 1}
            isSelected={selectedDayId === day.id}
            onSelect={() => onSelectDay(day.id)}
            onEdit={(e) => handleEdit(day, e)}
            onDelete={() => deleteDay.mutate(day.id)}
            currentLocale={currentLocale}
            t={t}
            getTranslatedText={getTranslatedText}
          />
        ))}
      </div>

      <EditDayModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        itineraryId={itineraryId}
        day={editingDay}
      />
    </div>
  );
}

function DayCard({ day, dayNumber, isSelected, onSelect, onEdit, onDelete, currentLocale, t, getTranslatedText }: any) {
  const { plannedOffers } = usePlannedOffers(day.id);

  return (
    <div className="relative flex gap-2 sm:gap-3 md:gap-4 group">
      {/* Day number badge - responsive sizing */}
      <div className={`relative z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-base md:text-lg transition-all ${
        isSelected 
          ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg scale-105 md:scale-110" 
          : "bg-card border-2 border-border text-muted-foreground group-hover:border-primary/50"
      }`}>
        {dayNumber}
      </div>

      {/* Card content - optimized padding */}
      <Card
        className={`flex-1 p-3 sm:p-4 md:p-5 cursor-pointer transition-all hover:shadow-xl min-w-0 ${
          isSelected 
            ? "ring-2 ring-primary shadow-lg bg-gradient-to-br from-card to-primary/5" 
            : "hover:border-primary/30"
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm sm:text-base truncate">
                {format(new Date(day.day_date), "EEE, d MMM yyyy", { locale: currentLocale })}
              </span>
            </div>
            {day.cities && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-primary/10 text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full w-fit max-w-full">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="font-medium truncate">{day.cities.name}</span>
              </div>
            )}
            {day.notes && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 md:mt-3 leading-relaxed line-clamp-2">{day.notes}</p>
            )}
          </div>
          <div className="flex gap-0.5 sm:gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 hover:text-primary"
              onClick={onEdit}
            >
              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('travelPlanner.confirmDeleteDay')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('travelPlanner.confirmDeleteDayDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {plannedOffers.length > 0 && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] sm:text-xs font-bold text-primary">{plannedOffers.length}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {t('travelPlanner.plannedOffers')}
              </p>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {plannedOffers.slice(0, 3).map((po) => (
                <div key={po.id} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors min-w-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm truncate flex-1">
                    {po.offers ? getTranslatedText(po.offers.title, {
                      en: po.offers.title_en,
                      es: po.offers.title_es,
                      id: po.offers.title_id,
                      zh: po.offers.title_zh,
                    }) : "Offre"}
                  </span>
                </div>
              ))}
              {plannedOffers.length > 3 && (
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center pt-1 sm:pt-2">
                  +{plannedOffers.length - 3} {t('travelPlanner.more')}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
