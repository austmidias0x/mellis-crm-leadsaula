import { Router } from 'express';
import { SellerService } from '../services/seller.service.js';

const router = Router();
const sellerService = new SellerService();

// Get all sellers
router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const sellers = await sellerService.getAllSellers(activeOnly);
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

// Get seller by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const seller = await sellerService.getSellerById(id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

// Create new seller
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const seller = await sellerService.createSeller({ name, email, phone, active });
    res.status(201).json(seller);
  } catch (error) {
    console.error('Error creating seller:', error);
    res.status(500).json({ error: 'Failed to create seller' });
  }
});

// Update seller
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, phone, active } = req.body;

    const seller = await sellerService.updateSeller(id, { name, email, phone, active });
    
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Error updating seller:', error);
    res.status(500).json({ error: 'Failed to update seller' });
  }
});

// Delete seller
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const seller = await sellerService.deleteSeller(id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json({ message: 'Seller deleted successfully', seller });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({ error: 'Failed to delete seller' });
  }
});

export default router;

