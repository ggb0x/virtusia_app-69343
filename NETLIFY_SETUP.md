# 🚀 Guia de Deploy do Virtusia no Netlify

Este guia explica como configurar e fazer deploy do Virtusia no Netlify com todas as 6 configurações essenciais.

## 📋 Pré-requisitos

1. Conta no [Netlify](https://netlify.com)
2. Repositório Git com o código do Virtusia
3. Node.js 20+ instalado localmente

## 🔧 Configurações Essenciais do Netlify

### 1. **Build Command (Comando de Build)**
```bash
npm run build
```
- **Onde configurar**: Site Settings → Build & Deploy → Build Settings
- **Descrição**: Comando que o Netlify executará para gerar os arquivos de produção
- **Importante**: Certifique-se de que o comando está correto no `package.json`

### 2. **Publish Directory (Diretório de Publicação)**
```
dist
```
- **Onde configurar**: Site Settings → Build & Deploy → Build Settings
- **Descrição**: Pasta onde estão os arquivos finais após o build
- **Para Vite**: Sempre é `dist`
- **Para Create React App**: Seria `build`

### 3. **Environment Variables (Variáveis de Ambiente)**
```bash
# Configurar em: Site Settings → Environment Variables
VITE_APP_NAME=Virtusia
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://sua-api-backend.herokuapp.com/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... outras variáveis conforme .env.example
```
- **Onde configurar**: Site Settings → Environment Variables
- **Descrição**: Variáveis que o app precisa em produção
- **Importante**: Nunca commitar chaves secretas no código

### 4. **Redirects and Rewrites (Redirecionamentos)**
```toml
# Já configurado no netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
- **Onde configurar**: Arquivo `netlify.toml` (já criado) ou Site Settings → Redirects
- **Descrição**: Essencial para SPAs (Single Page Applications)
- **Função**: Redireciona todas as rotas para index.html

### 5. **Node Version (Versão do Node.js)**
```toml
# Já configurado no netlify.toml
[build.environment]
  NODE_VERSION = "20"
```
- **Onde configurar**: Arquivo `netlify.toml` ou variável de ambiente `NODE_VERSION`
- **Descrição**: Define qual versão do Node.js usar no build
- **Recomendado**: Versão 18 ou 20 (LTS)

### 6. **Headers de Segurança**
```toml
# Já configurado no netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    # ... outros headers
```
- **Onde configurar**: Arquivo `netlify.toml` (já criado)
- **Descrição**: Headers HTTP para segurança
- **Inclui**: CSP, XSS Protection, Frame Options, etc.

## 🚀 Passo a Passo do Deploy

### Método 1: Deploy via Git (Recomendado)

1. **Conectar Repositório**
   - Acesse [Netlify Dashboard](https://app.netlify.com)
   - Clique em "New site from Git"
   - Conecte com GitHub/GitLab/Bitbucket
   - Selecione o repositório do Virtusia

2. **Configurar Build Settings**
   - **Base directory**: `virtusia-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `virtusia-frontend/dist`

3. **Adicionar Variáveis de Ambiente**
   - Vá em Site Settings → Environment Variables
   - Adicione todas as variáveis do `.env.example`
   - Configure URLs de produção

4. **Deploy**
   - Clique em "Deploy site"
   - Aguarde o build completar
   - Site estará disponível na URL fornecida

### Método 2: Deploy Manual

1. **Build Local**
   ```bash
   cd virtusia-frontend
   npm install
   npm run build
   ```

2. **Upload Manual**
   - Acesse Netlify Dashboard
   - Arraste a pasta `dist` para a área de deploy
   - Site será publicado automaticamente

## 🔧 Configurações Avançadas

### Custom Domain (Domínio Personalizado)
1. Vá em Site Settings → Domain Management
2. Clique em "Add custom domain"
3. Configure DNS conforme instruções
4. SSL será configurado automaticamente

### Form Handling (Formulários)
```html
<!-- Para formulários de contato -->
<form netlify>
  <input type="text" name="name" />
  <input type="email" name="email" />
  <button type="submit">Enviar</button>
</form>
```

### Functions (Funções Serverless)
```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify!" })
  }
}
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Build Falha**
   - Verifique se `npm run build` funciona localmente
   - Confirme a versão do Node.js
   - Verifique variáveis de ambiente

2. **404 em Rotas**
   - Confirme se o redirect está configurado
   - Verifique o arquivo `netlify.toml`

3. **Assets Não Carregam**
   - Verifique o `publish directory`
   - Confirme se o build gerou os arquivos corretamente

4. **Variáveis de Ambiente**
   - Prefixo `VITE_` é obrigatório para Vite
   - Rebuilde após adicionar variáveis

## 📊 Monitoramento

### Analytics
- Configure Google Analytics via variável `VITE_GOOGLE_ANALYTICS_ID`
- Use Netlify Analytics (pago) para métricas detalhadas

### Performance
- Netlify automaticamente otimiza assets
- Use Lighthouse para auditar performance
- Configure cache headers (já incluído no `netlify.toml`)

## 🔐 Segurança

### Headers Configurados
- **CSP**: Content Security Policy
- **XSS Protection**: Proteção contra XSS
- **Frame Options**: Previne clickjacking
- **HSTS**: HTTP Strict Transport Security

### Variáveis Sensíveis
- Nunca commite chaves de API
- Use variáveis de ambiente para dados sensíveis
- Configure diferentes valores para dev/prod

## 📱 PWA (Progressive Web App)

Para transformar em PWA:
1. Adicione service worker
2. Configure manifest.json
3. Netlify detectará automaticamente

## 🔄 CI/CD

### Deploy Automático
- Push para branch principal = deploy automático
- Preview deploys para pull requests
- Branch deploys para desenvolvimento

### Webhooks
Configure webhooks para:
- Notificações no Slack/Discord
- Integração com outras ferramentas
- Triggers personalizados

## 📞 Suporte

- [Documentação Netlify](https://docs.netlify.com)
- [Comunidade Netlify](https://community.netlify.com)
- [Status Netlify](https://netlifystatus.com)

---

✅ **Checklist Final**
- [ ] Build command configurado
- [ ] Publish directory correto
- [ ] Variáveis de ambiente adicionadas
- [ ] Redirects configurados
- [ ] Node version definida
- [ ] Headers de segurança ativos
- [ ] SSL habilitado
- [ ] Domínio personalizado (opcional)

🎉 **Parabéns! Seu Virtusia está no ar!**

