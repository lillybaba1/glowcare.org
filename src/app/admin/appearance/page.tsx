
'use client';

import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref as dbRef, get, update, set } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Category } from '@/lib/types';
import { getCategories, seedInitialCategories, updateCategoryImage } from '@/lib/data';

export default function AppearancePage() {
  // State for images
  const [foregroundImageUrl, setForegroundImageUrl] = useState<string>('');
  const [initialForegroundImageUrl, setInitialForegroundImageUrl] = useState<string>('');
  const [newForegroundImage, setNewForegroundImage] = useState<string | null>(null);

  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');
  const [initialBackgroundImageUrl, setInitialBackgroundImageUrl] = useState<string>('');
  const [newBackgroundImage, setNewBackgroundImage] = useState<string | null>(null);

  // State for background color
  const [heroBgColor, setHeroBgColor] = useState<string>('');
  const [initialHeroBgColor, setInitialHeroBgColor] = useState<string>('');

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Control state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const foregroundFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // Fetch hero settings
        const settingsRef = dbRef(db, 'settings');
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          const settings = snapshot.val();
          const currentFgUrl = settings.heroImageUrl || '';
          const currentBgUrl = settings.heroBackgroundImageUrl || '';
          const currentBgColor = settings.heroBackgroundColor || '#E0FFFF';

          setForegroundImageUrl(currentFgUrl);
          setInitialForegroundImageUrl(currentFgUrl);
          setBackgroundImageUrl(currentBgUrl);
          setInitialBackgroundImageUrl(currentBgUrl);
          setHeroBgColor(currentBgColor);
          setInitialHeroBgColor(currentBgColor);
        }

        // Fetch category settings
        await seedInitialCategories();
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

      } catch (error) {
        console.error("Failed to fetch settings", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch current settings." });
      } finally {
        setIsLoading(false);
        setIsCategoriesLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'foreground' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        imageType === 'foreground' ? setNewForegroundImage(result) : setNewBackgroundImage(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCategoryFileChange = async (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const result = reader.result as string;
          try {
              // Upload to storage
              const imageRef = storageRef(storage, `categories/${categoryId}-${Date.now()}`);
              const uploadResult = await uploadString(imageRef, result, 'data_url');
              const newDownloadURL = await getDownloadURL(uploadResult.ref);
              
              // Delete old image if it exists and is a firebase storage URL
              const oldCategory = categories.find(c => c.id === categoryId);
              if (oldCategory?.imageUrl && oldCategory.imageUrl.includes('firebasestorage.googleapis.com')) {
                  const oldImageRef = storageRef(storage, oldCategory.imageUrl);
                  await deleteObject(oldImageRef).catch(err => console.warn("Old image delete failed", err));
              }
              
              // Update DB with new URL
              await updateCategoryImage(categoryId, newDownloadURL);
              
              // Update local state to show new image immediately
              setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, imageUrl: newDownloadURL } : cat));
              
              toast({ title: "Success!", description: "Category image updated." });
          } catch (error) {
              console.error("Failed to update category image", error);
              toast({ variant: "destructive", title: "Update Failed", description: "Could not update category image." });
          } finally {
              setIsSaving(false);
          }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async (imageType: 'foreground' | 'background') => {
    setIsSaving(true);
    try {
      const updates: { [key: string]: any } = {};
      const urlToRemove = imageType === 'foreground' ? foregroundImageUrl : backgroundImageUrl;
      const dbKey = imageType === 'foreground' ? 'heroImageUrl' : 'heroBackgroundImageUrl';

      if (urlToRemove && urlToRemove.includes('firebasestorage.googleapis.com')) {
        const imageRef = storageRef(storage, urlToRemove);
        await deleteObject(imageRef).catch(err => console.warn("Could not delete old image, it may already be gone.", err));
      }

      updates[dbKey] = '';
      await update(dbRef(db, 'settings'), updates);

      if (imageType === 'foreground') {
        setForegroundImageUrl('');
        setInitialForegroundImageUrl('');
        setNewForegroundImage(null);
        if (foregroundFileInputRef.current) foregroundFileInputRef.current.value = "";
      } else {
        setBackgroundImageUrl('');
        setInitialBackgroundImageUrl('');
        setNewBackgroundImage(null);
        if (backgroundFileInputRef.current) backgroundFileInputRef.current.value = "";
      }

      toast({ title: "Image Removed", description: `The ${imageType} image has been removed.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Could not remove the ${imageType} image.` });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = newForegroundImage || newBackgroundImage || (heroBgColor !== initialHeroBgColor);

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const updates: { [key: string]: any } = {};

      if (newForegroundImage) {
        const imageRef = storageRef(storage, `settings/hero-foreground-${Date.now()}`);
        const uploadResult = await uploadString(imageRef, newForegroundImage, 'data_url');
        const newDownloadURL = await getDownloadURL(uploadResult.ref);
        updates.heroImageUrl = newDownloadURL;
        setForegroundImageUrl(newDownloadURL);
        setInitialForegroundImageUrl(newDownloadURL);
        setNewForegroundImage(null);
      }

      if (newBackgroundImage) {
        const imageRef = storageRef(storage, `settings/hero-background-${Date.now()}`);
        const uploadResult = await uploadString(imageRef, newBackgroundImage, 'data_url');
        const newDownloadURL = await getDownloadURL(uploadResult.ref);
        updates.heroBackgroundImageUrl = newDownloadURL;
        setBackgroundImageUrl(newDownloadURL);
        setInitialBackgroundImageUrl(newDownloadURL);
        setNewBackgroundImage(null);
      }

      if (heroBgColor !== initialHeroBgColor) {
        updates.heroBackgroundColor = heroBgColor;
        setInitialHeroBgColor(heroBgColor);
      }

      if (Object.keys(updates).length > 0) {
        await update(dbRef(db, 'settings'), updates);
      }
      
      if (foregroundFileInputRef.current) foregroundFileInputRef.current.value = "";
      if (backgroundFileInputRef.current) backgroundFileInputRef.current.value = "";

      toast({ title: "Success!", description: "Appearance settings have been updated." });
    } catch (error) {
      console.error("Failed to save settings", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not update settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const displayForegroundImage = newForegroundImage || foregroundImageUrl;
  const displayBackgroundImage = newBackgroundImage || backgroundImageUrl;

  const Uploader = ({ id, label, description, displayImage, fileInputRef, onFileChange, onRemove, onTriggerClick }: any) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative group aspect-video w-full rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
             onClick={onTriggerClick}>
          {displayImage ? (
            <Image src={displayImage} alt="Image preview" fill className="object-cover rounded-lg" />
          ) : (
            <div className="text-center p-4">
              <Upload className="mx-auto h-12 w-12" />
              <span className="text-lg mt-2 block font-medium">Click to upload an image</span>
            </div>
          )}
          <Input id={id} ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
      </div>
      {displayImage && (
        <Button variant="outline" size="sm" onClick={onRemove} disabled={isSaving} className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Remove Image
        </Button>
      )}
    </div>
  );

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <h1 className="text-xl font-semibold tracking-tight">Appearance</h1>
      <Card>
        <CardHeader>
          <CardTitle>Homepage Customization</CardTitle>
          <CardDescription>Customize the look and feel of your store's homepage hero section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <>
              <Uploader
                id="foreground-image-upload"
                label="Foreground Image"
                description="This image appears on the right side of the hero section. Recommended size: 800x800 pixels."
                displayImage={displayForegroundImage}
                fileInputRef={foregroundFileInputRef}
                onFileChange={(e: any) => handleFileChange(e, 'foreground')}
                onRemove={() => handleRemoveImage('foreground')}
                onTriggerClick={() => foregroundFileInputRef.current?.click()}
              />
              <Separator />
              <Uploader
                id="background-image-upload"
                label="Background Image (Optional)"
                description="This image will be the full background of the hero section. Recommended size: 1200x600 pixels."
                displayImage={displayBackgroundImage}
                fileInputRef={backgroundFileInputRef}
                onFileChange={(e: any) => handleFileChange(e, 'background')}
                onRemove={() => handleRemoveImage('background')}
                onTriggerClick={() => backgroundFileInputRef.current?.click()}
              />
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-bg-color">Background Color</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose a background color. This will be used if no background image is set.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input id="hero-bg-color" type="color" value={heroBgColor} onChange={(e) => setHeroBgColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
                  <Input type="text" value={heroBgColor} onChange={(e) => setHeroBgColor(e.target.value)} className="max-w-[150px]" placeholder="#E0FFFF" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Category Customization</CardTitle>
          <CardDescription>Customize the images for your product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {isCategoriesLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <Label className="text-lg font-medium">{category.name}</Label>
                  <div className="relative group aspect-video w-full rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => categoryFileInputRefs.current[category.id]?.click()}>
                    {isSaving ? (
                         <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <Image src={category.imageUrl} alt={category.name} fill className="object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Upload className="h-10 w-10 text-white" />
                        </div>
                      </>
                    )}
                      <Input
                          id={`category-upload-${category.id}`}
                          ref={el => (categoryFileInputRefs.current[category.id] = el)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleCategoryFileChange(e, category.id)}
                          disabled={isSaving}
                      />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
