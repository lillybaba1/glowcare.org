
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getWhatsappNumber } from '@/lib/data';
import { Phone } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// WhatsApp SVG Icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16.75 13.96c.25.13.41.2.46.3.05.1.03.48-.18.69a1.49 1.49 0 0 1-1.14.44c-.36 0-.8-.13-1.66-.54a7.25 7.25 0 0 1-2.97-2.66 7.47 7.47 0 0 1-1.4-2.99c-.1-.26-.2-.51-.2-.76a.53.53 0 0 1 .52-.52c.1 0 .22.01.32.02.13.01.24.01.35-.01a.69.69 0 0 1 .58.5c.29.93.94 1.83 1.03 1.95.09.12.1.2.04.35-.07.15-.17.25-.3.41-.12.16-.24.31-.36.46a.26.26 0 0 0-.08.23c.18.48.58.98 1.15 1.51a5.1 5.1 0 0 0 2.22 1.52.26.26 0 0 0 .3-.07c.1-.12.21-.24.31-.38s.19-.27.3-.27c.1 0 .22.04.34.13zm-5.4-11.23a9.73 9.73 0 0 0-7.85 16.48l-1.32 4.8 4.92-1.29a9.74 9.74 0 0 0 15.58-9.5A9.73 9.73 0 0 0 11.35 2.73z"></path>
  </svg>
);


export default function WhatsAppButton() {
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const message = "Hello GlowCare Gambia! I have a question.";

    useEffect(() => {
        const fetchNumber = async () => {
            const number = await getWhatsappNumber();
            setPhoneNumber(number);
        };
        fetchNumber();
    }, []);

    if (!phoneNumber) {
        return null;
    }
  
    return (
      <Popover>
        <PopoverTrigger asChild>
           <Button size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground" aria-label="Contact us">
            <Phone className="h-7 w-7"/>
           </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 mb-2" side="top" align="end">
            <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-start gap-3 px-4 py-2 h-auto">
                     <Link href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
                        <span className="font-semibold">WhatsApp</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-3 px-4 py-2 h-auto">
                    <Link href={`tel:${phoneNumber}`} className="flex items-center gap-2">
                        <Phone className="h-6 w-6 text-primary" />
                        <span className="font-semibold">Phone Call</span>
                    </Link>
                </Button>
            </div>
        </PopoverContent>
      </Popover>
    );
  }
  
