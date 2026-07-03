import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// ✅ Added Wallet Icon
import { LogOut, User, PlusCircle, Package, Bell, CreditCard, ShoppingBag, Wallet, Heart, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

export function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/auth');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* 1. Logo */}
        <Link to="/browse" className="flex items-center space-x-2">
          <span className="text-xl font-extrabold text-primary tracking-tight">
            Neighborhood Resource Sharing Platform
          </span>
        </Link>

        {/* 2. Right Side Actions */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              {/* "List Item" Button */}
              <Button
                onClick={() => navigate('/list-item')}
                variant="outline"
                className="hidden sm:flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                List Item
              </Button>

              {/* User Dropdown Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.fullName}`} />
                      <AvatarFallback>{currentUser.fullName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* --- RENTER MENU (Borrowing) --- */}
                  <DropdownMenuItem onClick={() => navigate('/my-borrows')}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>My Requests</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/my-payments')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>My Payments</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/wallet')}>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>My Wallet</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>My Wishlist</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* --- LISTER MENU (Lending) --- */}
                  <DropdownMenuItem onClick={() => navigate('/provider-dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Lender Dashboard</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/my-listings')}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Listings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/requests')}>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Rental Requests</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* LOGOUT BUTTON */}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button onClick={() => navigate('/auth')} variant="default">
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}