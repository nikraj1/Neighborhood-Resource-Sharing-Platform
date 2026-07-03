import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QRCodePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${BACKEND_URL}/api/requests/${id}`)
      .then(res => res.json())
      .then(data => {
        setRequest(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load transaction');
        navigate('/browse');
      });
  }, [id, navigate]);

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

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

  if (!request) {
    navigate('/browse');
    return null;
  }

  const isBorrower = request.userId === currentUser.id;
  const isProvider = request.lenderId === currentUser.id;
  const qrCode = request.handoverToken || 'N/A';
  const role = isBorrower ? 'Borrower' : 'Lender';

  const handleDownload = () => {
    toast.success('QR Code downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="text-center">
            <Badge className="mb-4" variant={request.status === 'PENDING' ? 'secondary' : 'default'}>
              {request.status}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Your Handover QR Code</h1>
            <p className="text-muted-foreground">Role: <span className="font-semibold text-foreground">{role}</span></p>
          </div>

          <Card className="border border-gray-150 shadow-sm">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-blue-50 border border-blue-150 rounded-lg flex items-center justify-center font-bold text-blue-700">
                  NS
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{request.itemTitle}</h3>
                  <p className="text-sm text-muted-foreground">Request ID: #{request.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-150 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <QRCodeSVG 
                    value={qrCode} 
                    size={240}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="font-medium text-gray-700">Handover Secure Token</p>
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded border border-gray-200">
                    {qrCode}
                  </p>
                </div>

                <Button variant="outline" className="w-full" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Check className="h-5 w-5" />
                  Next Steps
                </h3>
                
                {isBorrower ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>1. <strong>Meet the lender</strong> at the agreed location</p>
                    <p>2. <strong>Show this QR code</strong> to the lender for scanning</p>
                    <p>3. Once scanned and verified by the lender, the rental starts!</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>1. <strong>Meet the borrower</strong> at the agreed location</p>
                    <p>2. <strong>Scan borrower's QR code</strong> using the scanner on your device</p>
                    <p>3. Hand over the item once verification is complete</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {!isBorrower && (
              <Button variant="outline" className="flex-1" onClick={() => navigate('/scan')}>
                Scan QR Code
              </Button>
            )}
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/transaction/${request.id}`)}>
              View Transaction Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
