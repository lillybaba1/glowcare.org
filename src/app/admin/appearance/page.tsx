
'use client';

import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref as dbRef, get, update } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';


export default function AppearancePage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [heroBgColor, setHeroBgColor] = useState<string>('');
  const [initialHeroImageUrl, setInitialHeroImageUrl] = useState<string>('');
  const [initialHeroBgColor, setInitialHeroBgColor] = useState<string>('');
  
  const [newHeroImage, setNewHeroImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = dbRef(db, 'settings');
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          const settings = snapshot.val();
          const currentImageUrl = settings.heroImageUrl || '';
          const currentBgColor = settings.heroBackgroundColor || '#A4A6F8'; // Default similar to theme

          setHeroImageUrl(currentImageUrl);
          setInitialHeroImageUrl(currentImageUrl);
          setHeroBgColor(currentBgColor);
          setInitialHeroBgColor(currentBgColor);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch current settings.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewHeroImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasChanges = newHeroImage || (heroBgColor !== initialHeroBgColor);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const updates: { [key: string]: any } = {};
      let newDownloadURL = heroImageUrl;

      if (newHeroImage) {
        const imageRef = storageRef(storage, `settings/hero-image-${Date.now()}`);
        const uploadResult = await uploadString(imageRef, newHeroImage, 'data_url');
        newDownloadURL = await getDownloadURL(uploadResult.ref);
        updates.heroImageUrl = newDownloadURL;
      }
      
      if (heroBgColor !== initialHeroBgColor) {
        updates.heroBackgroundColor = heroBgColor;
      }

      if (Object.keys(updates).length > 0) {
        await update(dbRef(db, 'settings'), updates);
      }

      // Update initial state to reflect saved changes
      if (newHeroImage) {
          setHeroImageUrl(newDownloadURL);
          setInitialHeroImageUrl(newDownloadURL);
          setNewHeroImage(null);
          if(fileInputRef.current) fileInputRef.current.value = "";
      }
      if (heroBgColor !== initialHeroBgColor) {
          setInitialHeroBgColor(heroBgColor);
      }

      toast({
        title: "Success!",
        description: "Appearance settings have been updated.",
      });
    } catch (error) {
      console.error("Failed to save settings", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not update the appearance settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const displayImage = newHeroImage || heroImageUrl;

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
       <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Appearance
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Homepage Customization</CardTitle>
          <CardDescription>
            Customize the look and feel of your store's homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="hero-image-upload">Homepage Hero Image</Label>
                <p className="text-sm text-muted-foreground">
                    Upload a new image to replace the one on your homepage. Recommended size: 1200x600 pixels.
                </p>
            </div>
            <div className="w-full max-w-2xl mx-auto">
                {isLoading ? (
                    <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div 
                        className="relative aspect-video w-full rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {displayImage ? (
                            <Image src={displayImage} alt="Hero image preview" fill className="object-cover rounded-lg" />
                        ) : (
                            <div className="text-center p-4">
                                <Upload className="mx-auto h-12 w-12"/>
                                <span className="text-lg mt-2 block font-medium">Click to upload an image</span>
                            </div>
                        )}
                        <Input
                            id="hero-image-upload"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="hero-bg-color">Hero Background Color</Label>
                <p className="text-sm text-muted-foreground">
                    Choose a background color for the homepage hero section.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Input
                    id="hero-bg-color"
                    type="color"
                    value={heroBgColor}
                    onChange={(e) => setHeroBgColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                    type="text"
                    value={heroBgColor}
                    onChange={(e) => setHeroBgColor(e.target.value)}
                    className="max-w-[150px]"
                    placeholder="#A4A6F8"
                />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
