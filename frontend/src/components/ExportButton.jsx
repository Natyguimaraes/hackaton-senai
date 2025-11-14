import { useState } from 'react';
import reportService from '../services/reportService';
import './ExportButton.css';

const ExportButton = ({ 
  type = 'solicitacoes', 
  data = [], 
  filters = {},
  categorias = [],
  solicitacoesPorCategoria = {},
  disabled = false 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    // Validações específicas por tipo
    if (type === 'categorias') {
      if (disabled || categorias.length === 0) {
        alert('Não há categorias para exportar!');
        return;
      }
    } else {
      if (disabled || data.length === 0) {
        alert('Não há dados para exportar!');
        return;
      }
    }

    setIsExporting(true);
    
    try {
      switch (type) {
        case 'solicitacoes':
          await reportService.downloadSolicitacoesReport(data, filters);
          break;
        case 'categorias':
          await reportService.downloadCategoriaReport(categorias, solicitacoesPorCategoria);
          break;
        default:
          await reportService.downloadSolicitacoesReport(data, filters);
      }
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      const errorMessage = error.message || 'Erro desconhecido ao gerar relatório';
      alert(`Erro ao gerar relatório: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonText = () => {
    if (isExporting) return 'Gerando...';
    
    switch (type) {
      case 'categorias':
        return 'Exportar por Categoria';
      default:
        return 'Exportar PDF';
    }
  };

  const getIcon = () => {
    if (isExporting) return '⏳';
    return '📄';
  };

  return (
    <button
      className={`export-button ${disabled ? 'disabled' : ''} ${isExporting ? 'loading' : ''}`}
      onClick={handleExport}
      disabled={disabled || isExporting}
      title={disabled ? 'Não há dados para exportar' : 'Baixar relatório em PDF'}
    >
      <span className="export-icon">{getIcon()}</span>
      <span className="export-text">{getButtonText()}</span>
    </button>
  );
};

export default ExportButton;