import { useNavigate } from 'react-router-dom';
import { FaUserAlt, FaTools } from 'react-icons/fa';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-banner">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="Banner SENAI" className="banner-img" />
      </div>
      <div className="home-header">
        <div className="header-box">
          <h1>Sistema de Solicitações SENAI</h1>
          <p>Gestão de Manutenção e Suporte Técnico</p>
        </div>
      </div>

      <div className="profile-selection">
        <div className="profile-card animated-card" onClick={() => navigate('/solicitante')}>
          <div className="decorative-bg"><FaUserAlt size={120} color="#e0f7fa" style={{position:'absolute',top:'-30px',right:'-30px',opacity:0.15}} /></div>
          <div className="profile-icon"><FaUserAlt size={80} color="#0077b6" /></div>
          <h2>Solicitante</h2>
          <p>Registre solicitações de manutenção e suporte técnico e acompanhe seu status</p>
          <button className="btn btn-primary ripple">Acessar</button>
        </div>

        <div className="profile-card animated-card" onClick={() => navigate('/admin/login')}>
          <div className="decorative-bg"><FaTools size={120} color="#e0f7fa" style={{position:'absolute',top:'-30px',right:'-30px',opacity:0.15}} /></div>
          <div className="profile-icon"><FaTools size={80} color="#0077b6" /></div>
          <h2>Administrador</h2>
          <p>Gerencie todas as solicitações, atribua responsáveis e acompanhe estatísticas</p>
          <button className="btn btn-secondary ripple">Login Admin</button>
        </div>
      </div>

      <div className="home-footer">
        <p>© 2025 SENAI - Todos os direitos reservados</p>
      </div>
    </div>
  );
}

export default Home;
