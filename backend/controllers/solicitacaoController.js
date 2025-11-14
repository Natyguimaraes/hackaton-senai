import db from '../config/database.js';
import { sendEmail } from '../utils/emailService.js';

// Criar nova solicitação
export const criarSolicitacao = async (req, res) => {
  try {
    const {
      nome_solicitante,
      matricula_solicitante,
      cargo_solicitante,
      local_problema,
      descricao_problema,
      id_categoria,
      prioridade,
      email_solicitante // NOVO CAMPO
    } = req.body;

    // Validações
    if (!nome_solicitante || !matricula_solicitante || !cargo_solicitante || 
        !local_problema || !descricao_problema || !id_categoria || !prioridade || !email_solicitante) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos.'
      });
    }

    // Caminho da imagem (se houver)
    const path_imagem = req.file ? `/uploads/${req.file.filename}` : null;

    // Inserir solicitação
    const [result] = await db.query(
      `INSERT INTO solicitacoes 
       (id_categoria_fk, nome_solicitante, email_solicitante, matricula_solicitante, cargo_solicitante,
        local_problema, descricao_problema, prioridade, path_imagem, status_solicitacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aberta')`,
      [id_categoria, nome_solicitante, email_solicitante, matricula_solicitante, cargo_solicitante,
       local_problema, descricao_problema, prioridade, path_imagem]
    );

    // Buscar e-mail do setor responsável
    const [setor] = await db.query(
      `SELECT st.email_setor FROM categorias_solicitacao c
       INNER JOIN setores st ON c.id_setor_fk = st.id_setor
       WHERE c.id_categoria = ?`,
      [id_categoria]
    );
    if (setor.length > 0 && setor[0].email_setor) {
      await sendEmail(
        setor[0].email_setor,
        'Nova solicitação criada',
        `Uma nova solicitação foi registrada por ${nome_solicitante}.`,
        `<b>Uma nova solicitação foi registrada por ${nome_solicitante}.</b>`
      );
    }

    res.status(201).json({
      success: true,
      message: 'Solicitação criada com sucesso!',
      id_solicitacao: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar solicitação.'
    });
  }
};

// Buscar solicitações por matrícula
export const buscarPorMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;

    const [solicitacoes] = await db.query(
      `SELECT s.*, c.nome_categoria, st.nome_setor
       FROM solicitacoes s
       INNER JOIN categorias_solicitacao c ON s.id_categoria_fk = c.id_categoria
       INNER JOIN setores st ON c.id_setor_fk = st.id_setor
       WHERE s.matricula_solicitante = ?
       ORDER BY s.data_criacao DESC`,
      [matricula]
    );

    res.json({
      success: true,
      solicitacoes
    });

  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar solicitações.'
    });
  }
};

// Listar todas as solicitações (admin)
export const listarTodas = async (req, res) => {
  try {
    const [solicitacoes] = await db.query(
      `SELECT s.*, c.nome_categoria, st.nome_setor
       FROM solicitacoes s
       INNER JOIN categorias_solicitacao c ON s.id_categoria_fk = c.id_categoria
       INNER JOIN setores st ON c.id_setor_fk = st.id_setor
       ORDER BY s.data_criacao DESC`
    );

    res.json({
      success: true,
      solicitacoes
    });

  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar solicitações.'
    });
  }
};

// Buscar solicitação por ID com histórico
export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [solicitacoes] = await db.query(
      `SELECT s.*, c.nome_categoria, st.nome_setor
       FROM solicitacoes s
       INNER JOIN categorias_solicitacao c ON s.id_categoria_fk = c.id_categoria
       INNER JOIN setores st ON c.id_setor_fk = st.id_setor
       WHERE s.id_solicitacao = ?`,
      [id]
    );

    if (solicitacoes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada.'
      });
    }

    // Buscar histórico de movimentações
    const [movimentacoes] = await db.query(
      `SELECT m.*, u.nome_admin
       FROM movimentacoes m
       LEFT JOIN usuarios_admin u ON m.id_usuario_admin_fk = u.id_usuario_admin
       WHERE m.id_solicitacao_fk = ?
       ORDER BY m.data_movimentacao DESC`,
      [id]
    );

    res.json({
      success: true,
      solicitacao: solicitacoes[0],
      movimentacoes
    });

  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar solicitação.'
    });
  }
};

// Atualizar status da solicitação
export const atualizarStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { status_solicitacao, resposta_setor } = req.body;
    const id_usuario_admin = req.user.id;

    await connection.beginTransaction();

    // Buscar status atual
    const [solicitacoes] = await connection.query(
      'SELECT status_solicitacao FROM solicitacoes WHERE id_solicitacao = ?',
      [id]
    );

    if (solicitacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada.'
      });
    }

    const status_anterior = solicitacoes[0].status_solicitacao;

    // Atualizar solicitação
    await connection.query(
      `UPDATE solicitacoes 
       SET status_solicitacao = ?, resposta_setor = ?, data_atualizacao = NOW()
       WHERE id_solicitacao = ?`,
      [status_solicitacao, resposta_setor || null, id]
    );

    // Registrar movimentação
    await connection.query(
      `INSERT INTO movimentacoes 
       (id_solicitacao_fk, id_usuario_admin_fk, status_anterior, status_novo, observacao_movimentacao)
       VALUES (?, ?, ?, ?, ?)`,
      [id, id_usuario_admin, status_anterior, status_solicitacao, resposta_setor || null]
    );

    await connection.commit();

    // Se status for concluída, enviar e-mail para o solicitante
    if (status_solicitacao === 'Concluída') {
      const [solicitacao] = await connection.query(
        'SELECT email_solicitante FROM solicitacoes WHERE id_solicitacao = ?',
        [id]
      );
      if (solicitacao.length > 0 && solicitacao[0].email_solicitante) {
        await sendEmail(
          solicitacao[0].email_solicitante,
          'Sua solicitação foi concluída',
          'Sua solicitação foi finalizada com sucesso pelo setor responsável.',
          `<b>Sua solicitação foi finalizada com sucesso pelo setor responsável.</b>`
        );
      }
    }

    res.json({
      success: true,
      message: 'Status atualizado com sucesso!'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status.'
    });
  } finally {
    connection.release();
  }
};

// Filtrar solicitações
export const filtrarSolicitacoes = async (req, res) => {
  try {
    const { categoria, status, prioridade, local, data_inicio, data_fim } = req.query;

    let query = `
      SELECT s.*, c.nome_categoria, st.nome_setor
      FROM solicitacoes s
      INNER JOIN categorias_solicitacao c ON s.id_categoria_fk = c.id_categoria
      INNER JOIN setores st ON c.id_setor_fk = st.id_setor
      WHERE 1=1
    `;
    
    const params = [];

    if (categoria) {
      query += ' AND c.id_categoria = ?';
      params.push(categoria);
    }

    if (status) {
      query += ' AND s.status_solicitacao = ?';
      params.push(status);
    }

    if (prioridade) {
      query += ' AND s.prioridade = ?';
      params.push(prioridade);
    }

    if (local) {
      query += ' AND s.local_problema LIKE ?';
      params.push(`%${local}%`);
    }

    if (data_inicio) {
      query += ' AND DATE(s.data_criacao) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND DATE(s.data_criacao) <= ?';
      params.push(data_fim);
    }

    query += ' ORDER BY s.data_criacao DESC';

    const [solicitacoes] = await db.query(query, params);

    res.json({
      success: true,
      solicitacoes
    });

  } catch (error) {
    console.error('Erro ao filtrar solicitações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao filtrar solicitações.'
    });
  }
};

// Obter estatísticas
export const obterEstatisticas = async (req, res) => {
  try {
    // Total de solicitações
    const [total] = await db.query(
      'SELECT COUNT(*) as total FROM solicitacoes'
    );

    // Por status
    const [porStatus] = await db.query(
      `SELECT status_solicitacao, COUNT(*) as quantidade
       FROM solicitacoes
       GROUP BY status_solicitacao`
    );

    // Por prioridade
    const [porPrioridade] = await db.query(
      `SELECT prioridade, COUNT(*) as quantidade
       FROM solicitacoes
       GROUP BY prioridade`
    );

    // Por categoria
    const [porCategoria] = await db.query(
      `SELECT c.nome_categoria, COUNT(*) as quantidade
       FROM solicitacoes s
       INNER JOIN categorias_solicitacao c ON s.id_categoria_fk = c.id_categoria
       GROUP BY c.nome_categoria`
    );

    res.json({
      success: true,
      estatisticas: {
        total: total[0].total,
        porStatus,
        porPrioridade,
        porCategoria
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas.'
    });
  }
};
