import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, User, MapPin, Calendar } from 'lucide-react';
import { api } from '../services/api';
import type { Lead } from '../types/lead';
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

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { limit: 1000 }],
    queryFn: () => api.leads.getAll({ limit: 1000 }),
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
        <h1 className="page-title">Kanban</h1>
        <p className="page-subtitle">
          {data?.pagination.total || 0} leads no total
        </p>
      </div>

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

                  {lead.difficulty && (
                    <div className="kanban-card-footer">
                      <span className="badge badge-warning">
                        {lead.difficulty}
                      </span>
                    </div>
                  )}
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
    </div>
  );
}

