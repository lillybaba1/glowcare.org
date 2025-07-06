import type { Product, Category } from './types';

export const categories: Category[] = [
  {
    id: 'cat1',
    name: 'Sunscreens',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'sunscreen bottle'
  },
  {
    id: 'cat2',
    name: 'Cleansers',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'cleanser bottle'
  },
  {
    id: 'cat3',
    name: 'Moisturizers',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'moisturizer jar'
  },
  {
    id: 'cat4',
    name: 'Serums',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'serum bottle'
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'CeraVe Foaming Cleanser',
    description: 'A gentle, foaming cleanser for normal to oily skin. Cleanses and removes oil without disrupting the protective skin barrier.',
    price: 850,
    imageUrl: 'https://placehold.co/400x400.png',
    category: 'Cleansers',
    featured: true,
  },
  {
    id: '2',
    name: 'Nivea Sun Protect & Moisture',
    description: 'SPF 50+ sun lotion that provides immediate protection against sun exposure and long-term UV-induced skin damage.',
    price: 950,
    imageUrl: 'https://placehold.co/400x400.png',
    category: 'Sunscreens',
    featured: true,
  },
  {
    id: '3',
    name: 'The Ordinary Hyaluronic Acid 2%',
    description: 'Combines low-, medium- and high-molecular-weight hyaluronic acid to support skin hydration to multiple layers of your skin.',
    price: 750,
    imageUrl: 'https://placehold.co/400x400.png',
    category: 'Serums',
    featured: true,
  },
  {
    id: '4',
    name: 'CeraVe Moisturising Cream',
    description: 'A rich, non-greasy, fast-absorbing moisturizing cream for normal to dry skin on the face and body.',
    price: 900,
    imageUrl: 'https://placehold.co/400x400.png',
    category: 'Moisturizers',
    featured: true,
  },
  {
    id: '5',
    name: 'Beauty of Joseon Sunscreen',
    description: 'A lightweight and creamy organic sunscreen that\'s comfortable on skin. It protects skin from harmful UV rays with its broad-spectrum SPF50+ PA++++.',
    price: 1200,
    imageUrl: 'https://placehold.co/400x400.png',
    category: 'Sunscreens',
  },
  {
    id: '6',
    name: 'Cetaphil Gentle Skin Cleanser',
    description: 'A creamy, non-foaming daily cleanser for all skin types, ideal for dry, sensitive skin.',
    price: 800,
    imageUrl: 'https://placehold.co/400x400.png',
    category: 'Cleansers',
  },
];
