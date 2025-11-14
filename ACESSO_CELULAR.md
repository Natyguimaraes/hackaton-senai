# 📱 Acesso via Celular - Guia Completo

## 🔧 Configuração Realizada

O sistema foi configurado para permitir acesso via rede local através de qualquer dispositivo conectado na mesma rede Wi-Fi.

### ✅ Alterações Implementadas:

1. **Frontend (Vite)**: Configurado para aceitar conexões de qualquer IP (`host: '0.0.0.0'`)
2. **Backend (Express)**: Configurado para escutar em todos os IPs (`'0.0.0.0'`)
3. **API Dinâmica**: URLs se adaptam automaticamente ao IP de acesso
4. **Imagens**: Referências dinâmicas que funcionam tanto local quanto na rede

## 📋 Passos para Acesso

### 1. **Verificar IP da Máquina**
O IP atual da máquina é: **192.168.0.108**

### 2. **Iniciar os Servidores**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 3. **URLs de Acesso**

#### 💻 **No Computador (Local)**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

#### 📱 **No Celular/Tablet (Rede)**:
- Frontend: **http://192.168.0.108:3000**
- Backend: http://192.168.0.108:3001

### 4. **Verificar Conectividade**

#### **No Celular:**
1. Conectar na **mesma rede Wi-Fi** do computador
2. Abrir navegador (Chrome, Safari, etc.)
3. Digitar: **http://192.168.0.108:3000**
4. O sistema deve carregar normalmente

## 🔍 Troubleshooting

### **Se não conseguir acessar:**

1. **Verificar Firewall**:
   ```bash
   # Executar como Administrador
   netsh advfirewall firewall add rule name="Node.js App" dir=in action=allow protocol=TCP localport=3000
   netsh advfirewall firewall add rule name="Node.js API" dir=in action=allow protocol=TCP localport=3001
   ```

2. **Verificar IP Atual**:
   ```bash
   ipconfig
   ```
   - Procurar por "Adaptador de Rede sem Fio Wi-Fi"
   - Anotar o "Endereço IPv4"

3. **Testar Conectividade**:
   - No celular, fazer ping para o IP
   - Ou acessar primeiro: http://IP:3001/api/health

### **Se o IP mudou:**
- Verificar novo IP: `ipconfig`
- Atualizar as URLs de acesso
- Reiniciar os servidores

## 🌐 Como Funciona

### **Detecção Automática de Host**:
```javascript
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // Se acessando via IP da rede, usar mesmo IP para backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3001/api`;
  }
  
  // Caso contrário, usar localhost
  return 'http://localhost:3001/api';
};
```

### **URLs Dinâmicas para Imagens**:
- Detecta automaticamente se está em localhost ou rede
- Gera URLs corretas para visualização de imagens
- Funciona tanto no computador quanto no celular

## ✅ Funcionalidades Testadas

- ✅ Home page responsiva
- ✅ Login administrativo
- ✅ Dashboard com gráficos
- ✅ Criar solicitações
- ✅ Upload de imagens
- ✅ Acompanhar solicitações
- ✅ Visualização de imagens
- ✅ Export PDF
- ✅ Filtros e busca

## 📱 Melhor Experiência Mobile

### **Recomendações:**
1. **Usar em modo paisagem** para dashboard admin
2. **Chrome ou Safari** para melhor compatibilidade
3. **Conexão Wi-Fi estável** para uploads
4. **Zoom do navegador em 100%** para layout correto

### **Funcionalidades Otimizadas:**
- Interface totalmente responsiva
- Botões touch-friendly
- Formulários adaptados para mobile
- Tabelas com scroll horizontal
- Modais full-screen em telas pequenas

---

## 🚀 Acesso Rápido

### **URL Principal para Celular:**
# http://192.168.0.108:3000

**Credenciais Admin:**
- Email: admin@senai.com.br
- Senha: admin123

---

*Configuração realizada em: 14/11/2025*
*IP da rede: 192.168.0.108*