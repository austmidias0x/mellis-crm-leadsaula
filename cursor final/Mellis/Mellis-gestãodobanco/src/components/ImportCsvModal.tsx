import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import './Modal.css';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportCsvModal({ isOpen, onClose }: ImportCsvModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      return api.leads.importCsv(csvData);
    },
    onSuccess: (data) => {
      setResult({ imported: data.imported, errors: data.errors });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;
      importMutation.mutate(csvData);
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importar Leads do CSV</h2>
          <button className="btn-icon" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-form">
          {!result ? (
            <>
              <div className="import-instructions">
                <p style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Selecione um arquivo CSV exportado do sistema para importar os leads.
                </p>
                <div style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                    <strong>Formato esperado:</strong>
                  </p>
                  <ul style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-secondary)', 
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                    <li>ID, Nome, Email, WhatsApp, Profissão, Dificuldade, Região, Status...</li>
                    <li>O arquivo deve ter cabeçalho na primeira linha</li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="csv-file">Arquivo CSV</label>
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{
                    padding: '10px',
                    border: '2px dashed var(--border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {file && (
                <div style={{
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  <Upload size={16} color="var(--primary)" />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {file.name}
                  </span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={importMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!file || importMutation.isPending}
                >
                  {importMutation.isPending ? 'Importando...' : 'Importar Leads'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                {result.errors.length === 0 ? (
                  <>
                    <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>
                      Importação Concluída!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {result.imported} {result.imported === 1 ? 'lead importado' : 'leads importados'} com sucesso.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--warning)', marginBottom: '8px' }}>
                      Importação Parcial
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                      {result.imported} {result.imported === 1 ? 'lead importado' : 'leads importados'} com sucesso.
                      <br />
                      {result.errors.length} {result.errors.length === 1 ? 'erro encontrado' : 'erros encontrados'}.
                    </p>
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      textAlign: 'left',
                      background: 'var(--bg-tertiary)',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      {result.errors.map((error, index) => (
                        <div key={index} style={{ 
                          color: 'var(--danger)', 
                          marginBottom: '4px',
                          paddingBottom: '4px',
                          borderBottom: index < result.errors.length - 1 ? '1px solid var(--border)' : 'none'
                        }}>
                          {error}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleClose}
                >
                  Fechar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

