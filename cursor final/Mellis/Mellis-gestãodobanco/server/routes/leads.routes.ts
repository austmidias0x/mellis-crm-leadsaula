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

export default router;

