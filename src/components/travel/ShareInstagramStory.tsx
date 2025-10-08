import { useState } from 'react';
import { Share } from '@capacitor/share';
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Capacitor } from '@capacitor/core';

interface ShareInstagramStoryProps {
  itineraryId: string;
  title: string;
  startDate: string;
  endDate: string;
  days: any[];
}

export function ShareInstagramStory({ 
  itineraryId, 
  title, 
  startDate, 
  endDate,
  days 
}: ShareInstagramStoryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useTranslation();

  const generateStoryImage = async () => {
    setIsGenerating(true);
    
    try {
      // Create a temporary div with the story content
      const storyDiv = document.createElement('div');
      storyDiv.style.position = 'fixed';
      storyDiv.style.left = '-9999px';
      storyDiv.style.width = '1080px';
      storyDiv.style.height = '1920px';
      storyDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      storyDiv.style.padding = '60px';
      storyDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      storyDiv.style.color = 'white';
      
      // Calculate days
      const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Add content
      storyDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
          <div>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 20px; margin-bottom: 40px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 10px;">📍 ${t('travelPlanner.sharedBy') || 'Shared by'}</div>
              <div style="font-size: 36px; font-weight: bold;">PassBali</div>
            </div>
            
            <div style="text-align: center; margin-bottom: 50px;">
              <h1 style="font-size: 72px; font-weight: bold; margin-bottom: 30px; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                ${title}
              </h1>
              
              <div style="display: flex; justify-content: center; gap: 40px; font-size: 32px; margin-bottom: 40px;">
                <div style="background: rgba(255,255,255,0.2); padding: 20px 30px; border-radius: 15px;">
                  📅 ${new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - ${new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 20px 30px; border-radius: 15px;">
                  ⏱️ ${daysDiff} ${t('travelPlanner.days') || 'days'}
                </div>
              </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.15); padding: 40px; border-radius: 25px; backdrop-filter: blur(10px);">
              <h2 style="font-size: 42px; font-weight: bold; margin-bottom: 30px; text-align: center;">
                ✨ ${t('travelPlanner.highlights') || 'Highlights'}
              </h2>
              <div style="display: flex; flex-direction: column; gap: 20px;">
                ${days.slice(0, 5).map((day, index) => {
                  const plannedOffers = day.itinerary_planned_offers || [];
                  if (plannedOffers.length === 0) return '';
                  
                  return `
                    <div style="font-size: 28px; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                      📍 ${day.cities?.name || ''} - ${plannedOffers.length} ${plannedOffers.length > 1 ? 'activities' : 'activity'}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
          
          <div style="text-align: center; background: rgba(255,255,255,0.2); padding: 40px; border-radius: 25px;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 15px;">
              ${t('travelPlanner.readyForAdventure') || 'Ready for this adventure?'}
            </div>
            <div style="font-size: 28px; opacity: 0.9;">
              🔗 2af2c1af-70fe-42cc-976c-665c5ed05358.lovableproject.com
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(storyDiv);
      
      // Generate canvas
      const canvas = await html2canvas(storyDiv, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      
      // Remove temporary div
      document.body.removeChild(storyDiv);
      
      // Convert to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      });
      
    } catch (error) {
      console.error('Error generating story image:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToInstagram = async () => {
    try {
      setIsGenerating(true);
      
      const blob = await generateStoryImage();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Check if we're on a native platform
        if (Capacitor.isNativePlatform()) {
          try {
            await Share.share({
              title: title,
              text: `${title} - ${t('travelPlanner.sharedBy')} PassBali`,
              url: base64data,
              dialogTitle: t('travelPlanner.shareOn') || 'Share on',
            });
          } catch (error) {
            console.error('Error sharing:', error);
            toast.error(t('travelPlanner.shareError') || 'Error sharing');
          }
        } else {
          // On web, download the image
          const link = document.createElement('a');
          link.download = `${title}-instagram-story.png`;
          link.href = base64data;
          link.click();
          toast.success(t('travelPlanner.imageDownloaded') || 'Image downloaded! You can now upload it to Instagram.');
        }
      };
      
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      toast.error(t('travelPlanner.shareError') || 'Error sharing');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={shareToInstagram}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      <Instagram className="w-4 h-4" />
      {isGenerating 
        ? (t('travelPlanner.generating') || 'Generating...')
        : (t('travelPlanner.shareInstagramStory') || 'Share on Instagram Story')
      }
    </Button>
  );
}
