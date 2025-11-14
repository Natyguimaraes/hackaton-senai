import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.senha);
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-banner">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="Banner Admin" className="banner-img" />
      </div>
      <div className="admin-header">
        <div className="header-box">
          <div className="login-icon">🔐</div>
          <h2>Login Administrador</h2>
          <p>Acesso restrito à equipe autorizada</p>
        </div>
      </div>
      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu.email@senai.br"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="back-to-home">
          <button onClick={() => navigate('/')}> 
            ← Voltar para Home
          </button>
        </div>
      </div>
      <div className="admin-footer">
        <p>© 2025 SENAI - Todos os direitos reservados</p>
      </div>
    </div>
  );
}

export default AdminLogin;
