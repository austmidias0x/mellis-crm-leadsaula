import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Filter, ChevronLeft, ChevronRight, X, Plus, UserPlus, Upload } from 'lucide-react';
import { api } from '../services/api';
import type { LeadsFilters } from '../types/lead';
import CreateLeadModal from '../components/CreateLeadModal';
import CreateSellerModal from '../components/CreateSellerModal';
import LeadDetailModal from '../components/LeadDetailModal';
import ImportCsvModal from '../components/ImportCsvModal';
import './LeadsList.css';

export default function LeadsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LeadsFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [isCreateSellerModalOpen, setIsCreateSellerModalOpen] = useState(false);
  const [isImportCsvModalOpen, setIsImportCsvModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => api.leads.getAll(filters),
  });

  const { data: sellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => api.sellers.getAll(true),
  });

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleFilterChange = (key: keyof LeadsFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 50 });
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const exportFilters = { ...filters };
      delete exportFilters.page;
      delete exportFilters.limit;
      await api.leads.exportCsv(exportFilters);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro ao exportar CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const activeFiltersCount = Object.keys(filters).filter(
    key => key !== 'page' && key !== 'limit' && filters[key as keyof LeadsFilters]
  ).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Leads</h1>
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
            className="btn btn-secondary"
            onClick={() => setIsImportCsvModalOpen(true)}
          >
            <Upload size={18} />
            Importar CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportCsv}
            disabled={isExporting}
          >
            <Download size={18} />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
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

      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou telefone..."
          className="search-input"
          value={filters.search || ''}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filtros Avançados</h3>
            <button onClick={() => setShowFilters(false)} className="btn-icon">
              <X size={20} />
            </button>
          </div>
          <div className="filters-grid">
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
              <label>Dificuldade</label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="interpretacao">Interpretação</option>
                <option value="escolha">Escolha</option>
                <option value="coleta">Coleta</option>
                <option value="demora">Demora</option>
                <option value="custo">Custo</option>
                <option value="nenhuma">Nenhuma</option>
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
            <div className="filter-group">
              <label>Data Inicial</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Data Final</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="novo">Novo</option>
                <option value="contato">Em Contato</option>
                <option value="qualificado">Qualificado</option>
                <option value="negociacao">Negociação</option>
                <option value="fechado">Fechado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
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
          </div>
          {activeFiltersCount > 0 && (
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="loading">Carregando leads...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Profissão</th>
                  <th>Região</th>
                  <th>Dificuldade</th>
                  <th>Vendedor</th>
                  <th>Status Cliente</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="table-row-clickable"
                  >
                    <td className="font-medium">{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{formatPhone(lead.whatsapp)}</td>
                    <td>
                      <span className="badge badge-primary">
                        {lead.profession || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {lead.region || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        {lead.difficulty || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {lead.seller_id && sellers ? (
                        <span className="badge badge-primary">
                          {sellers.find(s => s.id === lead.seller_id)?.name || 'N/A'}
                        </span>
                      ) : (
                        <span className="badge badge-secondary">Sem vendedor</span>
                      )}
                    </td>
                    <td>
                      {lead.is_customer ? (
                        <span className="badge badge-success">✓ Cliente</span>
                      ) : (
                        <span className="badge badge-secondary">-</span>
                      )}
                    </td>
                    <td className="text-secondary">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                disabled={filters.page === 1}
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
              <span className="pagination-info">
                Página {data.pagination.page} de {data.pagination.totalPages}
                {' '}({data.pagination.total} leads)
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                disabled={filters.page === data.pagination.totalPages}
              >
                Próxima
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      <CreateLeadModal 
        isOpen={isCreateLeadModalOpen} 
        onClose={() => setIsCreateLeadModalOpen(false)} 
      />
      
      <CreateSellerModal 
        isOpen={isCreateSellerModalOpen} 
        onClose={() => setIsCreateSellerModalOpen(false)} 
      />
      
      <ImportCsvModal 
        isOpen={isImportCsvModalOpen} 
        onClose={() => setIsImportCsvModalOpen(false)} 
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

