import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Mail, Phone, User, MapPin, AlertCircle, Calendar, Edit2, Save } from 'lucide-react';
import { api } from '../services/api';
import type { Lead, UpdateLeadData } from '../types/lead';
import './Modal.css';
import './LeadDetailModal.css';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: number;
}

export default function LeadDetailModal({ isOpen, onClose, leadId }: LeadDetailModalProps) {
  const queryClient = useQueryClient();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateLeadData>({});

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => api.leads.getById(leadId),
    enabled: isOpen && !!leadId,
  });

  const { data: sellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => api.sellers.getAll(true),
  });

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
      setEditData({
        name: lead.name,
        email: lead.email,
        whatsapp: lead.whatsapp,
        profession: lead.profession || '',
        difficulty: lead.difficulty || '',
        region: lead.region || '',
        status: lead.status || 'novo',
        seller_id: lead.seller_id || undefined,
        is_customer: lead.is_customer || false,
      });
    }
  }, [lead]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeadData) => api.leads.update(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setIsEditingNotes(false);
      setIsEditing(false);
    },
  });

  const updateQuickFieldMutation = useMutation({
    mutationFn: (data: UpdateLeadData) => api.leads.update(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleSaveNotes = () => {
    updateMutation.mutate({ notes });
  };

  const handleSaveEdit = () => {
    updateMutation.mutate(editData);
  };

  const handleQuickUpdateSeller = (sellerId: string) => {
    const sellerIdNum = sellerId ? parseInt(sellerId) : undefined;
    updateQuickFieldMutation.mutate({ seller_id: sellerIdNum });
  };

  const handleQuickUpdateCustomerStatus = (isCustomer: boolean) => {
    updateQuickFieldMutation.mutate({ is_customer: isCustomer });
  };

  const formatDate = (date?: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large lead-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{lead?.name || 'Carregando...'}</h2>
            {lead && <span className="lead-id">ID: {lead.id}</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-icon" 
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? 'Cancelar edição' : 'Editar lead'}
            >
              <Edit2 size={20} />
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="modal-form">
            <div className="loading">Carregando...</div>
          </div>
        ) : lead ? (
          <div className="modal-form">
            {isEditing ? (
              <>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Nome</label>
                    <input
                      type="text"
                      id="name"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="whatsapp">WhatsApp</label>
                    <input
                      type="tel"
                      id="whatsapp"
                      value={editData.whatsapp || ''}
                      onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="profession">Profissão</label>
                    <select
                      id="profession"
                      value={editData.profession || ''}
                      onChange={(e) => setEditData({ ...editData, profession: e.target.value })}
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
                      value={editData.difficulty || ''}
                      onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
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
                      value={editData.region || ''}
                      onChange={(e) => setEditData({ ...editData, region: e.target.value })}
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
                      value={editData.status || 'novo'}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
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
                      value={editData.seller_id || ''}
                      onChange={(e) => setEditData({ ...editData, seller_id: e.target.value ? parseInt(e.target.value) : undefined })}
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
                        checked={editData.is_customer || false}
                        onChange={(e) => setEditData({ ...editData, is_customer: e.target.checked })}
                      />
                      Já é cliente
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={updateMutation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                  >
                    <Save size={18} />
                    {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="detail-grid">
                  <div className="detail-section">
                    <h3>Informações de Contato</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <Mail size={18} />
                        <div>
                          <p className="detail-label">Email</p>
                          <a href={`mailto:${lead.email}`} className="detail-link">
                            {lead.email}
                          </a>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Phone size={18} />
                        <div>
                          <p className="detail-label">WhatsApp</p>
                          <a
                            href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="detail-link"
                          >
                            {formatPhone(lead.whatsapp)}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Dados do Lead</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <User size={18} />
                        <div>
                          <p className="detail-label">Profissão</p>
                          <p className="detail-value">{lead.profession || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <MapPin size={18} />
                        <div>
                          <p className="detail-label">Região</p>
                          <p className="detail-value">{lead.region || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <AlertCircle size={18} />
                        <div>
                          <p className="detail-label">Dificuldade</p>
                          <p className="detail-value">{lead.difficulty || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Status & Tags</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <div>
                          <p className="detail-label">Status</p>
                          <span className="badge badge-primary">
                            {lead.status || 'novo'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item detail-item-full">
                        <div className="quick-edit-field">
                          <label htmlFor="quick-seller">Vendedor Responsável</label>
                          <select
                            id="quick-seller"
                            value={lead.seller_id || ''}
                            onChange={(e) => handleQuickUpdateSeller(e.target.value)}
                            disabled={updateQuickFieldMutation.isPending}
                            className="quick-edit-select"
                          >
                            <option value="">Sem vendedor</option>
                            {sellers?.map(seller => (
                              <option key={seller.id} value={seller.id}>
                                {seller.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="detail-item detail-item-full">
                        <div className="quick-edit-field">
                          <label htmlFor="quick-customer">Status de Cliente</label>
                          <select
                            id="quick-customer"
                            value={lead.is_customer ? 'true' : 'false'}
                            onChange={(e) => handleQuickUpdateCustomerStatus(e.target.value === 'true')}
                            disabled={updateQuickFieldMutation.isPending}
                            className="quick-edit-select"
                          >
                            <option value="false">Não é cliente</option>
                            <option value="true">Já é cliente</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Datas</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <Calendar size={18} />
                        <div>
                          <p className="detail-label">Criado em</p>
                          <p className="detail-value">{formatDate(lead.created_at)}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Calendar size={18} />
                        <div>
                          <p className="detail-label">Atualizado em</p>
                          <p className="detail-value">{formatDate(lead.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="notes-section">
                  <div className="notes-header">
                    <h3>Observações</h3>
                    {!isEditingNotes && (
                      <button
                        className="btn-icon"
                        onClick={() => setIsEditingNotes(true)}
                        title="Editar observações"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        placeholder="Adicione observações sobre o lead..."
                        className="notes-textarea"
                      />
                      <div className="notes-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setNotes(lead.notes || '');
                            setIsEditingNotes(false);
                          }}
                          disabled={updateMutation.isPending}
                        >
                          Cancelar
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleSaveNotes}
                          disabled={updateMutation.isPending}
                        >
                          <Save size={18} />
                          {updateMutation.isPending ? 'Salvando...' : 'Salvar Observações'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="notes-display">
                      {lead.notes || 'Nenhuma observação registrada.'}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="modal-form">
            <div className="error">Lead não encontrado</div>
          </div>
        )}
      </div>
    </div>
  );
}

