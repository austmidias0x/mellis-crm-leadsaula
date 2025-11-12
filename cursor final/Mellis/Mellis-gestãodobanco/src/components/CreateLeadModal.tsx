import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../services/api';
import type { CreateLeadData } from '../types/lead';
import './Modal.css';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateLeadModal({ isOpen, onClose }: CreateLeadModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateLeadData>({
    name: '',
    email: '',
    whatsapp: '',
    profession: '',
    difficulty: '',
    region: '',
    status: 'novo',
    seller_id: undefined,
    is_customer: false,
    notes: '',
    lgpd_consent: true,
  });

  const { data: sellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => api.sellers.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateLeadData) => api.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      whatsapp: '',
      profession: '',
      difficulty: '',
      region: '',
      status: 'novo',
      seller_id: undefined,
      is_customer: false,
      notes: '',
      lgpd_consent: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value || undefined,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Lead</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp *</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profession">Profissão</label>
              <select
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="veterinario">Veterinário</option>
                <option value="tecnico">Técnico</option>
                <option value="dono">Dono</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Dificuldade</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="interpretacao">Interpretação</option>
                <option value="escolha">Escolha</option>
                <option value="coleta">Coleta</option>
                <option value="demora">Demora</option>
                <option value="custo">Custo</option>
                <option value="nenhuma">Nenhuma</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="region">Região</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="serra">Serra</option>
                <option value="poa">Porto Alegre</option>
                <option value="interior">Interior</option>
                <option value="outros-estados">Outros Estados</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="novo">Novo</option>
                <option value="contato">Em Contato</option>
                <option value="qualificado">Qualificado</option>
                <option value="negociacao">Negociação</option>
                <option value="fechado">Fechado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="seller_id">Vendedor</label>
              <select
                id="seller_id"
                name="seller_id"
                value={formData.seller_id || ''}
                onChange={handleChange}
              >
                <option value="">Sem vendedor</option>
                {sellers?.map(seller => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-group-checkbox">
              <label htmlFor="is_customer">
                <input
                  type="checkbox"
                  id="is_customer"
                  name="is_customer"
                  checked={formData.is_customer}
                  onChange={handleChange}
                />
                Já é cliente
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Adicione observações sobre o lead..."
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

