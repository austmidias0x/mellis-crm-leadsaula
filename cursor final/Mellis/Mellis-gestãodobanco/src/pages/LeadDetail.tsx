import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, MapPin, AlertCircle, Calendar, Globe } from 'lucide-react';
import { api } from '../services/api';
import './LeadDetail.css';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.leads.getById(Number(id)),
    enabled: !!id,
  });

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

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading">Carregando lead...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="page">
        <div className="error">Lead não encontrado</div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="btn btn-secondary" onClick={() => navigate('/leads')}>
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="detail-container">
        <div className="detail-header">
          <h1 className="detail-title">{lead.name}</h1>
          <span className="detail-id">ID: {lead.id}</span>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3 className="detail-card-title">Informações de Contato</h3>
            <div className="detail-items">
              <div className="detail-item">
                <Mail size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Email</p>
                  <a href={`mailto:${lead.email}`} className="detail-value detail-link">
                    {lead.email}
                  </a>
                </div>
              </div>
              <div className="detail-item">
                <Phone size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">WhatsApp</p>
                  <a
                    href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-value detail-link"
                  >
                    {formatPhone(lead.whatsapp)}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Dados Profissionais</h3>
            <div className="detail-items">
              <div className="detail-item">
                <User size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Profissão</p>
                  <p className="detail-value">{lead.profession || 'Não informado'}</p>
                </div>
              </div>
              <div className="detail-item">
                <MapPin size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Região</p>
                  <p className="detail-value">{lead.region || 'Não informado'}</p>
                </div>
              </div>
              <div className="detail-item">
                <AlertCircle size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Dificuldade Principal</p>
                  <p className="detail-value">{lead.difficulty || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Informações de Marketing</h3>
            <div className="detail-items">
              <div className="detail-item">
                <Globe size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">UTM Source</p>
                  <p className="detail-value">{lead.utm_source || 'N/A'}</p>
                </div>
              </div>
              <div className="detail-item">
                <Globe size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">UTM Medium</p>
                  <p className="detail-value">{lead.utm_medium || 'N/A'}</p>
                </div>
              </div>
              <div className="detail-item">
                <Globe size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">UTM Campaign</p>
                  <p className="detail-value">{lead.utm_campaign || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">Timestamps</h3>
            <div className="detail-items">
              <div className="detail-item">
                <Calendar size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Criado em</p>
                  <p className="detail-value">{formatDate(lead.created_at)}</p>
                </div>
              </div>
              <div className="detail-item">
                <Calendar size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Atualizado em</p>
                  <p className="detail-value">{formatDate(lead.updated_at)}</p>
                </div>
              </div>
              <div className="detail-item">
                <Calendar size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Consentimento LGPD</p>
                  <p className="detail-value">
                    {lead.lgpd_consent ? '✓ Sim' : '✗ Não'}
                    {lead.lgpd_consent_date && ` - ${formatDate(lead.lgpd_consent_date)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {lead.user_agent && (
          <div className="detail-card">
            <h3 className="detail-card-title">Informações Técnicas</h3>
            <p className="detail-tech-info">{lead.user_agent}</p>
          </div>
        )}
      </div>
    </div>
  );
}

