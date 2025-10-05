import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr, enUS, es, id as idLocale, zhCN } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useItineraryDays, type ItineraryDay } from "@/hooks/useItineraryDays";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EditDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraryId: string;
  day: ItineraryDay | null;
}

const localeMap = {
  fr: fr,
  en: enUS,
  es: es,
  id: idLocale,
  zh: zhCN,
};

export function EditDayModal({ open, onOpenChange, itineraryId, day }: EditDayModalProps) {
  const { t, language } = useTranslation();
  const { createDay, updateDay } = useItineraryDays(itineraryId);
  const currentLocale = localeMap[language] || fr;

  const [date, setDate] = useState<Date>();
  const [cityId, setCityId] = useState<string>("");
  const [dayOrder, setDayOrder] = useState("");
  const [notes, setNotes] = useState("");

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("*").order("name");
      return data || [];
    },
  });

  useEffect(() => {
    if (day) {
      setDate(new Date(day.day_date));
      setCityId(day.city_id || "");
      setDayOrder(day.day_order.toString());
      setNotes(day.notes || "");
    } else {
      setDate(undefined);
      setCityId("");
      setDayOrder("1");
      setNotes("");
    }
  }, [day]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const dayData = {
      itinerary_id: itineraryId,
      day_date: format(date, "yyyy-MM-dd"),
      city_id: cityId || undefined,
      day_order: parseInt(dayOrder) || 1,
      notes: notes || undefined,
    };

    if (day) {
      await updateDay.mutateAsync({ id: day.id, ...dayData });
    } else {
      await createDay.mutateAsync(dayData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{day ? t('travelPlanner.editDay') : t('travelPlanner.addDay')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('travelPlanner.date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PP", { locale: currentLocale }) : t('travelPlanner.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={currentLocale}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t('travelPlanner.city')}</Label>
            <Select value={cityId} onValueChange={setCityId}>
              <SelectTrigger>
                <SelectValue placeholder={t('travelPlanner.selectCity')} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city: any) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayOrder">{t('travelPlanner.dayOrder')}</Label>
            <Input
              id="dayOrder"
              type="number"
              value={dayOrder}
              onChange={(e) => setDayOrder(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('travelPlanner.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('travelPlanner.notesPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!date}>
              {day ? t('common.save') : t('common.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
