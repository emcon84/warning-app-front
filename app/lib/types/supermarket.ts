export interface Supermarket {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  logo?: string;
  createdAt: string;
  offerCount?: number;
}

export interface Offer {
  id: string;
  supermarketId: string;
  description: string;
  price?: string;
  photo?: string;
  validUntil?: string;
  createdAt: string;
}
