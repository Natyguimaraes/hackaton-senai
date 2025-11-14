import jsPDF from 'jspdf';

class ReportService {
  constructor() {
    this.doc = null;
  }

  // Configurações padrão
  getDefaultConfig() {
    return {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margins: { top: 20, right: 15, bottom: 20, left: 15 }
    };
  }

  // Criar novo documento
  createDocument(config = {}) {
    const finalConfig = { ...this.getDefaultConfig(), ...config };
    this.doc = new jsPDF(finalConfig.orientation, finalConfig.unit, finalConfig.format);
    return this.doc;
  }

  // Adicionar cabeçalho SENAI
  addHeader(title) {
    const doc = this.doc;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo/Nome SENAI
    doc.setFontSize(20);
    doc.setTextColor(227, 6, 19); // Cor vermelha SENAI
    doc.setFont(undefined, 'bold');
    doc.text('SENAI', 15, 25);
    
    // Título do relatório
    doc.setFontSize(16);
    doc.setTextColor(0, 59, 122); // Cor azul SENAI
    doc.text(title, 15, 35);
    
    // Data de geração
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR');
    doc.text(`Gerado em: ${dateStr}`, pageWidth - 80, 25);
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 40, pageWidth - 15, 40);
    
    return 45; // Retorna posição Y após cabeçalho
  }

  // Adicionar rodapé
  addFooter() {
    const doc = this.doc;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    
    // Texto do rodapé
    doc.text('Sistema de Solicitações SENAI - Relatório Confidencial', 15, pageHeight - 15);
    
    // Número da página
    const pageCount = doc.getNumberOfPages();
    doc.text(`Página ${pageCount}`, pageWidth - 30, pageHeight - 15);
  }

  // Criar tabela simples manual
  createSimpleTable(headers, rows, startY) {
    const doc = this.doc;
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - 30;
    const colWidth = tableWidth / headers.length;
    let currentY = startY;

    // Cabeçalho da tabela
    doc.setFillColor(0, 59, 122);
    doc.rect(15, currentY, tableWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    headers.forEach((header, index) => {
      doc.text(header, 17 + (index * colWidth), currentY + 6);
    });

    currentY += 8;

    // Linhas da tabela
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);

    rows.forEach((row, rowIndex) => {
      // Cor alternada
      if (rowIndex % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, currentY, tableWidth, 6, 'F');
      }

      row.forEach((cell, colIndex) => {
        const text = String(cell).substring(0, 20); // Limita o texto
        doc.text(text, 17 + (colIndex * colWidth), currentY + 4);
      });

      currentY += 6;

      // Nova página se necessário
      if (currentY > 250) {
        doc.addPage();
        currentY = 30;
      }
    });

    return currentY;
  }

  // Gerar relatório de solicitações
  generateSolicitacoesReport(solicitacoes, filters = {}) {
    try {
      this.createDocument();
      
      let currentY = this.addHeader('Relatório de Solicitações');
      
      // Informações do filtro
      if (Object.keys(filters).length > 0) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('Filtros Aplicados:', 15, currentY + 10);
        
        this.doc.setFont(undefined, 'normal');
        this.doc.setFontSize(10);
        currentY += 15;
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            const filterLabels = {
              status: 'Status',
              prioridade: 'Prioridade',
              categoria: 'Categoria',
              dataInicio: 'Data Início',
              dataFim: 'Data Fim',
              matricula: 'Matrícula'
            };
            this.doc.text(`${filterLabels[key] || key}: ${value}`, 20, currentY);
            currentY += 5;
          }
        });
        
        currentY += 10;
      }

      // Estatísticas resumo
      const stats = this.calculateStats(solicitacoes);
      this.doc.setFontSize(12);
      this.doc.setFont(undefined, 'bold');
      this.doc.text('Resumo Estatístico:', 15, currentY);
      currentY += 10;

      this.doc.setFont(undefined, 'normal');
      this.doc.setFontSize(10);
      this.doc.text(`Total de Solicitações: ${stats.total}`, 20, currentY);
      this.doc.text(`Abertas: ${stats.abertas}`, 20, currentY + 5);
      this.doc.text(`Em Andamento: ${stats.emAndamento}`, 20, currentY + 10);
      this.doc.text(`Concluídas: ${stats.concluidas}`, 20, currentY + 15);
      currentY += 25;

      // Tabela de solicitações
      const headers = ['ID', 'Solicitante', 'Categoria', 'Local', 'Status', 'Prioridade', 'Data'];
      const tableData = solicitacoes.map(sol => [
        sol.id_solicitacao,
        sol.nome_solicitante?.substring(0, 15) || '',
        sol.nome_categoria?.substring(0, 15) || '',
        sol.local_problema?.substring(0, 15) || '',
        sol.status_solicitacao,
        sol.prioridade,
        new Date(sol.data_criacao).toLocaleDateString('pt-BR')
      ]);

      this.createSimpleTable(headers, tableData, currentY);
      this.addFooter();
      
      return this.doc;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error('Falha na geração do relatório: ' + error.message);
    }
  }

  // Gerar relatório por categoria
  generateCategoriaReport(categorias, solicitacoesPorCategoria) {
    try {
      this.createDocument();
      
      let currentY = this.addHeader('Relatório por Categoria');
      
      // Estatísticas por categoria
      this.doc.setFontSize(12);
      this.doc.setFont(undefined, 'bold');
      this.doc.text('Distribuição por Categoria:', 15, currentY + 10);
      currentY += 20;

      categorias.forEach(categoria => {
        const solicitacoes = solicitacoesPorCategoria[categoria.id_categoria] || [];
        const stats = this.calculateStats(solicitacoes);
        
        this.doc.setFont(undefined, 'bold');
        this.doc.setFontSize(11);
        this.doc.text(`${categoria.nome_categoria} (${categoria.nome_setor})`, 20, currentY);
        
        this.doc.setFont(undefined, 'normal');
        this.doc.setFontSize(10);
        this.doc.text(`Total: ${stats.total} | Abertas: ${stats.abertas} | Em Andamento: ${stats.emAndamento} | Concluídas: ${stats.concluidas}`, 25, currentY + 5);
        
        currentY += 15;
        
        if (currentY > 250) { // Nova página se necessário
          this.doc.addPage();
          currentY = 30;
        }
      });

      this.addFooter();
      return this.doc;
    } catch (error) {
      console.error('Erro ao gerar relatório por categoria:', error);
      throw new Error('Falha na geração do relatório por categoria: ' + error.message);
    }
  }

  // Calcular estatísticas
  calculateStats(solicitacoes) {
    return {
      total: solicitacoes.length,
      abertas: solicitacoes.filter(s => s.status_solicitacao === 'Aberta').length,
      emAndamento: solicitacoes.filter(s => s.status_solicitacao === 'Em andamento').length,
      concluidas: solicitacoes.filter(s => s.status_solicitacao === 'Concluída').length
    };
  }

  // Salvar PDF
  save(filename = 'relatorio.pdf') {
    try {
      if (this.doc) {
        this.doc.save(filename);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      throw new Error('Falha ao salvar PDF: ' + error.message);
    }
  }

  // Gerar e baixar relatório de solicitações
  downloadSolicitacoesReport(solicitacoes, filters = {}) {
    try {
      const doc = this.generateSolicitacoesReport(solicitacoes, filters);
      const filename = `relatorio_solicitacoes_${new Date().toISOString().split('T')[0]}.pdf`;
      this.save(filename);
    } catch (error) {
      console.error('Erro ao fazer download do relatório:', error);
      throw error;
    }
  }

  // Gerar e baixar relatório por categoria
  downloadCategoriaReport(categorias, solicitacoesPorCategoria) {
    try {
      const doc = this.generateCategoriaReport(categorias, solicitacoesPorCategoria);
      const filename = `relatorio_categorias_${new Date().toISOString().split('T')[0]}.pdf`;
      this.save(filename);
    } catch (error) {
      console.error('Erro ao fazer download do relatório por categoria:', error);
      throw error;
    }
  }
}

export default new ReportService();