import { query } from '../db.js';
import type { Lead, LeadsFilters, LeadsStats, CreateLeadData, UpdateLeadData } from '../types/lead.js';

export class LeadService {
  async getAllLeads(filters: LeadsFilters) {
    const {
      search,
      profession,
      difficulty,
      region,
      utm_campaign,
      seller_id,
      is_customer,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = filters;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(
        name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        whatsapp ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (profession) {
      conditions.push(`profession = $${paramCount}`);
      params.push(profession);
      paramCount++;
    }

    if (difficulty) {
      conditions.push(`difficulty = $${paramCount}`);
      params.push(difficulty);
      paramCount++;
    }

    if (region) {
      conditions.push(`region = $${paramCount}`);
      params.push(region);
      paramCount++;
    }

    if (utm_campaign) {
      conditions.push(`utm_campaign = $${paramCount}`);
      params.push(utm_campaign);
      paramCount++;
    }

    if (seller_id) {
      conditions.push(`seller_id = $${paramCount}`);
      params.push(parseInt(seller_id, 10));
      paramCount++;
    }

    if (is_customer) {
      conditions.push(`is_customer = $${paramCount}`);
      params.push(is_customer === 'true');
      paramCount++;
    }

    if (status) {
      conditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (dateFrom) {
      conditions.push(`created_at >= $${paramCount}`);
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      conditions.push(`created_at <= $${paramCount}`);
      params.push(dateTo);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const countQuery = `SELECT COUNT(*) as total FROM leads ${whereClause}`;
    const { rows: countRows } = await query<{ total: string }>(countQuery, params);
    const total = parseInt(countRows[0].total, 10);

    const offset = (page - 1) * limit;
    params.push(limit, offset);
    
    const dataQuery = `
      SELECT * FROM leads 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const { rows } = await query<Lead>(dataQuery, params);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLeadById(id: number) {
    const { rows } = await query<Lead>(
      'SELECT * FROM leads WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async getStats(): Promise<LeadsStats> {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM leads';
      const { rows: totalRows } = await query<{ total: string }>(totalQuery);
      const total = parseInt(totalRows[0].total, 10);

      const professionQuery = `
        SELECT profession, COUNT(*) as count 
        FROM leads 
        WHERE profession IS NOT NULL 
        GROUP BY profession
      `;
      const { rows: professionRows } = await query<{ profession: string; count: string }>(professionQuery);
      const byProfession = professionRows.reduce((acc, row) => {
        acc[row.profession] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<string, number>);

      const difficultyQuery = `
        SELECT difficulty, COUNT(*) as count 
        FROM leads 
        WHERE difficulty IS NOT NULL 
        GROUP BY difficulty
      `;
      const { rows: difficultyRows } = await query<{ difficulty: string; count: string }>(difficultyQuery);
      const byDifficulty = difficultyRows.reduce((acc, row) => {
        acc[row.difficulty] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<string, number>);

      const regionQuery = `
        SELECT region, COUNT(*) as count 
        FROM leads 
        WHERE region IS NOT NULL 
        GROUP BY region
      `;
      const { rows: regionRows } = await query<{ region: string; count: string }>(regionQuery);
      const byRegion = regionRows.reduce((acc, row) => {
        acc[row.region] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<string, number>);

      const recentQuery = `
        SELECT COUNT(*) as count 
        FROM leads 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `;
      const { rows: recentRows } = await query<{ count: string }>(recentQuery);
      const recentLeads = parseInt(recentRows[0].count, 10);

      // Stats by seller - with error handling
      let bySeller: Record<string, number> = {};
      try {
        const sellerQuery = `
          SELECT s.name, COUNT(l.id) as count 
          FROM sellers s
          LEFT JOIN leads l ON l.seller_id = s.id
          WHERE s.active = true
          GROUP BY s.name
        `;
        const { rows: sellerRows } = await query<{ name: string; count: string }>(sellerQuery);
        bySeller = sellerRows.reduce((acc, row) => {
          acc[row.name] = parseInt(row.count, 10);
          return acc;
        }, {} as Record<string, number>);
      } catch (error) {
        console.warn('Sellers table not found or error fetching seller stats:', error);
        // Return empty object if sellers table doesn't exist yet
        bySeller = {};
      }

      // Stats by customer status - with error handling
      let byCustomerStatus = { customers: 0, nonCustomers: 0 };
      try {
        const customerQuery = `
          SELECT 
            COUNT(CASE WHEN is_customer = true THEN 1 END) as customers,
            COUNT(CASE WHEN is_customer = false OR is_customer IS NULL THEN 1 END) as non_customers
          FROM leads
        `;
        const { rows: customerRows } = await query<{ customers: string; non_customers: string }>(customerQuery);
        byCustomerStatus = {
          customers: parseInt(customerRows[0].customers || '0', 10),
          nonCustomers: parseInt(customerRows[0].non_customers || '0', 10),
        };
      } catch (error) {
        console.warn('Error fetching customer status stats:', error);
        // Return default values if column doesn't exist yet
        byCustomerStatus = { customers: 0, nonCustomers: total };
      }

      return {
        total,
        byProfession,
        byDifficulty,
        byRegion,
        recentLeads,
        bySeller,
        byCustomerStatus,
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      // Return minimal stats if there's any error
      return {
        total: 0,
        byProfession: {},
        byDifficulty: {},
        byRegion: {},
        recentLeads: 0,
        bySeller: {},
        byCustomerStatus: { customers: 0, nonCustomers: 0 },
      };
    }
  }

  async exportToCsv(filters?: LeadsFilters): Promise<string> {
    let sqlQuery = 'SELECT * FROM leads';
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters) {
      const { search, profession, difficulty, region, utm_campaign, seller_id, is_customer, status, dateFrom, dateTo } = filters;

      if (search) {
        conditions.push(`(
          name ILIKE $${paramCount} OR 
          email ILIKE $${paramCount} OR 
          whatsapp ILIKE $${paramCount}
        )`);
        params.push(`%${search}%`);
        paramCount++;
      }

      if (profession) {
        conditions.push(`profession = $${paramCount}`);
        params.push(profession);
        paramCount++;
      }

      if (difficulty) {
        conditions.push(`difficulty = $${paramCount}`);
        params.push(difficulty);
        paramCount++;
      }

      if (region) {
        conditions.push(`region = $${paramCount}`);
        params.push(region);
        paramCount++;
      }

      if (utm_campaign) {
        conditions.push(`utm_campaign = $${paramCount}`);
        params.push(utm_campaign);
        paramCount++;
      }

      if (seller_id) {
        conditions.push(`seller_id = $${paramCount}`);
        params.push(parseInt(seller_id, 10));
        paramCount++;
      }

      if (is_customer) {
        conditions.push(`is_customer = $${paramCount}`);
        params.push(is_customer === 'true');
        paramCount++;
      }

      if (status) {
        conditions.push(`status = $${paramCount}`);
        params.push(status);
        paramCount++;
      }

      if (dateFrom) {
        conditions.push(`created_at >= $${paramCount}`);
        params.push(dateFrom);
        paramCount++;
      }

      if (dateTo) {
        conditions.push(`created_at <= $${paramCount}`);
        params.push(dateTo);
        paramCount++;
      }
    }

    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const { rows } = await query<Lead>(sqlQuery, params);
    
    if (rows.length === 0) {
      return '';
    }

    const headers = [
      'ID',
      'Nome',
      'Email',
      'WhatsApp',
      'Profissão',
      'Dificuldade',
      'Região',
      'Status',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Criado em',
      'Atualizado em',
    ];

    const csvRows = [headers.join(',')];

    for (const lead of rows) {
      const row = [
        lead.id,
        this.escapeCsvValue(lead.name),
        this.escapeCsvValue(lead.email),
        this.escapeCsvValue(lead.whatsapp),
        this.escapeCsvValue(lead.profession || ''),
        this.escapeCsvValue(lead.difficulty || ''),
        this.escapeCsvValue(lead.region || ''),
        this.escapeCsvValue(lead.status || ''),
        this.escapeCsvValue(lead.utm_source || ''),
        this.escapeCsvValue(lead.utm_medium || ''),
        this.escapeCsvValue(lead.utm_campaign || ''),
        new Date(lead.created_at).toLocaleString('pt-BR'),
        new Date(lead.updated_at).toLocaleString('pt-BR'),
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | null> {
    const { rows } = await query<Lead>(
      'UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0] || null;
  }

  async createLead(data: CreateLeadData): Promise<Lead> {
    const {
      name,
      email,
      whatsapp,
      profession,
      difficulty,
      region,
      status,
      seller_id,
      is_customer,
      notes,
      lgpd_consent,
    } = data;

    const { rows } = await query<Lead>(
      `INSERT INTO leads (
        name, email, whatsapp, profession, difficulty, region, status, 
        seller_id, is_customer, notes, lgpd_consent, 
        lgpd_consent_date, lgpd_consent_ip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [
        name,
        email,
        whatsapp,
        profession || null,
        difficulty || null,
        region || null,
        status || 'novo',
        seller_id || null,
        is_customer || false,
        notes || null,
        lgpd_consent,
        lgpd_consent ? new Date() : null,
        null, // lgpd_consent_ip (pode ser capturado se necessário)
      ]
    );
    return rows[0];
  }

  async updateLead(id: number, data: UpdateLeadData): Promise<Lead | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(data.email);
      paramCount++;
    }

    if (data.whatsapp !== undefined) {
      fields.push(`whatsapp = $${paramCount}`);
      values.push(data.whatsapp);
      paramCount++;
    }

    if (data.profession !== undefined) {
      fields.push(`profession = $${paramCount}`);
      values.push(data.profession);
      paramCount++;
    }

    if (data.difficulty !== undefined) {
      fields.push(`difficulty = $${paramCount}`);
      values.push(data.difficulty);
      paramCount++;
    }

    if (data.region !== undefined) {
      fields.push(`region = $${paramCount}`);
      values.push(data.region);
      paramCount++;
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount}`);
      values.push(data.status);
      paramCount++;
    }

    if (data.seller_id !== undefined) {
      fields.push(`seller_id = $${paramCount}`);
      values.push(data.seller_id);
      paramCount++;
    }

    if (data.is_customer !== undefined) {
      fields.push(`is_customer = $${paramCount}`);
      values.push(data.is_customer);
      paramCount++;
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount}`);
      values.push(data.notes);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.getLeadById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await query<Lead>(
      `UPDATE leads SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  async importFromCsv(csvData: string): Promise<{ imported: number; errors: string[] }> {
    const lines = csvData.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    let imported = 0;

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCsvLine(lines[i]);
        
        if (values.length < 3) {
          errors.push(`Linha ${i + 1}: Dados insuficientes`);
          continue;
        }

        // Map CSV columns to lead data
        const leadData: CreateLeadData = {
          name: values[1] || '',
          email: values[2] || '',
          whatsapp: values[3] || '',
          profession: values[4] || undefined,
          difficulty: values[5] || undefined,
          region: values[6] || undefined,
          status: values[7] || 'novo',
          notes: undefined,
          lgpd_consent: true,
        };

        // Validate required fields
        if (!leadData.name || !leadData.email || !leadData.whatsapp) {
          errors.push(`Linha ${i + 1}: Nome, email ou whatsapp ausente`);
          continue;
        }

        await this.createLead(leadData);
        imported++;
      } catch (error) {
        errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return { imported, errors };
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  private escapeCsvValue(value: string | number): string {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
}

