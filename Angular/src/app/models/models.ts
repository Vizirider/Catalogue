export interface UserDetails {
  id: number;
  name: string;
  email: string;
  password: string;
  is_active: boolean;
}

export interface TokenResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasword {
  email: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  site: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
  site: string;
}

export class User {
  id: number;
  name: string;
  email: string;
  password: string;
  defaultSite: string;
  token: string;
}

export interface CatalogueSearchParams {
  siteIds: string[];
  categoryIds: string[];
}

export class Catalogue {
  address: string;
  category_name: string;
  description: string;
  discount_rate: string;
  seller: string;
  site_name: string;
  token: string;
}

export const SITES = {
  "1": "Szeged",
  "2": "Pécs",
  "3": "Debrecen",
  "4": "Budapest",
  "5": "Telephelytől független"
};

export const CATEGORIES = {
  1: "Étel/Ital",
  2: "Autó-Motor",
  3: "Egészség",
  4: "Fotó",
  5: "Szabadidő",
  6: "Szállás, Utazás",
  7: "Egyéb",
  8: "Sport",
  9: "Informatika",
  10: "Könyv",
  11: "Ruha",
  12: "Szépségápolás",
  13: "Színház, Mozi",
  14: "Sportegyesület",
  15: "Magánoktatás",
  16: "Rendezvényszervezés"
};
