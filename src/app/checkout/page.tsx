
'use client';

import { useCart } from '@/hooks/use-cart';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { db, auth, storage } from '@/lib/firebase';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { ref as dbRef, push, set } from 'firebase/database';
import { useAuth } from '@/hooks/use-auth';
import { verifyIdImages } from '@/ai/flows/verify-id-flow';
import { logAdminEvent } from '@/lib/logging';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload, Trash2 } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Full name is required' }),
  phone: z.string().min(7, { message: 'A valid phone number is required' }),
  address: z.string().min(10, { message: 'Delivery address is required' }),
  paymentMethod: z.enum(['wave', 'cod'], {
    required_error: 'You need to select a payment method.',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Redirect to products page if cart is empty after initial load
    if (!authLoading && cartCount === 0) {
      router.replace('/products');
    }
  }, [authLoading, cartCount, router]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'front') {
        setIdFrontFile(file);
        setIdFrontPreview(previewUrl);
      } else {
        setIdBackFile(file);
        setIdBackPreview(previewUrl);
      }
    }
  };
  
  const handleRemoveImage = (type: 'front' | 'back') => {
    if (type === 'front') {
      if (idFrontPreview) URL.revokeObjectURL(idFrontPreview);
      setIdFrontFile(null);
      setIdFrontPreview(null);
      if(idFrontRef.current) idFrontRef.current.value = "";
    } else {
      if (idBackPreview) URL.revokeObjectURL(idBackPreview);
      setIdBackFile(null);
      setIdBackPreview(null);
      if(idBackRef.current) idBackRef.current.value = "";
    }
  };


  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!idFrontFile || !idBackFile) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please upload both the front and back of your ID.",
        });
        return;
    }
    
    setIsVerifying(true);
    toast({ title: "Verifying ID...", description: "Our AI is checking your ID images for clarity. This may take a moment." });

    try {
        const idFrontDataUri = await fileToDataUri(idFrontFile);
        const idBackDataUri = await fileToDataUri(idBackFile);
        
        const verification = await verifyIdImages({ idFrontDataUri, idBackDataUri });

        if (!verification.isIdCard || !verification.isClear) {
            await logAdminEvent('ID_VERIFICATION_FAILED', `ID verification failed for user attempt. Reason: ${verification.reason}`, { name: data.name, phone: data.phone });
            toast({
                variant: "destructive",
                title: "ID Verification Failed",
                description: verification.reason || "Please upload clearer images of your ID.",
            });
            setIsVerifying(false);
            return;
        }

        toast({ title: "ID Verified!", description: "Thank you. Proceeding to place your order." });
        setIsVerifying(false);

    } catch (error) {
        console.error("AI verification failed", error);
        await logAdminEvent('ID_VERIFICATION_FAILED', 'The AI verification service encountered an unexpected error.', { name: data.name, phone: data.phone });
        toast({
            variant: "destructive",
            title: "Verification Error",
            description: "We couldn't verify your ID at this time. Please try again.",
        });
        setIsVerifying(false);
        return;
    }


    setIsSubmitting(true);
    try {
      let currentUser = user;
      if (!currentUser) {
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user;
      }
      
      const userId = currentUser.uid;
      const orderNumber = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Upload ID images
      const frontImageRef = storageRef(storage, `id_cards/${userId}/${orderNumber}/front.jpg`);
      const backImageRef = storageRef(storage, `id_cards/${userId}/${orderNumber}/back.jpg`);

      const [frontUploadResult, backUploadResult] = await Promise.all([
        uploadString(frontImageRef, idFrontPreview!, 'data_url'),
        uploadString(backImageRef, idBackPreview!, 'data_url')
      ]);

      const [idFrontUrl, idBackUrl] = await Promise.all([
        getDownloadURL(frontUploadResult.ref),
        getDownloadURL(backUploadResult.ref)
      ]);


      const orderData = {
        orderNumber: orderNumber,
        customer: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          userId: userId,
          idFrontUrl,
          idBackUrl,
        },
        items: cartItems,
        total: cartTotal,
        paymentMethod: data.paymentMethod,
        orderStatus: 'Pending' as const,
        paymentStatus: 'Unpaid' as const,
        createdAt: Date.now(),
      };
      
      const newOrderRef = push(ref(db, `orders/${userId}`));
      await set(newOrderRef, orderData);

      await logAdminEvent('NEW_ORDER', `New order #${orderData.orderNumber} placed by ${data.name}.`, { orderId: newOrderRef.key, customerName: data.name, total: orderData.total });

      toast({
        title: 'Order Placed!',
        description: `Your order #${orderNumber} has been received. Thank you!`,
      });

      clearCart();
      router.push('/');
    } catch (error) {
        console.error("Failed to place order:", error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: "There was an issue placing your order. Please try again.",
        });
        setIsSubmitting(false);
    }
  };
  
  const isLoading = isSubmitting || isVerifying || authLoading;

  if (authLoading || (!isSubmitting && cartCount === 0)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const IDUploader = ({ id, label, description, preview, inputRef, onChange, onRemove }: any) => (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div className="relative group w-full h-48 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
           onClick={() => !preview && inputRef.current?.click()}>
        {preview ? (
          <>
            <Image src={preview} alt="ID preview" fill className="object-contain rounded-lg p-2" />
            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="text-center p-4">
            <Upload className="mx-auto h-8 w-8" />
            <span className="text-sm mt-2 block font-medium">Click to upload</span>
          </div>
        )}
        <Input id={id} ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} disabled={!!preview || isLoading} />
      </div>
      <FormMessage />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lamin B. Touray" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 220-XXX-XXXX" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kairaba Avenue, Serekunda" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>ID Verification</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6">
                    <IDUploader 
                        id="front-id-upload"
                        label="Front of ID Card"
                        description="Upload a clear picture of the front of your ID."
                        preview={idFrontPreview}
                        inputRef={idFrontRef}
                        onChange={(e: any) => handleFileChange(e, 'front')}
                        onRemove={() => handleRemoveImage('front')}
                    />
                    <IDUploader 
                        id="back-id-upload"
                        label="Back of ID Card"
                        description="Upload a clear picture of the back of your ID."
                        preview={idBackPreview}
                        inputRef={idBackRef}
                        onChange={(e: any) => handleFileChange(e, 'back')}
                        onRemove={() => handleRemoveImage('back')}
                    />
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                       <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                          disabled={isLoading}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <RadioGroupItem value="wave" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Wave Money Transfer
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <RadioGroupItem value="cod" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Cash on Delivery
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="pt-4" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium leading-tight">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-right">GMD {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>GMD {cartTotal.toFixed(2)}</span>
                </div>
                <Separator />
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying ID...
                    </>
                  ) : isSubmitting ? (
                     <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
