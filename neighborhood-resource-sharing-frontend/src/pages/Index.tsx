import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { ArrowRight, Shield, QrCode, Wallet, Star } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-extrabold text-primary tracking-tight">
            Neighborhood Resource Sharing Platform
          </div>
          <div className="flex gap-3">
            {currentUser ? (
              <>
                <Button variant="outline" onClick={() => navigate('/browse')}>
                  Browse Items
                </Button>
                <Button onClick={() => navigate('/my-listings')}>
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Share, Borrow, Build Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Borrow items from neighbors with secure deposits. Return on time, get refunded. Simple, safe, local.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => navigate('/browse')}>
              Browse Items <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-8 pb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Deposits</h3>
              <p className="text-sm text-muted-foreground">
                Protected transactions with refundable security deposits for peace of mind
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-8 pb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">QR Verification</h3>
              <p className="text-sm text-muted-foreground">
                Scan QR codes at handover and return for verified, trackable exchanges
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-8 pb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fair Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Transparent fees, automatic refunds, and fair compensation for providers
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Browse & Select</h4>
                    <p className="text-sm text-muted-foreground">Find items you need from trusted neighbors</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Pay Deposit</h4>
                    <p className="text-sm text-muted-foreground">Secure payment with refundable deposit</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">QR Handover</h4>
                    <p className="text-sm text-muted-foreground">Scan QR codes to confirm item exchange</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Return & Refund</h4>
                    <p className="text-sm text-muted-foreground">Get most of your deposit back after return</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400" 
                alt="Community sharing" 
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>© 2025 Neighborhood Resource Sharing Platform. Building community through sharing.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
