import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Loader2, Check, X, Eye } from 'lucide-react';

interface RentalRequest {
  id: number;
  itemTitle: string;
  borrowerName: string;
  status: string;
  paymentStatus: string;
}

export default function ManageRequests() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Requests for Lender
  useEffect(() => {
    if (!currentUser) return;
    fetch(`${BACKEND_URL}/api/requests/lender/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      });
  }, [currentUser]);

  // 2. Handle Accept/Reject
  const updateStatus = async (id: number, status: string) => {
    await fetch(`${BACKEND_URL}/api/requests/${id}/status?status=${status}`, { method: 'PUT' });
    toast.success(`Request ${status}`);
    // Refresh list
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    setRequests(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Rental Requests</h1>

        {loading ? <Loader2 className="animate-spin mx-auto" /> : (
          <div className="space-y-4">
            {requests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{req.itemTitle}</h3>
                        <Badge variant={req.status === 'ACCEPTED' ? 'default' : 'secondary'}>{req.status}</Badge>
                        {req.paymentStatus === 'PAID' && <Badge variant="outline" className="text-green-600 border-green-200">Paid</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">Requested by: {req.borrowerName}</p>
                  </div>

                  <div className="flex gap-2">
                    {/* IF PENDING: Show Accept/Reject */}
                    {req.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(req.id, 'ACCEPTED')} className="bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(req.id, 'REJECTED')}>
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}

                    {/* IF ACCEPTED: Show "View Transaction" */}
                    {req.status === 'ACCEPTED' && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/transaction/${req.id}`)}>
                        <Eye className="w-4 h-4 mr-2" /> View Transaction
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && <p className="text-center text-muted-foreground">No requests found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}