import { Router } from 'express';
import { LeadService } from '../services/lead.service.js';
import type { LeadsFilters } from '../types/lead.js';

const router = Router();
const leadService = new LeadService();

router.get('/', async (req, res) => {
  try {
    const filters: LeadsFilters = {
      search: req.query.search as string,
      profession: req.query.profession as string,
      difficulty: req.query.difficulty as string,
      region: req.query.region as string,
      utm_campaign: req.query.utm_campaign as string,
      seller_id: req.query.seller_id as string,
      is_customer: req.query.is_customer as string,
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
    };

    const result = await leadService.getAllLeads(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const stats = await leadService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/export/csv', async (req, res) => {
  try {
    const filters: LeadsFilters = {
      search: req.query.search as string,
      profession: req.query.profession as string,
      difficulty: req.query.difficulty as string,
      region: req.query.region as string,
      utm_campaign: req.query.utm_campaign as string,
      seller_id: req.query.seller_id as string,
      is_customer: req.query.is_customer as string,
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };

    const csv = await leadService.exportToCsv(filters);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const lead = await leadService.getLeadById(id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const lead = await leadService.updateLeadStatus(id, status);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, whatsapp, profession, difficulty, region, status, seller_id, is_customer, notes, lgpd_consent } = req.body;

    // Validate required fields
    if (!name || !email || !whatsapp) {
      return res.status(400).json({ error: 'Name, email, and whatsapp are required' });
    }

    const lead = await leadService.createLead({
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
      lgpd_consent: lgpd_consent || true,
    });
    
    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, whatsapp, profession, difficulty, region, status, seller_id, is_customer, notes } = req.body;

    const lead = await leadService.updateLead(id, {
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
    });
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

router.post('/import/csv', async (req, res) => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    const result = await leadService.importFromCsv(csvData);
    
    res.json({
      success: true,
      imported: result.imported,
      errors: result.errors,
      message: `${result.imported} leads importados com sucesso${result.errors.length > 0 ? ` (${result.errors.length} erros)` : ''}`,
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

export default router;

