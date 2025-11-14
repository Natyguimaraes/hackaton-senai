import { useNavigate } from 'react-router-dom';
import { FaPlusCircle, FaClipboardList } from 'react-icons/fa';
import './SolicitanteMenu.css';

function SolicitanteMenu() {
  const navigate = useNavigate();

  return (
    <div className="solicitante-container">
      <div className="solicitante-banner">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="Banner Solicitante" className="banner-img" />
      </div>
      <div className="solicitante-header">
        <div className="header-box">
          <button className="btn-back" onClick={() => navigate('/')}> 
            ← Voltar
          </button>
          <h1>Área do Solicitante</h1>
          <p>Escolha uma opção abaixo</p>
        </div>
      </div>

      <div className="menu-options">
        <div className="menu-card animated-card" onClick={() => navigate('/solicitante/nova')}>
          <div className="decorative-bg"><FaPlusCircle size={100} color="#e0f7fa" style={{position:'absolute',top:'-20px',right:'-20px',opacity:0.13}} /></div>
          <div className="menu-icon"><FaPlusCircle size={60} color="#0077b6" /></div>
          <h2>Nova Solicitação</h2>
          <p>Registre uma nova solicitação de manutenção ou suporte</p>
        </div>

        <div className="menu-card animated-card" onClick={() => navigate('/solicitante/acompanhar')}>
          <div className="decorative-bg"><FaClipboardList size={100} color="#e0f7fa" style={{position:'absolute',top:'-20px',right:'-20px',opacity:0.13}} /></div>
          <div className="menu-icon"><FaClipboardList size={60} color="#0077b6" /></div>
          <h2>Acompanhar Solicitações</h2>
          <p>Consulte o status das suas solicitações</p>
        </div>
      </div>

      <div className="solicitante-footer">
        <p>© 2025 SENAI - Todos os direitos reservados</p>
      </div>
    </div>
  );
}

export default SolicitanteMenu;
