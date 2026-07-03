import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

export function NearYouBadge() {
  return (
    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
      <MapPin className="h-3 w-3 mr-1" />
      Near You
    </Badge>
  );
}
