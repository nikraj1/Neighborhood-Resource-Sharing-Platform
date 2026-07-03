import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';
import { WishlistButton } from '@/components/WishlistButton';
import { Star, ArrowLeft, Heart, Bell, Loader2 } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  deposit: number;
  imageData?: string;
  category: string;
  active: boolean;
}

export default function Wishlist() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const [items, setItems] = useState<Listing[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    if (!currentUser) return;
    const saved = localStorage.getItem(`wishlist_${currentUser.id}`);
    if (saved) {
      try {
        setWishlistIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      setWishlistIds([]);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    loadWishlist();

    // Fetch listings
    fetch(`${BACKEND_URL}/api/listings`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Listen for custom events
    window.addEventListener('wishlist-update', loadWishlist);
    return () => {
      window.removeEventListener('wishlist-update', loadWishlist);
    };
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const wishlistItems = items.filter(item => wishlistIds.includes(item.id));
  const availableItemsCount = wishlistItems.filter(item => item.active).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
            <h1 className="text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>

        {availableItemsCount > 0 && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Bell className="h-4 w-4 text-primary animate-bounce" />
            <AlertDescription className="text-primary font-medium">
              <strong>{availableItemsCount} item(s)</strong> in your wishlist are available to rent!
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-gray-50/50">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/35 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you're interested in by clicking the heart icon on any listing</p>
            <Button onClick={() => navigate('/browse')} className="bg-blue-600 hover:bg-blue-700">Browse Items</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map(item => {
              const isUnavailable = !item.active;
              
              return (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden transition-all duration-350 hover:shadow-lg flex flex-col h-full border border-gray-200 group relative ${isUnavailable ? 'opacity-65' : ''}`}
                  onClick={() => !isUnavailable && navigate(`/item/${item.id}`)}
                >
                  <CardHeader className="p-0 relative">
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <img 
                        src={item.imageData ? `data:image/jpeg;base64,${item.imageData}` : 'https://placehold.co/600x400'} 
                        alt={item.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${!isUnavailable && 'group-hover:scale-105'}`}
                      />
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton itemId={item.id} className="bg-white/80 backdrop-blur-sm shadow-sm" />
                    </div>
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold">Not Available</Badge>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg line-clamp-1 text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Daily Rate</p>
                        <p className="text-lg font-bold text-primary">₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Deposit</p>
                        <p className="text-sm font-semibold text-gray-800">₹{item.deposit}</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      disabled={isUnavailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/item/${item.id}`);
                      }}
                    >
                      {isUnavailable ? 'Currently Unavailable' : 'View Details'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
