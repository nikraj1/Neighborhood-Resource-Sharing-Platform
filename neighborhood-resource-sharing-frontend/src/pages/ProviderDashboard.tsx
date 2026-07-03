import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Package, DollarSign, Wallet, TrendingUp, Eye, ShoppingBag, Plus, Loader2 } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  deposit: number;
  imageData?: string;
  status?: string;
}

interface RentalRequest {
  id: number;
  itemId: number;
  itemTitle: string;
  status: string;
  paymentStatus: string;
  amount: number;
  startDate: string;
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [myItems, setMyItems] = useState<Listing[]>([]);
  const [myTransactions, setMyTransactions] = useState<RentalRequest[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch listings
        const listingsRes = await fetch(`${BACKEND_URL}/api/listings/provider/${currentUser.id}`);
        const listingsData = await listingsRes.json();
        setMyItems(Array.isArray(listingsData) ? listingsData : []);

        // 2. Fetch requests (transactions)
        const requestsRes = await fetch(`${BACKEND_URL}/api/requests/lender/${currentUser.id}`);
        const requestsData = await requestsRes.json();
        setMyTransactions(Array.isArray(requestsData) ? requestsData : []);

        // 3. Fetch wallet balance
        const walletRes = await fetch(`${BACKEND_URL}/api/wallet/${currentUser.id}`);
        const walletData = await walletRes.json();
        setBalance(walletData.balance || 0);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
        </div>
      </div>
    );
  }

  const completedTransactions = myTransactions.filter(t => t.status === 'COMPLETED');
  
  // Calculate earnings based on rental request payout logic: (total - deposit) * 90%
  const totalEarnings = completedTransactions.reduce((sum, t) => {
    const listing = myItems.find(i => i.id === t.itemId);
    const deposit = listing ? listing.deposit : (t.amount * 0.5);
    const rental = t.amount - deposit;
    const earnings = rental > 0 ? rental * 0.90 : 0.0;
    return sum + earnings;
  }, 0);

  const activeListings = myItems.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Lender Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and track earnings</p>
          </div>
          <Button onClick={() => navigate('/list-item')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            List New Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-3xl font-bold text-primary">₹{balance.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-600">₹{totalEarnings.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <p className="text-3xl font-bold">{activeListings}</p>
                </div>
                <div className="p-3 bg-accent/20 rounded-full">
                  <Package className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-150" onClick={() => navigate('/my-listings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                My Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View and manage all your listed items</p>
              <div className="flex justify-between text-sm">
                <span>Total Items: {myItems.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-150" onClick={() => navigate('/earnings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                My Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Track your earnings and revenue breakdown</p>
              <div className="flex justify-between text-sm">
                <span>Completed: {completedTransactions.length}</span>
                <span>Total: ₹{totalEarnings.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-150" onClick={() => navigate('/withdraw')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Withdraw Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Transfer earnings to your bank/UPI account</p>
              <div className="flex justify-between text-sm">
                <span>Available: ₹{balance.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            {myTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 animate-pulse">No rental history yet</p>
            ) : (
              <div className="space-y-4">
                {myTransactions.slice(0, 5).map(transaction => {
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.itemTitle}</p>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium capitalize text-primary">{transaction.status.toLowerCase()}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">Payment:</span>
                            <span className="font-medium capitalize text-green-600">{transaction.paymentStatus.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{transaction.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.startDate ? new Date(transaction.startDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
