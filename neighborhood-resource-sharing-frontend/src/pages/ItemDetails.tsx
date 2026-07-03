import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { MapPin, Star, User, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  deposit: number;
  imageData: string;
  category: string;
  active: boolean;
  latitude?: number;
  longitude?: number;
  providerId: number;
  providerName?: string;
  providerPhone?: string;
  city?: string;
  pincode?: string;
}

export default function ItemDetails() {
  const { id } = useParams();
  const { currentUser } = useApp();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  // 1. Fetch Item Data
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/listings`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((i: Item) => i.id === Number(id));
        setItem(found);
        setLoading(false);
      });
  }, [id]);

  // 2. Handle "Rent Now"
  const handleRentNow = async () => {
    if (!currentUser) {
      toast.error("Please login to rent items");
      navigate('/auth');
      return;
    }

    if (currentUser.id === item.providerId) {
      toast.error("You cannot rent your own item!");
      return;
    }

    setRequesting(true);
    
    // ✅ Get today's date formatted as YYYY-MM-DD for Java
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch(`${BACKEND_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          itemTitle: item.title,
          userId: currentUser.id, 
          borrowerName: currentUser.fullName,
          
          // ✅ FIX: Added the missing borrower and lender details!
          borrowerPhone: currentUser.phoneNumber || "9999999999", 
          lenderId: item.providerId,
          lenderName: item.providerName || "Owner", 
          lenderPhone: item.providerPhone || "9876543210", 
          
          // Dynamic pricing fields from the Listing
          price: item.price,
          amount: item.deposit,
          
          requestDate: today      
        })
      });

      if (response.ok) {
        toast.success("Request sent to owner! Check your dashboard.");
        navigate('/browse'); // or navigate directly to '/my-borrows'
      } else {
        toast.error("Failed to send request");
      }
    } catch (e) {
      toast.error("Server Error");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading details...</div>;
  if (!item) return <div className="p-10 text-center">Item not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Image */}
            <div className="rounded-xl overflow-hidden shadow-sm bg-white">
                <img 
                   src={item.imageData ? `data:image/jpeg;base64,${item.imageData}` : 'https://placehold.co/600x400'} 
                   className="w-full h-auto object-cover" 
                />
            </div>

            {/* Right: Info */}
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-start">
                        <Badge>{item.category}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                             <MapPin className="w-4 h-4 mr-1" /> {item.city} ({item.pincode})
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mt-2">{item.title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">4.8</span>
                        <span className="text-muted-foreground">(24 Reviews)</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-sm text-muted-foreground">Price per day</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-primary">₹{item.price}</span>
                        <span className="text-sm text-muted-foreground mb-1">+ ₹{item.deposit} Deposit</span>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>

                {/* Usage Stats Mockup */}
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
                    <User className="w-5 h-5" />
                    <span className="font-medium">12 people have rented this recently</span>
                </div>

                <Button size="lg" className="w-full" onClick={handleRentNow} disabled={requesting}>
                    {requesting ? <Loader2 className="animate-spin mr-2" /> : "Request to Rent Now"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    Payments are secured by Neighborhood Resource Sharing Platform
                </p>
            </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Avatar><AvatarFallback>U{i}</AvatarFallback></Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">User {i}</p>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, n) => <Star key={n} className="w-3 h-3 fill-current" />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Great condition, worked perfectly for my needs!</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

      </main>
    </div>
  );
}