
'use client';

import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref as dbRef, get, update } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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

  // Control state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const foregroundFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
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
      } catch (error) {
        console.error("Failed to fetch settings", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch current settings." });
      } finally {
        setIsLoading(false);
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
    </div>
  );
}
