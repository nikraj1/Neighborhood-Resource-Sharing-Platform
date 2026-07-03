import { BACKEND_URL } from '@/config';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Loader2, CreditCard, CheckCircle, ArrowRight, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AcceptedRequest {
  id: number;
  itemTitle: string;
  status: string;
  paymentStatus: string;
  amount: number;
  price?: number;
  startDate?: string;
  returnDate?: string;
}

export default function MyPayments() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  
  const [requests, setRequests] = useState<AcceptedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedReq, setSelectedReq] = useState<AcceptedRequest | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch accepted requests
  const fetchMyRequests = useCallback(() => {
    fetch(`${BACKEND_URL}/api/requests/borrower/${currentUser?.id}`)
      .then(res => res.json())
      .then(data => {
        const paymentRelated = (data as AcceptedRequest[]).filter((r) => r.status === 'ACCEPTED');
        // Sort newest first
        setRequests(paymentRelated.sort((a, b) => b.id - a.id));
        setLoading(false);
      });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    fetchMyRequests();
  }, [currentUser, fetchMyRequests]);

  // Math Logic for Modal
  const calculateTotal = () => {
    if (!startDate || !endDate) return { days: 0, total: 0, deposit: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return { days: 0, total: 0, deposit: 0, error: "End date must be after start date" };

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day
    
    const dailyRate = selectedReq?.price || 500; 
    const deposit = selectedReq?.amount || 1000; 
    
    const total = (days * dailyRate) + deposit;

    return { days, dailyRate, deposit, total };
  };

  const totals = calculateTotal();

  // Execute Payment
  const handlePayment = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both dates");
      return;
    }
    if (totals.error) {
      toast.error(totals.error);
      return;
    }

    setProcessing(true);
    
    try {
      // Hitting the Phase 1 Java Endpoint
      const response = await fetch(
        `${BACKEND_URL}/api/requests/${selectedReq.id}/pay?userId=${currentUser?.id}&startDate=${startDate}&endDate=${endDate}&totalAmount=${totals.total}`, 
        { method: 'POST' }
      );

      if (response.ok) {
        toast.success("Payment Successful! Escrow locked.");
        setSelectedReq(null); // Close modal
        setStartDate('');
        setEndDate('');
        fetchMyRequests(); // Refresh the list
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (e) {
      toast.error("Server Error");
    } finally {
      setProcessing(false);
    }
  };

  const pendingPayments = requests.filter(r => r.paymentStatus !== 'PAID');
  const completedPayments = requests.filter(r => r.paymentStatus === 'PAID');

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-8 h-8" /> Payments & Transactions
        </h1>

        {loading ? <Loader2 className="animate-spin mx-auto mt-20 w-10 h-10 text-blue-600" /> : (
          <div className="space-y-8">
            
            {/* SECTION 1: Pending Payments */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-blue-800">Pending Payments</h2>
                {pendingPayments.length === 0 ? (
                    <p className="text-muted-foreground italic bg-white p-6 rounded-lg shadow-sm">No pending payments.</p>
                ) : (
                    <div className="grid gap-4">
                        {pendingPayments.map(req => (
                            <Card key={req.id} className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{req.itemTitle}</h3>
                                        <p className="text-sm text-muted-foreground">Security Deposit: ₹{req.amount || 1000}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Payment Pending</Badge>
                                            <span className="text-xs text-blue-600 font-medium">Pay to set dates & unlock contact</span>
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                                        onClick={() => setSelectedReq(req)} // Opens the modal
                                    >
                                        Pay Now <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* SECTION 2: Payment History (Paid Items) */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Active Rentals & History</h2>
                {completedPayments.length === 0 ? (
                    <p className="text-muted-foreground italic bg-white p-6 rounded-lg shadow-sm">No active rentals yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {completedPayments.map(req => (
                            <Card key={req.id} className="bg-green-50/30 border-green-200">
                                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="opacity-90">
                                        <h3 className="font-bold text-lg text-gray-800">{req.itemTitle}</h3>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Rental Period: {req.startDate} to {req.returnDate}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-100">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Paid & Escrow Locked
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50" onClick={() => navigate(`/transaction/${req.id}`)}>
                                        View Details & Location
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

          </div>
        )}
      </div>

      {/* 🚀 THE ESCROW PAYMENT MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5"/> Select Rental Dates</h3>
                    <button onClick={() => setSelectedReq(null)} className="hover:bg-blue-700 p-1 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Item</p>
                        <p className="font-semibold text-lg">{selectedReq.itemTitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Pickup Date</label>
                            <input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Return Date</label>
                            <input 
                                type="date" 
                                min={startDate || new Date().toISOString().split('T')[0]}
                                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Auto-Calculation Receipt */}
                    <div className="bg-gray-50 rounded-lg p-4 border space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rental Duration</span>
                            <span className="font-medium">{totals.days} Days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Daily Rate</span>
                            <span className="font-medium">₹{totals.dailyRate}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Refundable Security Deposit</span>
                            <span className="font-medium">₹{totals.deposit}</span>
                        </div>
                        <div className="flex justify-between pt-1 text-base font-bold text-blue-700">
                            <span>Total to Pay (Escrow)</span>
                            <span>₹{totals.total}</span>
                        </div>
                        {totals.error && <p className="text-red-500 text-xs mt-2">{totals.error}</p>}
                    </div>

                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" 
                        onClick={handlePayment} 
                        disabled={processing || !startDate || !endDate || !!totals.error}
                    >
                        {processing ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : `Pay ₹${totals.total} Securely`}
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        Your deposit is held securely by Neighborhood Resource Sharing Platform and refunded upon return.
                    </p>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}