import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { Loader2, CalendarClock, PackageOpen, ExternalLink, MapPin } from 'lucide-react';

// Define structure matches Java Entity
interface RentalRequest {
  id: number;
  itemTitle: string;
  itemId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  paymentStatus: 'UNPAID' | 'PAID';
  requestDate: string;
  amount: number;
}

export default function MyBorrows() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [borrows, setBorrows] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data from Backend
  useEffect(() => {
    // ✅ FIX: Just wait! Do not navigate away if the user data is still loading
    if (!currentUser) {
      return; 
    }

    const fetchMyBorrows = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/requests/borrower/${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setBorrows(data);
        } else {
           console.error("Server returned an error", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch borrows", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBorrows();
  }, [currentUser]); // React will re-run this the exact millisecond currentUser loads

  const getStatusColor = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
      case 'ACCEPTED': return 'default'; // Black/Dark
      case 'REJECTED': return 'destructive'; // Red
      default: return 'secondary'; // Gray
    }
  };

  // Keep a loading state if currentUser is still fetching
  if (!currentUser) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Borrows</h1>
          <p className="text-muted-foreground">Track items you have requested to rent.</p>
        </div>

        {loading ? (
           <div className="flex justify-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : borrows.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-4">
                <PackageOpen className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-muted-foreground mb-4">You haven't requested any items yet.</p>
              <Button onClick={() => navigate('/browse')}>
                Browse Items
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {borrows.map(req => (
              <Card 
                key={req.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <Badge variant={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                        
                        {req.paymentStatus === 'PAID' && (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                Paid & Active
                            </Badge>
                        )}

                        <span className="text-xs text-muted-foreground flex items-center ml-2">
                           <CalendarClock className="w-3 h-3 mr-1" />
                           {format(new Date(req.requestDate), 'PP')}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-xl mb-1">{req.itemTitle}</h3>
                      
                      <p className="text-sm text-muted-foreground">
                        {req.status === 'PENDING' && "Waiting for owner approval..."}
                        {req.status === 'ACCEPTED' && req.paymentStatus === 'UNPAID' && (
                            <span className="text-blue-600 font-medium">
                                Request Approved! Please visit the Payments page to proceed.
                            </span>
                        )}
                        {req.status === 'ACCEPTED' && req.paymentStatus === 'PAID' && "Item is secured. Click to view pickup location."}
                        {req.status === 'REJECTED' && "The owner declined this request."}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-full md:w-auto min-w-[150px]">
                      
                      {/* LOGIC: IF ACCEPTED & UNPAID -> LINK TO PAYMENTS PAGE */}
                      {req.status === 'ACCEPTED' && req.paymentStatus !== 'PAID' && (
                        <Button 
                            variant="outline"
                            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => navigate('/my-payments')}
                        >
                          Go to Payments <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                      )}

                      {/* LOGIC: IF PAID -> SHOW VIEW LOCATION */}
                      {req.status === 'ACCEPTED' && req.paymentStatus === 'PAID' && (
                        <Button 
                            variant="outline" 
                            className="w-full border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => navigate(`/transaction/${req.id}`)}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          View Location
                        </Button>
                      )}

                      {/* LOGIC: IF PENDING -> VIEW ITEM */}
                      {req.status === 'PENDING' && (
                        <Button variant="secondary" className="w-full" onClick={() => navigate(`/item/${req.itemId}`)}>
                          View Item Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}