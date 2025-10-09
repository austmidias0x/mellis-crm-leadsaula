-- Adicionar coluna status à tabela leads
-- Execute este SQL no seu banco de dados PostgreSQL (Neon)

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'novo';

-- Atualizar leads existentes que não têm status
UPDATE leads 
SET status = 'novo' 
WHERE status IS NULL;

-- Criar índice para melhorar performance nas queries do Kanban
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Comentário da coluna
COMMENT ON COLUMN leads.status IS 'Status do lead no funil de vendas: novo, contato, qualificado, negociacao, fechado, perdido';

