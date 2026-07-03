import { BACKEND_URL } from '@/config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Camera, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanQR() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (code: string) => {
    if (!code.trim()) {
      toast.error('Please enter a code');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/handover/verify-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Verification Successful!');
        
        if (data.requestId) {
          navigate(`/transaction/${data.requestId}`);
        } else {
          navigate('/requests');
        }
      } else {
        const text = await res.text();
        toast.error(text || 'Invalid or expired QR token');
      }
    } catch (e) {
      toast.error('Server connection error');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualVerify = () => {
    handleVerify(manualCode);
  };

  const handleScanClick = () => {
    setScanning(true);
    toast.info('Opening camera scanning simulator...');
    
    // Simulate scan after 2 seconds with a demo token
    setTimeout(() => {
      setScanning(false);
      toast.info('Simulated successful scan! Submitting code.');
      // Find a token from local storage or ask user to copy paste
      if (manualCode) {
        handleVerify(manualCode);
      } else {
        toast.info('Please enter the token manually in the input box for simulation');
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Scan QR Code</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Camera Scan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {scanning ? (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <p>Scanning...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera preview</p>
                  </div>
                )}
              </div>

              <Button className="w-full" size="lg" onClick={handleScanClick} disabled={scanning}>
                <Camera className="mr-2 h-4 w-4" />
                {scanning ? 'Scanning...' : 'Start Camera Scan'}
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manual Code Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the QR code manually if scanning doesn't work
              </p>
              
              <Input 
                placeholder="neighborhood://borrower/txn-xxx or neighborhood://provider/txn-xxx"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />

              <Button className="w-full" onClick={handleManualVerify}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Code
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">How to use:</p>
                <p>• <strong>Handover</strong>: Both parties scan each other's QR codes to activate the transaction</p>
                <p>• <strong>Return</strong>: Provider scans borrower's code again to mark item as returned</p>
                <p>• Both QR codes must be verified for security</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
