-- =============================================
-- Script de População de Dados Iniciais
-- Sistema de Solicitações SENAI
-- =============================================

USE suport_senai;

-- Inserir Setores
INSERT INTO setores (nome_setor) VALUES
('TI - Tecnologia da Informação'),
('Manutenção Predial'),
('Manutenção de Equipamentos'),
('Infraestrutura');

-- Inserir Categorias de Solicitação
INSERT INTO categorias_solicitacao (id_setor_fk, nome_categoria) VALUES
-- TI
(1, 'Problemas de Rede'),
(1, 'Hardware'),
(1, 'Software'),
(1, 'Impressoras'),
(1, 'Projetor'),
-- Manutenção Predial
(2, 'Elétrica'),
(2, 'Hidráulica'),
(2, 'Pintura'),
(2, 'Mobiliário'),
-- Manutenção de Equipamentos
(3, 'Máquinas'),
(3, 'Equipamentos de Laboratório'),
-- Infraestrutura
(4, 'Ar Condicionado'),
(4, 'Estrutura Física');

-- Inserir Usuários Administradores
-- Senha: senai2024 (hash bcrypt)
INSERT INTO usuarios_admin (id_setor_fk, nome_admin, email_admin, senha_admin, cargo_admin) VALUES
(1, 'João Silva', 'joao.silva@senai.br', '$2b$10$7we5U6Sgn5wZ/TVLirjeHergkkacgv8.Y1IzCZ0rl60UWmlKbmE1m', 'Coordenador de TI'),
(2, 'Maria Santos', 'maria.santos@senai.br', '$2b$10$7we5U6Sgn5wZ/TVLirjeHergkkacgv8.Y1IzCZ0rl60UWmlKbmE1m', 'Supervisora de Manutenção'),
(3, 'Carlos Oliveira', 'carlos.oliveira@senai.br', '$2b$10$7we5U6Sgn5wZ/TVLirjeHergkkacgv8.Y1IzCZ0rl60UWmlKbmE1m', 'Técnico de Equipamentos'),
(4, 'Ana Costa', 'ana.costa@senai.br', '$2b$10$7we5U6Sgn5wZ/TVLirjeHergkkacgv8.Y1IzCZ0rl60UWmlKbmE1m', 'Gerente de Infraestrutura');

-- Inserir Solicitações de Exemplo
INSERT INTO solicitacoes 
(id_categoria_fk, nome_solicitante, matricula_solicitante, cargo_solicitante, 
 local_problema, descricao_problema, prioridade, status_solicitacao) VALUES
(1, 'Pedro Almeida', '2024001', 'Instrutor', 'Sala 101', 
 'Computadores sem acesso à internet. Impossível realizar aula prática.', 
 'Urgente', 'Aberta'),
(6, 'Juliana Ferreira', '2024002', 'Coordenadora Pedagógica', 'Bloco A - Corredor', 
 'Lâmpadas queimadas no corredor principal, dificultando a circulação noturna.', 
 'Média', 'Em andamento'),
(10, 'Roberto Mendes', '2024003', 'Instrutor de Mecânica', 'Oficina 3', 
 'Torno mecânico apresentando ruídos anormais e vibração excessiva.', 
 'Urgente', 'Aberta'),
(12, 'Fernanda Lima', '2024004', 'Secretária', 'Secretaria', 
 'Ar condicionado não está refrigerando adequadamente.', 
 'Baixa', 'Concluída');

-- Inserir Movimentação de Exemplo
INSERT INTO movimentacoes 
(id_solicitacao_fk, id_usuario_admin_fk, status_anterior, status_novo, observacao_movimentacao) VALUES
(2, 2, 'Aberta', 'Em andamento', 'Equipe de manutenção direcionada. Previsão de conclusão: 2 dias.');

-- Fim do script de população

#adicionado mais essas duas tabelas de email
ALTER TABLE solicitacoes ADD COLUMN email_solicitante VARCHAR(150) AFTER nome_solicitante;

ALTER TABLE setores ADD COLUMN email_setor VARCHAR(255);