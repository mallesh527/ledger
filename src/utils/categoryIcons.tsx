import { Utensils, Home, ShoppingBag, Film, Car, ShoppingCart, HeartPulse, Gift, GraduationCap, Tag } from 'lucide-react';

export function getCategoryIcon(category: string, className = "w-3.5 h-3.5") {
  switch (category) {
    case 'Food & Dining':
      return <Utensils className={className} />;
    case 'Rent & Utilities':
      return <Home className={className} />;
    case 'Shopping':
      return <ShoppingBag className={className} />;
    case 'Entertainment':
      return <Film className={className} />;
    case 'Travel & Cabs':
      return <Car className={className} />;
    case 'Groceries':
      return <ShoppingCart className={className} />;
    case 'Healthcare':
      return <HeartPulse className={className} />;
    case 'Gifts & Celebrations':
      return <Gift className={className} />;
    case 'Education':
      return <GraduationCap className={className} />;
    default:
      return <Tag className={className} />;
  }
}
