import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Target, Clock } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { api } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.leads.getStats,
  });

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="loading">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total de Leads"
          value={stats?.total || 0}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Novos (7 dias)"
          value={stats?.recentLeads || 0}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          title="Profissões"
          value={Object.keys(stats?.byProfession || {}).length}
          icon={Target}
          color="warning"
        />
        <StatsCard
          title="Regiões"
          value={Object.keys(stats?.byRegion || {}).length}
          icon={Clock}
          color="danger"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Leads por Profissão</h3>
          <div className="chart-content">
            {Object.entries(stats?.byProfession || {}).map(([profession, count]) => (
              <div key={profession} className="chart-item">
                <span className="chart-label">{profession || 'Não informado'}</span>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                  />
                  <span className="chart-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Leads por Região</h3>
          <div className="chart-content">
            {Object.entries(stats?.byRegion || {}).map(([region, count]) => (
              <div key={region} className="chart-item">
                <span className="chart-label">{region || 'Não informado'}</span>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                  />
                  <span className="chart-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Dificuldades Principais</h3>
          <div className="chart-content">
            {Object.entries(stats?.byDifficulty || {}).map(([difficulty, count]) => (
              <div key={difficulty} className="chart-item">
                <span className="chart-label">{difficulty || 'Não informado'}</span>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar chart-bar--danger" 
                    style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                  />
                  <span className="chart-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {stats?.bySeller && Object.keys(stats.bySeller).length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Leads por Vendedor</h3>
            <div className="chart-content">
              {Object.entries(stats.bySeller).map(([seller, count]) => (
                <div key={seller} className="chart-item">
                  <span className="chart-label">{seller || 'Não informado'}</span>
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                    />
                    <span className="chart-value">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.byCustomerStatus && (
          <div className="chart-card">
            <h3 className="chart-title">Status de Cliente</h3>
            <div className="chart-content">
              <div className="chart-item">
                <span className="chart-label">Já são clientes</span>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar chart-bar--success" 
                    style={{ width: `${stats.total > 0 ? (stats.byCustomerStatus.customers / stats.total) * 100 : 0}%` }}
                  />
                  <span className="chart-value">{stats.byCustomerStatus.customers || 0}</span>
                </div>
              </div>
              <div className="chart-item">
                <span className="chart-label">Não são clientes</span>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ width: `${stats.total > 0 ? (stats.byCustomerStatus.nonCustomers / stats.total) * 100 : 0}%` }}
                  />
                  <span className="chart-value">{stats.byCustomerStatus.nonCustomers || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

