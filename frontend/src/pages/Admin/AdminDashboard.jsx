import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api, { getServerURL } from '../../services/api';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ExportButton from '../../components/ExportButton';
import './AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [filtros, setFiltros] = useState({
    categoria: '',
    status: '',
    prioridade: '',
    local: '',
    data_inicio: '',
    data_fim: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [solResp, catResp, estResp] = await Promise.all([
        api.get('/solicitacoes'),
        api.get('/public/categorias'),
        api.get('/solicitacoes/estatisticas')
      ]);

      setSolicitacoes(solResp.data.solicitacoes);
      setCategorias(catResp.data.categorias);
      setEstatisticas(estResp.data.estatisticas);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      const params = Object.entries(filtros)
        .filter(([_, value]) => value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const response = await api.get('/solicitacoes/filtrar', { params });
      setSolicitacoes(response.data.solicitacoes);
    } catch (error) {
      toast.error('Erro ao aplicar filtros');
    }
  };

  const limparFiltros = () => {
    setFiltros({
      categoria: '',
      status: '',
      prioridade: '',
      local: '',
      data_inicio: '',
      data_fim: ''
    });
    carregarDados();
  };

  const abrirModal = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setSolicitacaoSelecionada(null);
  };

  const atualizarSolicitacao = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/solicitacoes/${solicitacaoSelecionada.id_solicitacao}`, {
        status_solicitacao: solicitacaoSelecionada.status_solicitacao,
        resposta_setor: solicitacaoSelecionada.resposta_setor
      });
      toast.success('Solicitação atualizada com sucesso!');
      fecharModal();
      carregarDados();
    } catch (error) {
      toast.error('Erro ao atualizar solicitação');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Aberta': 'badge-aberta',
      'Em andamento': 'badge-em-andamento',
      'Concluída': 'badge-concluida'
    };
    return badges[status] || 'badge-aberta';
  };

  const getPrioridadeBadge = (prioridade) => {
    const badges = {
      'Baixa': 'badge-baixa',
      'Média': 'badge-media',
      'Urgente': 'badge-urgente'
    };
    return badges[prioridade] || 'badge-media';
  };

  // Dados para gráficos
  const statusData = {
    labels: estatisticas?.porStatus.map(s => s.status_solicitacao) || [],
    datasets: [{
      data: estatisticas?.porStatus.map(s => s.quantidade) || [],
      backgroundColor: ['#ffc107', '#17a2b8', '#28a745']
    }]
  };

  const prioridadeData = {
    labels: estatisticas?.porPrioridade.map(p => p.prioridade) || [],
    datasets: [{
      label: 'Quantidade',
      data: estatisticas?.porPrioridade.map(p => p.quantidade) || [],
      backgroundColor: ['#17a2b8', '#ffc107', '#dc3545']
    }]
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1>Dashboard Administrativo</h1>
            <p>Bem-vindo(a), {user?.nome}</p>
          </div>
          <div className="header-actions">
            <button onClick={logout}>Sair</button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Solicitações</h3>
            <div className="stat-value">{estatisticas?.total || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Abertas</h3>
            <div className="stat-value" style={{ color: '#ffc107' }}>
              {estatisticas?.porStatus.find(s => s.status_solicitacao === 'Aberta')?.quantidade || 0}
            </div>
          </div>
          <div className="stat-card">
            <h3>Em Andamento</h3>
            <div className="stat-value" style={{ color: '#17a2b8' }}>
              {estatisticas?.porStatus.find(s => s.status_solicitacao === 'Em andamento')?.quantidade || 0}
            </div>
          </div>
          <div className="stat-card">
            <h3>Concluídas</h3>
            <div className="stat-value" style={{ color: '#28a745' }}>
              {estatisticas?.porStatus.find(s => s.status_solicitacao === 'Concluída')?.quantidade || 0}
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Distribuição por Status</h3>
            <Pie data={statusData} />
          </div>
          <div className="chart-card">
            <h3>Distribuição por Prioridade</h3>
            <Bar data={prioridadeData} />
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <h3 style={{ marginBottom: '20px' }}>Filtros</h3>
          <div className="filters-grid">
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome_categoria}</option>
              ))}
            </select>

            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos os status</option>
              <option value="Aberta">Aberta</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluída">Concluída</option>
            </select>

            <select
              value={filtros.prioridade}
              onChange={(e) => setFiltros(prev => ({ ...prev, prioridade: e.target.value }))}
            >
              <option value="">Todas as prioridades</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Urgente">Urgente</option>
            </select>

            <input
              type="text"
              placeholder="Local"
              value={filtros.local}
              onChange={(e) => setFiltros(prev => ({ ...prev, local: e.target.value }))}
            />

            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
            />

            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={aplicarFiltros}>
              Aplicar Filtros
            </button>
            <button className="btn btn-outline" onClick={limparFiltros}>
              Limpar Filtros
            </button>
            <ExportButton 
              type="solicitacoes"
              data={solicitacoes}
              filters={filtros}
              disabled={solicitacoes.length === 0}
            />
            <ExportButton 
              type="categorias"
              categorias={categorias}
              solicitacoesPorCategoria={solicitacoes.reduce((acc, sol) => {
                if (!acc[sol.id_categoria_fk]) acc[sol.id_categoria_fk] = [];
                acc[sol.id_categoria_fk].push(sol);
                return acc;
              }, {})}
              disabled={categorias.length === 0}
            />
          </div>
        </div>

        {/* Tabela de Solicitações */}
        <div className="table-responsive">
          <div className="table-container">
            <table className="solicitacoes-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Solicitante</th>
                  <th className="hide-mobile">Categoria</th>
                  <th className="hide-mobile">Local</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th className="hide-mobile">Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.map(sol => (
                  <tr key={sol.id_solicitacao}>
                    <td>{sol.id_solicitacao}</td>
                    <td>
                      <div>
                        <strong>{sol.nome_solicitante}</strong>
                        <div className="mobile-info">
                          <small className="show-mobile">{sol.nome_categoria} • {sol.local_problema}</small>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">{sol.nome_categoria}</td>
                    <td className="hide-mobile">{sol.local_problema}</td>
                    <td>
                      <span className={`badge ${getPrioridadeBadge(sol.prioridade)}`}>
                        {sol.prioridade}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(sol.status_solicitacao)}`}>
                        {sol.status_solicitacao}
                      </span>
                    </td>
                    <td className="hide-mobile">{new Date(sol.data_criacao).toLocaleDateString('pt-BR')}</td>
                    <td className="table-actions">
                      <button className="btn btn-primary" onClick={() => abrirModal(sol)}>
                        Atualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && solicitacaoSelecionada && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Atualizar Solicitação #{solicitacaoSelecionada.id_solicitacao}</h2>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>

            <form onSubmit={atualizarSolicitacao}>
              <div className="form-group">
                <label>Solicitante</label>
                <input type="text" value={solicitacaoSelecionada.nome_solicitante} disabled />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea value={solicitacaoSelecionada.descricao_problema} disabled rows="3" />
              </div>

              {solicitacaoSelecionada.path_imagem && (
                <div className="form-group">
                  <label>Imagem anexada</label>
                  <div style={{ marginTop: '5px' }}>
                    <img 
                      src={`${getServerURL()}${solicitacaoSelecionada.path_imagem}`}
                      alt="Imagem da solicitação"
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto', 
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(`http://localhost:3001${solicitacaoSelecionada.path_imagem}`, '_blank')}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Status</label>
                <select
                  value={solicitacaoSelecionada.status_solicitacao}
                  onChange={(e) => setSolicitacaoSelecionada(prev => ({ 
                    ...prev, 
                    status_solicitacao: e.target.value 
                  }))}
                >
                  <option value="Aberta">Aberta</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>

              <div className="form-group">
                <label>Resposta do Setor</label>
                <textarea
                  value={solicitacaoSelecionada.resposta_setor || ''}
                  onChange={(e) => setSolicitacaoSelecionada(prev => ({ 
                    ...prev, 
                    resposta_setor: e.target.value 
                  }))}
                  rows="4"
                  placeholder="Digite a resposta ou observações..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                  Salvar Alterações
                </button>
                <button type="button" className="btn btn-outline" onClick={fecharModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
