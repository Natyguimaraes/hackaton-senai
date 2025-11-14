import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getServerURL } from '../../services/api';
import { toast } from 'react-toastify';
import './AcompanharSolicitacoes.css';
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
    <div className="solicitante-container">
      <div className="container">
        <button className="btn btn-outline" onClick={() => navigate('/solicitante')}>
          ← Voltar
        </button>
        
        <div className="card" style={{ marginTop: '20px' }}>
          <h2 style={{ marginBottom: '30px', color: 'var(--secondary-color)' }}>
            Acompanhar Solicitações
          </h2>
          
          <form onSubmit={buscarSolicitacoes} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Digite sua matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>

          {solicitacoes.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Suas Solicitações</h3>
                <ExportButton 
                  type="solicitacoes"
                  data={solicitacoes}
                  filters={{ matricula }}
                  disabled={false}
                />
              </div>
              {solicitacoes.map(sol => (
                <div key={sol.id_solicitacao} className="card" style={{ marginBottom: '15px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ color: 'var(--secondary-color)', marginBottom: '5px' }}>
                        #{sol.id_solicitacao} - {sol.nome_categoria}
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                        {new Date(sol.data_criacao).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${getStatusBadge(sol.status_solicitacao)}`}>
                        {sol.status_solicitacao}
                      </span>
                      <br />
                      <span className={`badge ${getPrioridadeBadge(sol.prioridade)}`} style={{ marginTop: '5px' }}>
                        {sol.prioridade}
                      </span>
                    </div>
                  </div>
                  <p><strong>Local:</strong> {sol.local_problema}</p>
                  <p><strong>Descrição:</strong> {sol.descricao_problema}</p>
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
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
                      <strong>Resposta:</strong> {sol.resposta_setor}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcompanharSolicitacoes;
