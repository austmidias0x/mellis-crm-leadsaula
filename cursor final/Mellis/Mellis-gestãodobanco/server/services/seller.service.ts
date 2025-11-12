import { query } from '../db.js';
import type { Seller } from '../types/lead.js';

export class SellerService {
  async getAllSellers(activeOnly: boolean = false) {
    const whereClause = activeOnly ? 'WHERE active = true' : '';
    const { rows } = await query<Seller>(
      `SELECT * FROM sellers ${whereClause} ORDER BY name ASC`
    );
    return rows;
  }

  async getSellerById(id: number) {
    const { rows } = await query<Seller>(
      'SELECT * FROM sellers WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async createSeller(data: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) {
    const { name, email, phone, active = true } = data;
    const { rows } = await query<Seller>(
      `INSERT INTO sellers (name, email, phone, active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, phone, active]
    );
    return rows[0];
  }

  async updateSeller(id: number, data: Partial<Omit<Seller, 'id' | 'created_at' | 'updated_at'>>) {
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

    if (data.phone !== undefined) {
      fields.push(`phone = $${paramCount}`);
      values.push(data.phone);
      paramCount++;
    }

    if (data.active !== undefined) {
      fields.push(`active = $${paramCount}`);
      values.push(data.active);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.getSellerById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await query<Seller>(
      `UPDATE sellers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  async deleteSeller(id: number) {
    const { rows } = await query<Seller>(
      'DELETE FROM sellers WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] || null;
  }
}

