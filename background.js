// Inicializar as configurações padrão quando a extensão é instalada
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensão de Acessibilidade Web instalada');
  
  // Definir as configurações padrão
  chrome.storage.sync.set({
    simplify: true,
    fontSize: 'medium',
    contrast: 'normal',
    showImagesAlt: true,
    readAloud: false
  }, function() {
    console.log('Configurações padrão salvas');
  });
});

// Adicionar ação quando o ícone da extensão é clicado
chrome.action.onClicked.addListener((tab) => {
  // Esta funcionalidade não é necessária se usarmos o popup, mas mantemos
  // como fallback caso o popup não abra
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleAccessibility'
  }).catch(err => {
    console.log('Erro ao enviar mensagem:', err);
  });
});