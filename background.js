console.log('Background service worker iniciado');

const DEFAULT_SETTINGS = {
  simplify: true,
  fontSize: 'medium',
  contrast: 'normal',
  showImagesAlt: true,
  readAloud: false
};

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extensão instalada/atualizada:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Primeira instalação - configurando valores padrão');
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  } else if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Atualização: ${previousVersion} → ${currentVersion}`);
    
    const currentSettings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    const mergedSettings = { ...DEFAULT_SETTINGS, ...currentSettings };
    await chrome.storage.sync.set(mergedSettings);
  }
  
  chrome.contextMenus.create({
    id: 'toggleAccessibility',
    title: 'Ativar/Desativar Acessibilidade',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'readSelectedText',
    title: 'Ler Texto Selecionado',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  
  try {
    if (info.menuItemId === 'toggleAccessibility') {
      const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      
      await ensureContentScriptLoaded(tab.id);
      
      chrome.tabs.sendMessage(tab.id, {
        action: settings.simplify ? 'resetPage' : 'applyAccessibility',
        settings: settings.simplify ? DEFAULT_SETTINGS : settings
      });
      
      await chrome.storage.sync.set({ 
        ...settings, 
        simplify: !settings.simplify 
      });
      
    } else if (info.menuItemId === 'readSelectedText' && info.selectionText) {
      await ensureContentScriptLoaded(tab.id);
      
      chrome.tabs.sendMessage(tab.id, {
        action: 'readText',
        text: selectionText
      });
    }
  } catch (error) {
    console.error('Erro no menu de contexto:', error);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  console.log('Comando recebido:', command);
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    
    await ensureContentScriptLoaded(tab.id);
    
    switch (command) {
      case 'toggle-accessibility':
        const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
        chrome.tabs.sendMessage(tab.id, {
          action: settings.simplify ? 'resetPage' : 'applyAccessibility',
          settings: settings
        });
        break;
        
      case 'increase-font':
        await adjustFontSize(tab.id, 1);
        break;
        
      case 'decrease-font':
        await adjustFontSize(tab.id, -1);
        break;
        
      case 'toggle-contrast':
        await toggleContrast(tab.id);
        break;
    }
  } catch (error) {
    console.error('Erro ao executar comando:', error);
  }
});

async function ensureContentScriptLoaded(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
  } catch (error) {
    console.log('Content script não encontrado, injetando...');
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content/content.js']
    });
    
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['content/content.css']
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function adjustFontSize(tabId, direction) {
  const settings = await chrome.storage.sync.get(['fontSize']);
  const sizes = ['normal', 'medium', 'large', 'x-large'];
  const currentIndex = sizes.indexOf(settings.fontSize || 'medium');
  const newIndex = Math.max(0, Math.min(sizes.length - 1, currentIndex + direction));
  
  if (newIndex !== currentIndex) {
    const newSettings = { ...settings, fontSize: sizes[newIndex] };
    await chrome.storage.sync.set(newSettings);
    
    chrome.tabs.sendMessage(tabId, {
      action: 'applyAccessibility',
      settings: await chrome.storage.sync.get(DEFAULT_SETTINGS)
    });
  }
}

async function toggleContrast(tabId) {
  const settings = await chrome.storage.sync.get(['contrast']);
  const newContrast = settings.contrast === 'high' ? 'normal' : 'high';
  
  await chrome.storage.sync.set({ ...settings, contrast: newContrast });
  
  chrome.tabs.sendMessage(tabId, {
    action: 'applyAccessibility',
    settings: await chrome.storage.sync.get(DEFAULT_SETTINGS)
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mensagem recebida no background:', request);
  
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tabId: tabs[0]?.id, url: tabs[0]?.url });
    });
    return true;
  }
  
  if (request.action === 'reportError') {
    console.error('Erro reportado:', request.error);
    chrome.storage.local.set({
      lastError: {
        timestamp: new Date().toISOString(),
        error: request.error,
        url: sender.tab?.url
      }
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.storage.sync.get(['autoApply'], async (items) => {
      if (items.autoApply) {
        try {
          await ensureContentScriptLoaded(tabId);
          const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
          
          chrome.tabs.sendMessage(tabId, {
            action: 'applyAccessibility',
            settings: settings
          });
        } catch (error) {
          console.log('Não foi possível aplicar configurações automaticamente');
        }
      }
    });
  }
});

console.log('Background service worker configurado');