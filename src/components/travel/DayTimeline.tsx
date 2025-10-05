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
    <Card className="p-6 shadow-elegant">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{t('travelPlanner.dayTimeline')}</h3>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t('travelPlanner.addDay')}
        </Button>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
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
    </Card>
  );
}

function DayCard({ day, isSelected, onSelect, onEdit, onDelete, currentLocale, t, getTranslatedText }: any) {
  const { plannedOffers } = usePlannedOffers(day.id);

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {format(new Date(day.day_date), "EEEE, PP", { locale: currentLocale })}
            </span>
          </div>
          {day.cities && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span>{day.cities.name}</span>
            </div>
          )}
          {day.notes && (
            <p className="text-sm text-muted-foreground mt-2">{day.notes}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {plannedOffers.length} {t('travelPlanner.plannedOffers')}
          </p>
          <div className="space-y-1">
            {plannedOffers.slice(0, 3).map((po) => (
              <div key={po.id} className="text-sm flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                <span className="truncate">
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
              <p className="text-xs text-muted-foreground">
                +{plannedOffers.length - 3} {t('travelPlanner.more')}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
