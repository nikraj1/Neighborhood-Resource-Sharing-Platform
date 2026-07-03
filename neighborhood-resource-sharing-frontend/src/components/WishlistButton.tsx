import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  itemId: number | string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

export function WishlistButton({ itemId, size = 'icon', variant = 'ghost', className }: WishlistButtonProps) {
  const { currentUser } = useApp();
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Load wishlist from local storage
  useEffect(() => {
    if (!currentUser) return;
    const saved = localStorage.getItem(`wishlist_${currentUser.id}`);
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  const numericId = Number(itemId);
  const isInWishlist = wishlist.includes(numericId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error('Please login to save items');
      return;
    }

    let updatedWishlist: number[];
    if (isInWishlist) {
      updatedWishlist = wishlist.filter(id => id !== numericId);
      toast.success('Removed from wishlist');
    } else {
      updatedWishlist = [...wishlist, numericId];
      toast.success('Added to wishlist');
    }

    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${currentUser.id}`, JSON.stringify(updatedWishlist));
    
    // Trigger custom event so Wishlist page can reload instantly if needed
    window.dispatchEvent(new Event('wishlist-update'));
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        'transition-all',
        isInWishlist && 'text-red-500 hover:text-red-600',
        className
      )}
    >
      <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} />
    </Button>
  );
}
