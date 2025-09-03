import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Hook to format discount values with proper translation
 */
export const useDiscountFormatter = () => {
  const { t } = useLanguage();

  const formatDiscount = (valueText: string | null | undefined): string => {
    if (!valueText) return '';

    // If it's already a percentage or currency symbol, return as is
    if (valueText.includes('%') || valueText.includes('€') || valueText.includes('$') || valueText.includes('₹')) {
      return valueText;
    }

    // Check for common English patterns and translate them
    const lowerValue = valueText.toLowerCase();
    
    // Pattern: "discount X% for..."
    if (lowerValue.includes('discount') && lowerValue.includes('for')) {
      // Extract percentage if present
      const percentageMatch = valueText.match(/(\d+)%/);
      if (percentageMatch) {
        const percentage = percentageMatch[1];
        return `${t('discount.percentage_off').replace('{{percentage}}', percentage)}`;
      }
      
      // Extract amount if present
      const amountMatch = valueText.match(/(\d+)\s*(k|000)/i);
      if (amountMatch) {
        const amount = amountMatch[1] + (amountMatch[2].toLowerCase() === 'k' ? 'k' : '000');
        return `${t('discount.amount_off').replace('{{amount}}', amount)}`;
      }
      
      // Generic discount
      return t('discount.special_offer');
    }

    // Pattern: "X% off"
    if (lowerValue.includes('off')) {
      const percentageMatch = valueText.match(/(\d+)%/);
      if (percentageMatch) {
        const percentage = percentageMatch[1];
        return `${t('discount.percentage_off').replace('{{percentage}}', percentage)}`;
      }
    }

    // Pattern: "Buy X get Y"
    if (lowerValue.includes('buy') && lowerValue.includes('get')) {
      return t('discount.buy_get_offer');
    }

    // Pattern: "Free X"
    if (lowerValue.includes('free')) {
      return t('discount.free_offer');
    }

    // Pattern: "X for Y"
    if (lowerValue.includes(' for ')) {
      return t('discount.special_price');
    }

    // If no pattern matches, return the original value
    return valueText;
  };

  return { formatDiscount };
};