import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface LocationFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const PINCODES = [
  { code: '110001', name: 'Central Delhi' },
  { code: '110002', name: 'North Delhi' },
  { code: '110003', name: 'South Delhi' },
  { code: '110004', name: 'East Delhi' },
  { code: '110005', name: 'West Delhi' },
  { code: 'all', name: 'All Locations' },
];

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {PINCODES.map(pin => (
            <SelectItem key={pin.code} value={pin.code}>
              {pin.name} {pin.code !== 'all' && `(${pin.code})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const PINCODE_DATA = PINCODES;
