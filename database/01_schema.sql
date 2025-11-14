-- =============================================
-- Script de Criação do Banco de Dados
-- Sistema de Solicitações SENAI
-- =============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS suport_senai;
USE suport_senai;
-- Tabela de Setores
CREATE TABLE IF NOT EXISTS setores (
  id_setor INT AUTO_INCREMENT PRIMARY KEY,
  nome_setor VARCHAR(100) NOT NULL,
  status_setor TINYINT(1) DEFAULT 1,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Usuários Administradores
CREATE TABLE IF NOT EXISTS usuarios_admin (
  id_usuario_admin INT AUTO_INCREMENT PRIMARY KEY,
  id_setor_fk INT NOT NULL,
  nome_admin VARCHAR(150) NOT NULL,
  email_admin VARCHAR(150) NOT NULL UNIQUE,
  senha_admin VARCHAR(255) NOT NULL,
  cargo_admin VARCHAR(100),
  status_admin TINYINT(1) DEFAULT 1,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_setor_fk) REFERENCES setores(id_setor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Categorias de Solicitação
CREATE TABLE IF NOT EXISTS categorias_solicitacao (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  id_setor_fk INT NOT NULL,
  nome_categoria VARCHAR(100) NOT NULL,
  status_categoria TINYINT(1) DEFAULT 1,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_setor_fk) REFERENCES setores(id_setor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Solicitações
CREATE TABLE IF NOT EXISTS solicitacoes (
  id_solicitacao INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria_fk INT NOT NULL,
  nome_solicitante VARCHAR(150) NOT NULL,
  matricula_solicitante VARCHAR(50) NOT NULL,
  cargo_solicitante VARCHAR(100),
  local_problema VARCHAR(200) NOT NULL,
  descricao_problema TEXT NOT NULL,
  prioridade ENUM('Baixa', 'Média', 'Urgente') NOT NULL DEFAULT 'Média',
  path_imagem VARCHAR(255),
  status_solicitacao ENUM('Aberta', 'Em andamento', 'Concluída') NOT NULL DEFAULT 'Aberta',
  resposta_setor TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria_fk) REFERENCES categorias_solicitacao(id_categoria),
  INDEX idx_solicitacao_matricula (matricula_solicitante),
  INDEX idx_solicitacao_status (status_solicitacao),
  INDEX idx_solicitacao_data (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Movimentações (Histórico de alterações)
CREATE TABLE IF NOT EXISTS movimentacoes (
  id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
  id_solicitacao_fk INT NOT NULL,
  id_usuario_admin_fk INT,
  status_anterior ENUM('Aberta', 'Em andamento', 'Concluída'),
  status_novo ENUM('Aberta', 'Em andamento', 'Concluída') NOT NULL,
  observacao_movimentacao TEXT,
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_solicitacao_fk) REFERENCES solicitacoes(id_solicitacao) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario_admin_fk) REFERENCES usuarios_admin(id_usuario_admin) ON DELETE SET NULL,
  INDEX idx_movimentacao_data (data_movimentacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


