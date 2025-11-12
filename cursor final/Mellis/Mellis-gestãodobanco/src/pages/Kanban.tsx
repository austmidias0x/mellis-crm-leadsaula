import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, User, MapPin, Calendar, Plus, UserPlus, Filter } from 'lucide-react';
import { api } from '../services/api';
import type { Lead, LeadsFilters } from '../types/lead';
import CreateLeadModal from '../components/CreateLeadModal';
import CreateSellerModal from '../components/CreateSellerModal';
import LeadDetailModal from '../components/LeadDetailModal';
import './Kanban.css';

const KANBAN_COLUMNS = [
  { id: 'novo', title: 'Novo', color: '#3b82f6' },
  { id: 'contato', title: 'Em Contato', color: '#f59e0b' },
  { id: 'qualificado', title: 'Qualificado', color: '#8b5cf6' },
  { id: 'negociacao', title: 'Negociação', color: '#06b6d4' },
  { id: 'fechado', title: 'Fechado', color: '#10b981' },
  { id: 'perdido', title: 'Perdido', color: '#ef4444' },
];

export default function Kanban() {
  const queryClient = useQueryClient();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [isCreateSellerModalOpen, setIsCreateSellerModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LeadsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { ...filters, limit: 1000 }],
    queryFn: () => api.leads.getAll({ ...filters, limit: 1000 }),
  });

  const { data: sellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => api.sellers.getAll(true),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.leads.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const groupedLeads = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = (data?.data || []).filter(
      (lead) => (lead.status || 'novo') === column.id
    );
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id.toString());
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedLead) {
      const currentStatus = draggedLead.status || 'novo';
      
      if (currentStatus !== columnId) {
        updateStatusMutation.mutate({ id: draggedLead.id, status: columnId });
      }
    }
    
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const handleFilterChange = (key: keyof LeadsFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof LeadsFilters]
  ).length;

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Kanban</h1>
        </div>
        <div className="loading">Carregando leads...</div>
      </div>
    );
  }

  return (
    <div className="page kanban-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban</h1>
          <p className="page-subtitle">
            {data?.pagination.total || 0} leads no total
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="badge">{activeFiltersCount}</span>
            )}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsCreateSellerModalOpen(true)}
          >
            <UserPlus size={18} />
            Novo Vendedor
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateLeadModalOpen(true)}
          >
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Vendedor</label>
              <select
                value={filters.seller_id || ''}
                onChange={(e) => handleFilterChange('seller_id', e.target.value)}
              >
                <option value="">Todos</option>
                {sellers?.map(seller => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status de Cliente</label>
              <select
                value={filters.is_customer || ''}
                onChange={(e) => handleFilterChange('is_customer', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Já é cliente</option>
                <option value="false">Não é cliente</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Profissão</label>
              <select
                value={filters.profession || ''}
                onChange={(e) => handleFilterChange('profession', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="veterinario">Veterinário</option>
                <option value="tecnico">Técnico</option>
                <option value="dono">Dono</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Região</label>
              <select
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="serra">Serra</option>
                <option value="poa">Porto Alegre</option>
                <option value="interior">Interior</option>
                <option value="outros-estados">Outros Estados</option>
              </select>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button className="btn btn-secondary btn-clear-filters" onClick={handleClearFilters}>
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      <div className="kanban-board">
        {KANBAN_COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
              <h3>{column.title}</h3>
              <span className="kanban-count">
                {groupedLeads[column.id]?.length || 0}
              </span>
            </div>

            <div className="kanban-cards">
              {groupedLeads[column.id]?.map((lead) => (
                <div
                  key={lead.id}
                  className={`kanban-card ${draggedLead?.id === lead.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <div className="kanban-card-header">
                    <h4>{lead.name}</h4>
                    <span className="kanban-card-date">
                      <Calendar size={12} />
                      {formatDate(lead.created_at)}
                    </span>
                  </div>

                  <div className="kanban-card-info">
                    <div className="kanban-card-row">
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </div>
                    <div className="kanban-card-row">
                      <Phone size={14} />
                      <span>{formatPhone(lead.whatsapp)}</span>
                    </div>
                    {lead.profession && (
                      <div className="kanban-card-row">
                        <User size={14} />
                        <span>{lead.profession}</span>
                      </div>
                    )}
                    {lead.region && (
                      <div className="kanban-card-row">
                        <MapPin size={14} />
                        <span>{lead.region}</span>
                      </div>
                    )}
                  </div>

                  <div className="kanban-card-footer">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {lead.difficulty && (
                        <span className="badge badge-warning">
                          {lead.difficulty}
                        </span>
                      )}
                      {lead.seller_id && sellers && (
                        <span className="badge badge-primary" title="Vendedor">
                          👤 {sellers.find(s => s.id === lead.seller_id)?.name || 'Vendedor'}
                        </span>
                      )}
                      {lead.is_customer && (
                        <span className="badge badge-success" title="Já é cliente">
                          ⭐ Cliente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!groupedLeads[column.id] || groupedLeads[column.id].length === 0) && (
                <div className="kanban-empty">
                  Nenhum lead nesta coluna
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateLeadModal 
        isOpen={isCreateLeadModalOpen} 
        onClose={() => setIsCreateLeadModalOpen(false)} 
      />
      
      <CreateSellerModal 
        isOpen={isCreateSellerModalOpen} 
        onClose={() => setIsCreateSellerModalOpen(false)} 
      />
      
      {selectedLeadId && (
        <LeadDetailModal 
          isOpen={!!selectedLeadId} 
          onClose={() => setSelectedLeadId(null)} 
          leadId={selectedLeadId} 
        />
      )}
    </div>
  );
}

