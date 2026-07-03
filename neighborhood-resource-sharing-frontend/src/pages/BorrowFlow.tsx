import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard } from 'lucide-react';

export default function BorrowFlow() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { items, currentUser, createTransaction, setCurrentUser, users } = useApp();
  
  const item = items.find(i => i.id === id);
  const { startDate, endDate, days } = location.state || {};

  if (!item || !startDate || !endDate || !currentUser) {
    navigate('/browse');
    return null;
  }

  const PLATFORM_FEE_PERCENT = 10;
  const PROVIDER_PERCENT = 15;

  const borrowingCost = item.dailyPrice * days;
  const platformFee = (borrowingCost * PLATFORM_FEE_PERCENT) / 100;
  const providerFee = (borrowingCost * PROVIDER_PERCENT) / 100;
  const totalDeposit = item.depositAmount + borrowingCost;
  const refundAfterReturn = totalDeposit - platformFee - providerFee;

  const handlePayment = () => {
    if (currentUser.walletBalance < totalDeposit) {
      toast.error('Insufficient balance! Please add funds to your wallet.');
      return;
    }

    // Create transaction
    const transactionId = `txn-${Date.now()}`;
    const qrBorrower = `neighborhood://borrower/${transactionId}`;
    const qrProvider = `neighborhood://provider/${transactionId}`;

    const transaction = {
      id: transactionId,
      itemId: item.id,
      borrowerId: currentUser.id,
      providerId: item.providerId,
      depositPaid: totalDeposit,
      platformFee,
      providerFee,
      refundAmount: refundAfterReturn,
      qrBorrower,
      qrProvider,
      status: 'pending' as const,
      startDate: new Date(startDate),
      dueDate: new Date(endDate),
    };

    createTransaction(transaction);

    // Deduct from wallet
    setCurrentUser({
      ...currentUser,
      walletBalance: currentUser.walletBalance - totalDeposit,
    });

    toast.success('Payment successful! Generating QR codes...');
    
    setTimeout(() => {
      navigate(`/transaction/${transactionId}/qr`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Complete Your Booking</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img src={item.imageUrl} alt={item.title} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(startDate), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{format(new Date(endDate), 'PPP')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground text-sm">Duration</p>
                <p className="font-medium">{days} days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borrowing Cost ({days} days × ${item.dailyPrice})</span>
                <span className="font-medium">${borrowingCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Security Deposit</span>
                <span className="font-medium">${item.depositAmount.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Deposit Amount</span>
                <span className="text-primary">${totalDeposit.toFixed(2)}</span>
              </div>
              
              <div className="bg-secondary/50 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium">Upon Return:</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                  <span>-${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Provider Earnings ({PROVIDER_PERCENT}%)</span>
                  <span>-${providerFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-foreground">
                  <span>Your Refund</span>
                  <span className="text-green-600">${refundAfterReturn.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Wallet Balance</p>
                    <p className="text-sm text-muted-foreground">
                      Available: ${currentUser.walletBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
                {currentUser.walletBalance < totalDeposit && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/wallet')}>
                    Add Funds
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handlePayment}
            disabled={currentUser.walletBalance < totalDeposit}
          >
            Pay ${totalDeposit.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
