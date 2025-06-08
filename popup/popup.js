// Elementos do DOM
const simplifyToggle = document.getElementById('toggle-simplify');
const fontSizeSelect = document.getElementById('font-size');
const contrastSelect = document.getElementById('contrast');
const imagesAltToggle = document.getElementById('toggle-images-alt');
const readAloudToggle = document.getElementById('toggle-read-aloud');
const applyBtn = document.getElementById('apply-btn');
const resetBtn = document.getElementById('reset-btn');

// Debug info
console.log('Popup da extensão de Acessibilidade Web carregado');

// Carregar configurações salvas quando o popup abrir
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado, recuperando configurações...');
  
  chrome.storage.sync.get({
    simplify: true,
    fontSize: 'medium',
    contrast: 'normal',
    showImagesAlt: true,
    readAloud: false
  }, (items) => {
    console.log('Configurações recuperadas:', items);
    
    simplifyToggle.checked = items.simplify;
    fontSizeSelect.value = items.fontSize;
    contrastSelect.value = items.contrast;
    imagesAltToggle.checked = items.showImagesAlt;
    readAloudToggle.checked = items.readAloud;
  });
});

// Função para aplicar as configurações
applyBtn.addEventListener('click', () => {
  console.log('Botão Aplicar clicado');
  
  // Salvar configurações
  const settings = {
    simplify: simplifyToggle.checked,
    fontSize: fontSizeSelect.value,
    contrast: contrastSelect.value,
    showImagesAlt: imagesAltToggle.checked,
    readAloud: readAloudToggle.checked
  };
  
  console.log('Configurações a serem salvas:', settings);
  
  chrome.storage.sync.set(settings, () => {
    console.log('Configurações salvas');
  });
  
  // Enviar mensagem para a content script aplicar as mudanças
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      console.log('Enviando mensagem para tab:', tabs[0].id);
      
      chrome.tabs.sendMessage(
        tabs[0].id, 
        {
          action: 'applyAccessibility',
          settings: settings
        },
        (response) => {
          console.log('Resposta recebida:', response);
          
          if (chrome.runtime.lastError) {
            console.error('Erro ao enviar mensagem:', chrome.runtime.lastError);
          }
        }
      );
    } else {
      console.error('Nenhuma aba ativa encontrada');
    }
  });
  
  // Feedback para o usuário
  const originalText = applyBtn.textContent;
  applyBtn.textContent = 'Aplicado!';
  applyBtn.disabled = true;
  
  setTimeout(() => {
    applyBtn.textContent = originalText;
    applyBtn.disabled = false;
  }, 1500);
});

resetBtn.addEventListener('click', () => {
  console.log('Botão Restaurar clicado');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      console.log('Enviando mensagem de reset para tab:', tabs[0].id);
      
      chrome.tabs.sendMessage(
        tabs[0].id, 
        {
          action: 'resetPage'
        },
        (response) => {
          console.log('Resposta do reset recebida:', response);
          
          if (chrome.runtime.lastError) {
            console.error('Erro ao enviar mensagem de reset:', chrome.runtime.lastError);
          }
        }
      );
    } else {
      console.error('Nenhuma aba ativa encontrada para reset');
    }
  });
  
  // Feedback para o usuário
  const originalText = resetBtn.textContent;
  resetBtn.textContent = 'Restaurado!';
  resetBtn.disabled = true;
  
  setTimeout(() => {
    resetBtn.textContent = originalText;
    resetBtn.disabled = false;
  }, 1500);
});

// Debug: ouvinte para alterações nos controles
simplifyToggle.addEventListener('change', () => console.log('Toggle Simplificar alterado:', simplifyToggle.checked));
fontSizeSelect.addEventListener('change', () => console.log('Tamanho da Fonte alterado:', fontSizeSelect.value));
contrastSelect.addEventListener('change', () => console.log('Contraste alterado:', contrastSelect.value));
imagesAltToggle.addEventListener('change', () => console.log('Toggle Texto Alt alterado:', imagesAltToggle.checked));
readAloudToggle.addEventListener('change', () => console.log('Toggle Leitura alterado:', readAloudToggle.checked));