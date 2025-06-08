// Adicione no início do arquivo content.js
console.log('====== EXTENSÃO DE ACESSIBILIDADE WEB ======');
console.log('Content script carregado em: ' + window.location.href);

// Estado global da extensão
let originalPage = null;
let isSimplifiedMode = false;
let readingVoice = null;
let currentSettings = {};
let readingInterval = null;

function applyDirectStyles(settings) {
  console.log('Aplicando estilos diretamente com configurações:', settings);
  
  // Remover estilos anteriores
  const oldStyles = document.getElementById('accessibility-styles');
  if (oldStyles) {
    oldStyles.remove();
  }
  
  // Criar novos estilos
  const styleEl = document.createElement('style');
  styleEl.id = 'accessibility-styles';
  
  let css = '';
  
  // Aplicar tamanho da fonte
  if (settings.fontSize === 'medium') {
    css += 'body, p, div, span, a, h1, h2, h3, h4, h5, h6 { font-size: 18px !important; }';
  } else if (settings.fontSize === 'large') {
    css += 'body, p, div, span, a, h1, h2, h3, h4, h5, h6 { font-size: 22px !important; }';
  } else if (settings.fontSize === 'x-large') {
    css += 'body, p, div, span, a, h1, h2, h3, h4, h5, h6 { font-size: 26px !important; }';
  }
  
  // Aplicar contraste
  if (settings.contrast === 'high') {
    css += 'body { background-color: #000 !important; color: #fff !important; }';
    css += 'a, button, input, select, textarea { color: #ffff00 !important; }';
  }
  
  // Mostrar texto alternativo para imagens
  if (settings.showImagesAlt) {
    css += '.accessibility-alt-text { display: block !important; }';
  } else {
    css += '.accessibility-alt-text { display: none !important; }';
  }
  
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
  
  // Adicionar texto alternativo para imagens se necessário
  if (settings.showImagesAlt && !document.querySelector('.accessibility-alt-text')) {
    const images = document.querySelectorAll('img');
    console.log(`Processando ${images.length} imagens para texto alternativo`);
    
    images.forEach(img => {
      if (!img.nextElementSibling || !img.nextElementSibling.classList.contains('accessibility-alt-text')) {
        const altText = img.getAttribute('alt') || 'Imagem sem descrição';
        const altElement = document.createElement('div');
        altElement.className = 'accessibility-alt-text';
        altElement.style.fontSize = '16px';
        altElement.style.padding = '5px';
        altElement.style.backgroundColor = '#f0f0f0';
        altElement.style.color = '#333';
        altElement.style.border = '1px solid #ccc';
        altElement.style.margin = '5px 0';
        altElement.textContent = `Descrição da imagem: ${altText}`;
        
        img.insertAdjacentElement('afterend', altElement);
      }
    });
  }
  
  // Configurar leitura por voz se ativada
  if (settings.readAloud) {
    setupSimpleVoiceReading();
  }
  
  console.log('Estilos aplicados com sucesso!');
}

// Configuração simples para leitura por voz
function setupSimpleVoiceReading() {
  // Verificar se já existe o controle de voz
  if (document.getElementById('accessibility-voice-control')) {
    return;
  }
  
  // Criar controles de voz simples
  const voiceControl = document.createElement('div');
  voiceControl.id = 'accessibility-voice-control';
  voiceControl.style.position = 'fixed';
  voiceControl.style.bottom = '20px';
  voiceControl.style.right = '20px';
  voiceControl.style.backgroundColor = '#4CAF50';
  voiceControl.style.color = 'white';
  voiceControl.style.padding = '10px';
  voiceControl.style.borderRadius = '5px';
  voiceControl.style.zIndex = '9999';
  voiceControl.innerHTML = `
    <button id="voice-play-btn" style="margin-right: 10px; padding: 5px 10px;">Ler</button>
    <button id="voice-stop-btn" style="padding: 5px 10px;">Parar</button>
  `;
  
  document.body.appendChild(voiceControl);
  
  // Adicionar eventos
  document.getElementById('voice-play-btn').addEventListener('click', () => {
    console.log('Iniciando leitura por voz');
    // Selecionar parágrafos visíveis
    const paragraphs = Array.from(document.querySelectorAll('p, h1, h2, h3'))
      .filter(el => el.offsetParent !== null); // Elementos visíveis
    
    if (paragraphs.length > 0) {
      // Ler o primeiro parágrafo como teste
      const text = paragraphs[0].textContent.trim();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  });
  
  document.getElementById('voice-stop-btn').addEventListener('click', () => {
    console.log('Parando leitura por voz');
    window.speechSynthesis.cancel();
  });
}

// Carregar configurações quando o script é inicializado
chrome.storage.sync.get({
  simplify: true,
  fontSize: 'medium',
  contrast: 'normal',
  showImagesAlt: true,
  readAloud: false
}, (items) => {
  console.log('Configurações carregadas:', items);
  currentSettings = items;
  
  // Não aplicar automaticamente para evitar problemas iniciais
  // Deixar o usuário clicar em "Aplicar" primeiro
});

// Ouvinte de mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Mensagem recebida no content script:', message);
  
  try {
    if (message.action === 'applyAccessibility') {
      console.log('Aplicando configurações de acessibilidade:', message.settings);
      currentSettings = message.settings;
      
      // Usar a abordagem direta em vez do overlay
      applyDirectStyles(currentSettings);
      
      sendResponse({status: 'success', message: 'Configurações aplicadas com sucesso'});
    } else if (message.action === 'resetPage') {
      console.log('Resetando a página para o estado original');
      
      // Remover estilos
      const styles = document.getElementById('accessibility-styles');
      if (styles) {
        styles.remove();
      }
      
      // Remover textos alternativos
      const altTexts = document.querySelectorAll('.accessibility-alt-text');
      altTexts.forEach(el => el.remove());
      
      // Remover controle de voz
      const voiceControl = document.getElementById('accessibility-voice-control');
      if (voiceControl) {
        voiceControl.remove();
      }
      
      // Parar leitura
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      sendResponse({status: 'success', message: 'Página restaurada com sucesso'});
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    sendResponse({status: 'error', message: error.toString()});
  }
  
  return true; // Indica que a resposta será assíncrona
});

console.log('Content script configurado e pronto para receber comandos');