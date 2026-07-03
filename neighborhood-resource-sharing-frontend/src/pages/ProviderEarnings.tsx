import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, TrendingUp, DollarSign, Percent, Loader2 } from 'lucide-react';

interface EarningsSummary {
  totalEarnings: number;
  totalDeposits: number;
  platformFees: number;
  completedTransactions: number;
}

export default function ProviderEarnings() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    totalDeposits: 0,
    platformFees: 0,
    completedTransactions: 0,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const fetchEarnings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/requests/lender/${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data: Array<{
          paymentStatus: string;
          amount?: number;
          requestDate?: string;
        }> = await res.json();

        const now = new Date();
        const filtered = data.filter(r => {
          if (r.paymentStatus !== 'PAID') return false;
          if (timeFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return r.requestDate ? new Date(r.requestDate) >= weekAgo : true;
          }
          if (timeFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return r.requestDate ? new Date(r.requestDate) >= monthAgo : true;
          }
          return true;
        });

        const totalDeposits = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);
        const platformFees = totalDeposits * 0.10;
        const totalEarnings = totalDeposits - platformFees;

        setSummary({
          totalEarnings,
          totalDeposits,
          platformFees,
          completedTransactions: filtered.length,
        });
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [currentUser, navigate, timeFilter]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Earnings</h1>
            <p className="text-muted-foreground">Track your revenue and earnings breakdown</p>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Your Earnings</p>
                      <p className="text-3xl font-bold">₹{summary.totalEarnings.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Deposits</p>
                      <p className="text-3xl font-bold">₹{summary.totalDeposits.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-10 w-10 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Platform Fees</p>
                      <p className="text-3xl font-bold">₹{summary.platformFees.toFixed(2)}</p>
                    </div>
                    <Percent className="h-10 w-10 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Completed Transactions</span>
                    <span className="font-semibold">{summary.completedTransactions}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total Deposits Collected</span>
                    <span className="font-semibold">₹{summary.totalDeposits.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="font-semibold text-red-500">-₹{summary.platformFees.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2 text-lg">
                    <span className="font-medium">Net Earnings</span>
                    <span className="font-bold text-green-600">₹{summary.totalEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate('/wallet')}>
                Go to Wallet
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
