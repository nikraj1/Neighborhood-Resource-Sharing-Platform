import { BACKEND_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Loader2, Upload, MapPin } from 'lucide-react';

export default function ListItem() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  
  const [loading, setLoading] = useState(false);
  
  // ✅ FIX 1: Store the actual File object, not a Base64 string
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Location State
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState("Detecting location...");

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deposit: '',
    category: '',
  });

  // 1. Detect Location on Load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus("Location Detected ✅");
        },
        (error) => {
          console.error(error);
          setLocationStatus("Location Access Denied ❌ (Item won't appear in Nearby)");
          toast.warning("Please enable location to make your item visible nearby.");
        }
      );
    } else {
      setLocationStatus("Geolocation not supported");
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Save the raw file for the backend
      setSelectedFile(file);
      
      // Keep the preview for the frontend UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!location) {
        toast.error("Location is required to list an item.");
        return;
    }
    if (!selectedFile) {
        toast.error("Please upload an image.");
        return;
    }

    setLoading(true);

    // ✅ FIX 2: Create a native FormData object instead of JSON
    const payload = new FormData();
    payload.append('image', selectedFile); 
    payload.append('providerId', currentUser.id.toString());
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('category', formData.category);
    payload.append('price', formData.price);
    payload.append('deposit', formData.deposit);
    
    // Satisfying required backend @RequestParams until added to UI
    payload.append('condition', 'Good'); 
    payload.append('address', 'Lat: ' + location.lat + ', Lng: ' + location.lng); 
    payload.append('city', 'Indore'); 
    payload.append('pincode', '452001'); 

    try {
      // ✅ FIX 3: Remove the 'Content-Type' header completely!
      const response = await fetch(`${BACKEND_URL}/api/listings/add`, {
        method: 'POST',
        body: payload
      });

      if (response.ok) {
        toast.success("Item listed successfully!");
        navigate('/browse'); // Go to Home Page to see it
      } else {
        const errorText = await response.text();
        toast.error("Failed to list item: " + errorText);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">List a New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title */}
              <div className="space-y-2">
                <Label>Item Title</Label>
                <Input 
                  required 
                  placeholder="e.g., Canon DSLR Camera" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Camera">Camera & Gear</SelectItem>
                    <SelectItem value="Tools">Tools & Machinery</SelectItem>
                    <SelectItem value="Fitness">Fitness Equipment</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price & Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Rent (₹)</Label>
                  <Input 
                    type="number" 
                    required 
                    placeholder="500" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit (₹)</Label>
                  <Input 
                    type="number" 
                    required 
                    placeholder="2000" 
                    value={formData.deposit}
                    onChange={e => setFormData({...formData, deposit: e.target.value})}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the condition, features, etc." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="text-gray-400" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Upload a clear picture.</p>
                    <p>JPG/PNG only.</p>
                  </div>
                </div>
              </div>

              {/* Location Status */}
              <div className="bg-blue-50 p-3 rounded-md flex items-center gap-2 text-sm text-blue-800">
                <MapPin className="w-4 h-4" />
                <span>{locationStatus}</span>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !location}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "List Item Now"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}