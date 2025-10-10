import { query } from '../db.js';
import type { Lead, LeadsFilters, LeadsStats } from '../types/lead.js';

export class LeadService {
  async getAllLeads(filters: LeadsFilters) {
    const {
      search,
      profession,
      difficulty,
      region,
      utm_campaign,
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

    return {
      total,
      byProfession,
      byDifficulty,
      byRegion,
      recentLeads,
    };
  }

  async exportToCsv(filters?: LeadsFilters): Promise<string> {
    let sqlQuery = 'SELECT * FROM leads';
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters) {
      const { search, profession, difficulty, region, utm_campaign, dateFrom, dateTo } = filters;

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

  private escapeCsvValue(value: string | number): string {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
}

