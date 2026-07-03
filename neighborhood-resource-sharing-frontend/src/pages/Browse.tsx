import { BACKEND_URL } from '@/config';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  imageData: string;
  category: string;
  active: boolean;
  latitude?: number;
  longitude?: number;
}



export default function Browse() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // ✅ STEP 1: fetchAllItems defined first (no dependencies)
  const fetchAllItems = useCallback(() => {
    fetch(`${BACKEND_URL}/api/listings`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const activeItems = Array.isArray(data) ? data.filter((item: Listing) => item.active) : [];
        setItems(activeItems);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch failed:", err);
        toast.error("Could not connect to the server.");
        setLoading(false);
      });
  }, []);

  // ✅ STEP 2: fetchNearbyItems defined second (depends on fetchAllItems)
  const fetchNearbyItems = useCallback((lat: number, lng: number) => {
    fetch(`${BACKEND_URL}/api/listings/nearby?lat=${lat}&lng=${lng}&radius=5.0`)
      .then(res => {
        if (!res.ok) throw new Error("Nearby fetch failed");
        return res.json();
      })
      .then(data => {
        if (data.length === 0) {
          fetchAllItems();
        } else {
          setItems(data);
          setLoading(false);
          toast.success(`Found ${data.length} items near you!`);
        }
      })
      .catch(() => fetchAllItems());
  }, [fetchAllItems]);

  // ✅ STEP 3: useEffect last (both functions already initialized above)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          fetchNearbyItems(lat, lng);
        },
        (error) => {
          console.warn("Location access denied:", error);
          fetchAllItems();
        }
      );
    } else {
      fetchAllItems();
    }
  }, [fetchNearbyItems, fetchAllItems]);

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Electronics', 'Camera', 'Fitness', 'Tools', 'Furniture'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white border-b py-12 px-4 shadow-sm">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Rent anything, from anyone.
          </h1>

          {userLocation && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Navigation className="w-3 h-3 mr-1" /> Located near you
            </Badge>
          )}

          <div className="flex flex-col md:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for cameras, tools, etc."
                className="pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-700">No items found</h3>
            <p className="text-gray-500">Try adjusting your search filters, or ensure your database has items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <Card
                key={item.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-none shadow-sm ring-1 ring-gray-200 flex flex-col h-full"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                  <img
                    src={item.imageData
                      ? `data:image/jpeg;base64,${item.imageData}`
                      : "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={item.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-white/90 text-black shadow-sm hover:bg-white">
                    ₹{item.price}/day
                  </Badge>
                  {userLocation && item.latitude && item.longitude && (
                    <Badge className="absolute bottom-3 left-3 bg-black/70 text-white border-0 text-xs">
                      {getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, item.latitude, item.longitude)} km away
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" /> Nearby
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-auto">
                  <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}