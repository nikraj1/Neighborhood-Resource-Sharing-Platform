import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Electronics', 'Camera', 'Fitness', 'Tools', 'Furniture', 'Other'];

interface ListingDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  deposit: number;
  imageData?: string;
}

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<ListingDetails | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deposit: '',
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    if (!id) return;

    fetch(`${BACKEND_URL}/api/listings`)
      .then(res => res.json())
      .then((data: ListingDetails[]) => {
        const found = data.find(item => item.id === Number(id));
        if (!found) {
          toast.error('Listing not found');
          navigate('/my-listings');
          return;
        }
        setListing(found);
        setFormData({
          title: found.title,
          description: found.description ?? '',
          category: found.category,
          price: found.price.toString(),
          deposit: found.deposit.toString(),
        });
      })
      .catch(() => {
        toast.error('Failed to load listing');
        navigate('/my-listings');
      })
      .finally(() => setLoading(false));
  }, [id, currentUser, navigate]);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price || !formData.deposit) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('price', formData.price);
      payload.append('deposit', formData.deposit);
      payload.append('providerId', currentUser.id.toString());
      payload.append('condition', 'Good');
      payload.append('address', listing?.title ?? '');
      payload.append('city', 'Indore');
      payload.append('pincode', '452001');

      const response = await fetch(`${BACKEND_URL}/api/listings/${id}`, {
        method: 'PUT',
        body: payload,
      });

      if (response.ok) {
        toast.success('Listing updated successfully!');
        navigate('/my-listings');
      } else {
        const msg = await response.text();
        toast.error('Failed to update: ' + msg);
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setSaving(false);
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

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Item not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Daily Rate (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit">Security Deposit (₹) *</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    min="1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
