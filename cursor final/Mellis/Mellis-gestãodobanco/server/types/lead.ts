export interface Lead {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  profession?: string | null;
  difficulty?: string | null;
  region?: string | null;
  status?: string | null;
  seller_id?: number | null;
  is_customer?: boolean;
  notes?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string | null;
  lgpd_consent: boolean;
  lgpd_consent_date?: Date | null;
  lgpd_consent_ip?: string | null;
  data_retention_date?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface LeadsFilters {
  search?: string;
  profession?: string;
  difficulty?: string;
  region?: string;
  utm_campaign?: string;
  seller_id?: string;
  is_customer?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface LeadsStats {
  total: number;
  byProfession: Record<string, number>;
  byDifficulty: Record<string, number>;
  byRegion: Record<string, number>;
  recentLeads: number;
  bySeller: Record<string, number>;
  byCustomerStatus: { customers: number; nonCustomers: number };
}

export interface Seller {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLeadData {
  name: string;
  email: string;
  whatsapp: string;
  profession?: string;
  difficulty?: string;
  region?: string;
  status?: string;
  seller_id?: number;
  is_customer?: boolean;
  notes?: string;
  lgpd_consent: boolean;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  whatsapp?: string;
  profession?: string;
  difficulty?: string;
  region?: string;
  status?: string;
  seller_id?: number;
  is_customer?: boolean;
  notes?: string;
}

