# Extensão de Acessibilidade Web - Projeto Integrador Extensionista

## Visão Geral do Projeto

Esta extensão foi desenvolvida como parte do Projeto Integrador do 5º período do curso de Ciência da Computação. O objetivo principal é promover a inclusão digital através de uma ferramenta que torna páginas web mais acessíveis para pessoas com deficiência intelectual, idosos e usuários com dificuldades visuais ou de leitura.

## Funcionalidades Implementadas

### 1. Simplificação de Página
A funcionalidade extrai o conteúdo principal da página e o apresenta em um formato limpo e organizado, removendo elementos desnecessários como anúncios, menus complexos e scripts visuais que podem confundir o usuário.

### 2. Ajuste de Tamanho de Fonte
Oferece três opções de tamanho (Médio, Grande e Muito Grande) que se aplicam a todos os elementos de texto da página, incluindo títulos e parágrafos.

### 3. Alto Contraste
Implementa um modo de alto contraste com fundo preto e texto branco, com links em amarelo para máxima visibilidade.

### 4. Descrição de Imagens
Exibe automaticamente o texto alternativo (alt text) das imagens abaixo delas, ajudando usuários com leitores de tela ou dificuldades cognitivas.

### 5. Leitura por Voz
Sistema completo de leitura que percorre todos os elementos de texto da página, com controles de reprodução, pausa e velocidade.

## Estrutura do Projeto e Desenvolvimento

### manifest.json
**Como foi feito:** Configurei o manifest seguindo a versão 3 das extensões do Chrome, definindo permissões mínimas necessárias (activeTab e storage) para garantir a privacidade do usuário.

**Dificuldades:** A migração do Manifest V2 para V3 foi desafiadora, especialmente a mudança de background pages para service workers. Tive que adaptar toda a lógica de background para funcionar com o novo modelo.

**Facilidades:** A documentação do Chrome é bem completa, o que facilitou entender as permissões necessárias.

### background.js
**Como foi feito:** Implementei um service worker simples que inicializa as configurações padrão quando a extensão é instalada pela primeira vez.

**Dificuldades:** Entender o ciclo de vida dos service workers foi complicado no início, pois eles são desativados automaticamente após um período de inatividade.

**Facilidades:** A implementação final ficou simples, apenas salvando as configurações iniciais no storage.

### popup/popup.html e popup.css
**Como foi feito:** Criei uma interface limpa e intuitiva usando HTML semântico e CSS moderno. Usei flexbox para o layout e transições suaves para melhorar a experiência do usuário.

**Dificuldades:** Garantir que o popup tivesse um tamanho adequado e que todos os elementos fossem facilmente clicáveis foi um desafio de UX.

**Facilidades:** Minha experiência com CSS facilitou a criação de uma interface visualmente agradável e responsiva.

### popup/popup.js
**Como foi feito:** Implementei a lógica de comunicação entre o popup e o content script usando a API de mensagens do Chrome. O script salva as preferências do usuário e envia comandos para aplicar as mudanças.

**Dificuldades:** 
- Debugar a comunicação entre popup e content script foi complexo, pois são contextos de execução diferentes
- Lidar com respostas assíncronas das mensagens exigiu entender bem Promises e callbacks

**Facilidades:** A API chrome.storage.sync facilitou muito a persistência das configurações entre sessões.

### content/content.js (Arquivo mais complexo)
**Como foi feito:** Este é o coração da extensão. Implementei cada funcionalidade de forma modular:

1. **Sistema de estilos dinâmicos:** Criei uma função que injeta CSS diretamente no DOM baseado nas configurações
2. **Simplificação de página:** Desenvolvi um algoritmo que identifica o conteúdo principal usando seletores comuns e heurísticas
3. **Leitura por voz:** Implementei um sistema completo usando a Web Speech API

**Dificuldades principais:**
- **Preservar o estado original da página:** Tive que criar um sistema para salvar todos os estilos originais antes de aplicar mudanças
- **Compatibilidade entre sites:** Cada site tem uma estrutura diferente, então criar seletores CSS que funcionem universalmente foi muito desafiador
- **Web Speech API:** A API tem limitações e comportamentos inconsistentes entre navegadores. Tive que implementar tratamento de erros robusto
- **Performance:** Aplicar mudanças em páginas grandes sem travar o navegador exigiu otimizações cuidadosas

**Facilidades:** 
- JavaScript moderno (ES6+) tornou o código mais limpo e legível
- As APIs do Chrome são bem documentadas

### content/content.css
**Como foi feito:** Criei classes CSS modulares para cada funcionalidade, usando !important quando necessário para sobrescrever estilos dos sites.

**Dificuldades:** Garantir que os estilos da extensão sempre tenham precedência sobre os estilos do site foi complexo.

**Facilidades:** Minha experiência com CSS ajudou a criar seletores eficientes e estilos que funcionam bem em diferentes contextos.

## Desafios Técnicos Superados

### 1. Isolamento de Contexto
O maior desafio foi entender que content scripts rodam em um contexto isolado. Não podem acessar variáveis JavaScript da página diretamente, apenas o DOM.

### 2. Persistência de Estado
Implementar um sistema que preserva o estado original da página para poder restaurá-la foi complexo, especialmente considerando páginas dinâmicas que mudam após o carregamento.

### 3. Compatibilidade Universal
Fazer a extensão funcionar em qualquer site foi extremamente desafiador. Sites modernos usam Shadow DOM, frameworks JavaScript complexos e estilos inline que dificultam a aplicação uniforme de mudanças.

### 4. Performance em Páginas Grandes
Páginas com milhares de elementos podem travar ao aplicar mudanças. Tive que implementar otimizações como:
- Processar elementos em lotes
- Usar seletores CSS eficientes
- Evitar reflows desnecessários do DOM

## Fontes e Referências

### Documentação Oficial
- **Chrome Extensions Documentation**: https://developer.chrome.com/docs/extensions/
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Chrome Storage API**: https://developer.chrome.com/docs/extensions/reference/storage/

### Tutoriais e Guias
- **Building Chrome Extensions**: https://www.freecodecamp.org/news/building-chrome-extension/
- **Accessibility Best Practices**: https://www.w3.org/WAI/WCAG21/quickref/
- **CSS Specificity and !important**: https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity

### Recursos de Acessibilidade
- **ARIA Guidelines**: https://www.w3.org/TR/wai-aria-practices-1.1/
- **Web Content Accessibility Guidelines (WCAG)**: https://www.w3.org/WAI/WCAG21/quickref/
- **Chrome Accessibility Developer Tools**: https://developer.chrome.com/docs/devtools/accessibility/reference/

### Comunidades e Fóruns
- **Stack Overflow - Chrome Extensions**: Várias soluções para problemas específicos
- **Chrome Extensions Google Group**: Discussões sobre melhores práticas
- **Reddit r/webdev**: Feedback sobre acessibilidade web

## Aprendizados e Conclusão

Este projeto me proporcionou uma compreensão profunda sobre:

1. **Desenvolvimento de extensões**: Aprendi sobre o modelo de segurança do Chrome, comunicação entre componentes e APIs específicas
2. **Acessibilidade web**: Entendi melhor as necessidades de usuários com deficiências e como a tecnologia pode ajudar
3. **JavaScript avançado**: Melhorei significativamente minhas habilidades com manipulação do DOM, eventos e programação assíncrona
4. **Debugging complexo**: Aprendi a debugar em múltiplos contextos (popup, content script, página web)

O maior aprendizado foi perceber que acessibilidade não é apenas adicionar algumas funcionalidades, mas pensar em como diferentes usuários interagem com a web. Cada site é único, e criar uma solução universal é um desafio constante que exige criatividade e persistência.

## Instalação e Uso

1. Clone o repositório
2. Crie a pasta `icons` na raiz do projeto
3. Gere os ícones PNG a partir do SVG fornecido (icon.svg):
   - icon16.png (16x16 pixels)
   - icon48.png (48x48 pixels)
   - icon128.png (128x128 pixels)
   - Você pode usar ferramentas online como https://cloudconvert.com/svg-to-png
4. Abra o Chrome e acesse `chrome://extensions/`
5. Ative o "Modo do desenvolvedor"
6. Clique em "Carregar sem compactação"
7. Selecione a pasta do projeto
8. A extensão aparecerá na barra de ferramentas

## Próximos Passos

- Adicionar suporte para mais idiomas na leitura por voz
- Implementar atalhos de teclado para todas as funcionalidades
- Criar perfis de configuração salvos para diferentes necessidades
- Melhorar a detecção automática de conteúdo principal
- Adicionar suporte para vídeos com legendas automáticas
- Melhorar a usubilidade do teclador nos navegadores, facilitanto a mobilidade do cursos e entre os itens
