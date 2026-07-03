import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Calendar, Trash2, Loader2, Package, PlusCircle, Pencil } from 'lucide-react';
import { toast } from 'sonner';

// Define structure matching your Java Listing Entity
interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  deposit: number;
  imageData: string; // Base64 string from Backend
  description?: string;
  createdAt: string;
}

export default function MyListings() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Listings (Using ListingController)
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const fetchListings = async () => {
      try {
        // ✅ CORRECTED: Points to /api/listings
        const response = await fetch(`${BACKEND_URL}/api/listings/provider/${currentUser.id}`);
        
        if (response.ok) {
          const data = await response.json();
          // Safety check to ensure it is an array
          setMyListings(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch listings");
          toast.error("Could not load listings");
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentUser, navigate]);

  // 2. Handle Delete Listing
  const handleDelete = async (listingId: number) => {
    if(!confirm("Are you sure you want to delete this listing?")) return;

    try {
        // ✅ CORRECTED: Points to /api/listings
        const res = await fetch(`${BACKEND_URL}/api/listings/${listingId}`, {
            method: 'DELETE'
        });

        if(res.ok) {
            toast.success("Listing deleted successfully");
            // Remove the deleted item from the UI immediately
            setMyListings(prev => prev.filter(item => item.id !== listingId));
        } else {
            toast.error("Failed to delete listing");
        }
    } catch (error) {
        console.error(error);
        toast.error("Server error");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
            <p className="text-muted-foreground">Manage the items you are renting out.</p>
          </div>
          <Button onClick={() => navigate('/list-item')} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(myListings || []).length === 0 ? (
               <div className="col-span-full text-center py-16 bg-white rounded-lg border border-dashed shadow-sm">
                 <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                 <h3 className="text-lg font-medium">No listings yet</h3>
                 <p className="text-muted-foreground mb-4">Start earning by renting out your unused items.</p>
                 <Button onClick={() => navigate('/list-item')} variant="outline">Create your first listing</Button>
               </div>
            ) : (
              myListings.map((item) => (
                <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full border-gray-200">
                  
                  {/* Image Section (Handling Base64) */}
                  <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                    <img 
                      src={item.imageData 
                        ? `data:image/jpeg;base64,${item.imageData}` 
                        : 'https://via.placeholder.com/600x400?text=No+Image'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                         <Badge className="bg-white/90 text-black hover:bg-white border-0 shadow-sm">
                            {item.category}
                         </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1">{item.title}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Listed on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
                      <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Rent</span>
                          <div className="font-bold text-primary text-lg">₹{item.price}<span className="text-xs font-normal text-gray-500">/day</span></div>
                      </div>
                      <div className="text-right border-l pl-4">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Deposit</span>
                          <div className="font-medium">₹{item.deposit}</div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-6 py-4 border-t bg-gray-50/50 flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => navigate(`/edit-item/${item.id}`)}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1 hover:bg-red-600 shadow-none"
                        onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}