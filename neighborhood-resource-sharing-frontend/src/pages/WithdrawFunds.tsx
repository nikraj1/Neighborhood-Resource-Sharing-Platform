import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Wallet, CheckCircle, History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WithdrawFunds() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    fetch(`${BACKEND_URL}/api/wallet/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        setBalance(data.balance || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!upiId.trim()) {
      toast.error('Please enter UPI ID or bank details');
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: withdrawAmount,
          upiId: upiId
        })
      });

      if (res.ok) {
        setShowSuccess(true);
        setAmount('');
        setUpiId('');
      } else {
        const errorText = await res.text();
        toast.error(errorText || 'Withdrawal failed. Please try again.');
      }
    } catch (e) {
      toast.error('Network error. Failed to process withdrawal.');
    } finally {
      setWithdrawing(false);
    }
  };

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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="text-center border-gray-150">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Withdrawal Initiated!</h2>
              <p className="text-muted-foreground mb-6">
                Your funds will be credited to your account within 2-3 business days.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowSuccess(false)}>
                  Make Another Withdrawal
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/withdrawal-history')}>
                  <History className="mr-2 h-4 w-4" />
                  View History
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/provider-dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Withdraw Funds</h1>

        <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground mb-6 shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-4xl font-bold">₹{balance.toFixed(2)}</p>
              </div>
              <Wallet className="h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-150">
          <CardHeader>
            <CardTitle>Withdrawal Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Withdraw</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  max={balance}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000].map(val => (
                  <Button
                    key={val}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(Math.min(val, balance).toString())}
                    disabled={balance < val}
                    className="flex-1"
                  >
                    ₹{val}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(balance.toString())}
                  className="flex-1"
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID / Bank Details</Label>
              <Input
                id="upi"
                placeholder="yourname@upi or Bank Account"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your UPI ID or bank account details for transfer
              </p>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" 
              onClick={handleWithdraw}
              disabled={withdrawing || !amount || !upiId || parseFloat(amount) <= 0}
            >
              {withdrawing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
              {withdrawing ? 'Processing...' : `Withdraw ₹${amount || '0.00'}`}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate('/withdrawal-history')} className="text-blue-600">
            <History className="mr-2 h-4 w-4" />
            View Withdrawal History
          </Button>
        </div>
      </div>
    </div>
  );
}
