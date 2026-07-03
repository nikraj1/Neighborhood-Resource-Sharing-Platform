import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, History, CheckCircle, Loader2 } from 'lucide-react';

interface WalletTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  timestamp: string;
}

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [myWithdrawals, setMyWithdrawals] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    fetch(`${BACKEND_URL}/api/wallet/history/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter for debits representing withdrawals
          const filtered = data.filter((tx: WalletTransaction) => 
            tx.type === 'DEBIT' && tx.description.toLowerCase().includes('withdrawal')
          );
          setMyWithdrawals(filtered);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const totalWithdrawn = myWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <History className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Withdrawal History</h1>
            <p className="text-muted-foreground">Track all your withdrawal requests</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
          </div>
        ) : (
          <>
            <Card className="mb-6 border-gray-150">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                    <p className="text-3xl font-bold text-primary">₹{totalWithdrawn.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-semibold">{myWithdrawals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-150">
              <CardHeader>
                <CardTitle>All Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                {myWithdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground mb-4">No withdrawals yet</p>
                    <Button onClick={() => navigate('/withdraw')} className="bg-blue-600 hover:bg-blue-700">Make a Withdrawal</Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {myWithdrawals.map((withdrawal, index) => (
                      <div key={withdrawal.id}>
                        <div className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-50 rounded-full">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">₹{withdrawal.amount.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(withdrawal.timestamp).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                              Completed
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={withdrawal.description}>
                              {withdrawal.description}
                            </p>
                          </div>
                        </div>
                        {index < myWithdrawals.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
