
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getWhatsappNumber } from '@/lib/data';

// WhatsApp SVG Icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    <path d="M14.05 16.95A10 10 0 0 0 14 6.94M14.05 12.95A5 5 0 0 0 14 9.94"></path>
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
        return null; // Don't render the button if no number is set in the admin panel
    }
  
    return (
      <Button asChild size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-[#25D366] hover:bg-[#128C7E] text-white">
        <Link href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp">
            <WhatsAppIcon className="h-7 w-7"/>
        </Link>
      </Button>
    );
  }
  
