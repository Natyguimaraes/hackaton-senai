import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getServerURL } from '../../services/api';
import { toast } from 'react-toastify';
import { FaSearch, FaClipboardList, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './AcompanharSolicitacoes.css';
import ExportButton from '../../components/ExportButton';

function AcompanharSolicitacoes() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState('');
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarSolicitacoes = async (e) => {
    e.preventDefault();
    if (!matricula.trim()) {
      toast.error('Digite sua matrícula');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/solicitacoes/matricula/${matricula}`);
      setSolicitacoes(response.data.solicitacoes);
      if (response.data.solicitacoes.length === 0) {
        toast.info('Nenhuma solicitação encontrada');
      }
    } catch (error) {
      toast.error('Erro ao buscar solicitações');
    } finally {
      setLoading(false);
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

  return (
    <div className="acompanhar-container">
      <div className="acompanhar-banner">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="Banner Solicitante" className="banner-img" />
      </div>
      <div className="acompanhar-header">
        <div className="header-box">
          <button className="btn btn-outline" onClick={() => navigate('/solicitante')} style={{ marginBottom: 10 }}>
            ← Voltar
          </button>
          <h1><FaClipboardList style={{ marginRight: 8 }} />Acompanhar Solicitações</h1>
          <p>Consulte o status das suas solicitações de manutenção e suporte.</p>
        </div>
      </div>
      <div className="acompanhar-content">
        <div className="search-card">
          <form className="search-form" onSubmit={buscarSolicitacoes}>
            <span className="search-icon"><FaSearch /></span>
            <input
              className="search-input"
              type="text"
              placeholder="Digite sua matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>
        {solicitacoes.length > 0 && (
          <div>
            <div className="solicitacoes-header">
              <h3><FaClipboardList style={{ marginRight: 6 }} />Suas Solicitações</h3>
              <ExportButton 
                type="solicitacoes"
                data={solicitacoes}
                filters={{ matricula }}
                disabled={false}
              />
            </div>
            <div className="solicitations-grid">
              {solicitacoes.map(sol => (
                <div key={sol.id_solicitacao} className="solicitation-card animated-card">
                  <div className="decorative-bg"><FaClipboardList size={100} color="#e0f7fa" style={{position:'absolute',top:'-20px',right:'-20px',opacity:0.13}} /></div>
                  <div className="solicitation-header">
                    <div>
                      <span className="solicitation-id">
                        <FaClipboardList style={{ marginRight: 6 }} />#{sol.id_solicitacao} - {sol.nome_categoria}
                      </span>
                      <div className="solicitation-date">
                        {new Date(sol.data_criacao).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${getStatusBadge(sol.status_solicitacao)}`}>
                        {sol.status_solicitacao === 'Concluída' ? <FaCheckCircle style={{ marginRight: 4, color: '#43aa8b' }} /> : sol.status_solicitacao === 'Em andamento' ? <FaExclamationCircle style={{ marginRight: 4, color: '#f9c74f' }} /> : <FaClipboardList style={{ marginRight: 4, color: '#0077b6' }} />} {sol.status_solicitacao}
                      </span>
                      <br />
                      <span className={`badge ${getPrioridadeBadge(sol.prioridade)}`} style={{ marginTop: '5px' }}>
                        {sol.prioridade}
                      </span>
                    </div>
                  </div>
                  <div className="solicitation-info">
                    <div className="info-row">
                      <span className="info-label">Local:</span>
                      <span className="info-value">{sol.local_problema}</span>
                    </div>
                  </div>
                  <div className="solicitation-description">
                    <span className="info-label">Descrição:</span> {sol.descricao_problema}
                  </div>
                  {sol.path_imagem && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Imagem anexada:</strong>
                      <div style={{ marginTop: '5px' }}>
                        <img 
                          src={`${getServerURL()}${sol.path_imagem}`}
                          alt="Imagem da solicitação"
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto', 
                            maxHeight: '200px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(`${getServerURL()}${sol.path_imagem}`, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                  {sol.resposta_setor && (
                    <div className="response-section">
                      <span className="response-label">Resposta:</span> {sol.resposta_setor}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="acompanhar-footer">
        <p>© 2025 SENAI - Todos os direitos reservados</p>
      </div>
    </div>
  );
}

export default AcompanharSolicitacoes;
