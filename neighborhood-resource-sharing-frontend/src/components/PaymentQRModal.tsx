import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ScanLine } from "lucide-react";

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentComplete: () => Promise<void>;
}

export function PaymentQRModal({ isOpen, onClose, amount, onPaymentComplete }: PaymentQRModalProps) {
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  const handleSimulateScan = async () => {
    // 1. Simulate Scanning (1.5 seconds)
    setStatus('SCANNING');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Simulate Bank Processing (1.5 seconds)
    setStatus('PROCESSING');
    await onPaymentComplete(); // Call the actual API
    
    // 3. Success!
    setStatus('SUCCESS');
    
    // 4. Close Modal after delay
    setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show unlocked details
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>Scan to Pay</DialogTitle>
          <DialogDescription>
            Scan this QR code with any UPI app to pay <span className="font-bold text-black">₹{amount}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-6">
            
            {/* Dynamic QR Display Area */}
            <div className="relative w-64 h-64 bg-white border-2 border-black rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
                
                {/* STATE: SUCCESS */}
                {status === 'SUCCESS' && (
                    <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center text-white animate-in fade-in">
                        <CheckCircle2 className="w-20 h-20 mb-2" />
                        <h3 className="text-xl font-bold">Payment Successful!</h3>
                    </div>
                )}

                {/* STATE: SCANNING/PROCESSING */}
                {(status === 'SCANNING' || status === 'PROCESSING') && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p className="font-semibold">{status === 'SCANNING' ? 'Verifying QR...' : 'Processing Payment...'}</p>
                    </div>
                )}

                {/* QR IMAGE (Placeholder from API) */}
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=neighborhood@upi&pn=Neighborhood+Resource+Sharing+Platform&am=${amount}`}
                    alt="Payment QR"
                    className={`w-full h-full object-cover p-2 ${status !== 'IDLE' ? 'blur-sm' : ''}`}
                />
                
                {/* SCANNER ANIMATION OVERLAY */}
                {status === 'IDLE' && (
                     <div className="absolute inset-0 border-t-4 border-blue-500/50 animate-[scan_2s_ease-in-out_infinite] top-0 opacity-50"></div>
                )}
            </div>

            {/* ACTION BUTTON */}
            {status === 'IDLE' && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg gap-2" onClick={handleSimulateScan}>
                    <ScanLine className="w-5 h-5" />
                    Simulate Scan & Pay
                </Button>
            )}
            
            {status !== 'IDLE' && status !== 'SUCCESS' && (
                <Button variant="outline" disabled className="w-full h-12">
                    Please wait...
                </Button>
            )}

        </div>
      </DialogContent>
    </Dialog>
  );
}