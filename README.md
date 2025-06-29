# 🌟 Virtusia - Sua Jornada Inteligente para uma Vida Mais Saudável

![Virtusia Logo](virtusia-frontend/public/virtusia-icon.svg)

**Virtusia** é um aplicativo revolucionário de nutrição e bem-estar que combina inteligência artificial avançada com design moderno para oferecer uma experiência personalizada e intuitiva na sua jornada de saúde.

## ✨ Principais Funcionalidades

### 🤖 **IA Integrada**
- **Análise Inteligente de Refeições**: Tire uma foto da sua comida e receba análise nutricional completa
- **Sugestões Veganas Personalizadas**: IA sugere alternativas veganas baseadas nas suas preferências
- **Chatbot Nutricional**: Tire dúvidas sobre nutrição com nossa IA especializada
- **Dietas Personalizadas**: Receba planos alimentares baseados em IMC, idade, gênero e objetivos

### 🎨 **Design Visual Moderno**
- **Paleta de Cores Harmoniosa**: Verde musgo + branco + azul claro
- **Gradientes Suaves**: Transições visuais elegantes
- **Ícones SVG**: Gráficos vetoriais de alta qualidade
- **Animações Fluidas**: Experiência interativa com Framer Motion

### 🚀 **Performance Otimizada**
- **React Query**: Gerenciamento inteligente de estado assíncrono
- **Cache Inteligente**: Dados carregam mais rápido
- **Animações Suaves**: Transições naturais e responsivas
- **PWA Ready**: Pronto para ser um Progressive Web App

### 📱 **Funcionalidades Principais**
- **Dashboard Inteligente**: Visão geral do seu progresso diário
- **Análise de Refeições**: Reconhecimento automático de alimentos
- **Metas Personalizadas**: Defina e acompanhe seus objetivos
- **Exercícios Recomendados**: Sugestões baseadas no seu perfil
- **Notificações Push**: Lembretes inteligentes via Firebase

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Framework principal
- **Vite** - Build tool moderna
- **Tailwind CSS 4** - Estilização utilitária
- **Framer Motion** - Animações avançadas
- **React Query (TanStack)** - Gerenciamento de estado
- **Shadcn/UI** - Componentes de interface
- **Lucide React** - Ícones modernos

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **JWT** - Autenticação segura
- **Flask-CORS** - Suporte a CORS
- **Python 3.11** - Linguagem principal

### IA e Integrações
- **OpenAI GPT** - Sugestões veganas inteligentes
- **Gemini AI** - Chatbot nutricional
- **Firebase Cloud Messaging** - Notificações push
- **Computer Vision** - Análise de imagens de alimentos

## 📁 Estrutura do Projeto

```
virtusia_app/
├── virtusia-frontend/          # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── ui/            # Componentes de interface
│   │   │   ├── ai/            # Componentes de IA
│   │   │   ├── auth/          # Autenticação
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── meals/         # Análise de refeições
│   │   │   └── ...
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── contexts/          # Contextos React
│   │   ├── providers/         # Providers (React Query)
│   │   └── assets/            # Assets estáticos
│   ├── public/                # Arquivos públicos
│   ├── netlify.toml          # Configuração Netlify
│   └── package.json          # Dependências
├── virtusia-backend/          # Backend Flask
│   ├── src/
│   │   ├── routes/           # Rotas da API
│   │   │   ├── ai.py         # Endpoints de IA
│   │   │   ├── auth.py       # Autenticação
│   │   │   ├── meals.py      # Refeições
│   │   │   └── ...
│   │   ├── models/           # Modelos do banco
│   │   └── main.py           # Aplicação principal
│   └── requirements.txt      # Dependências Python
├── NETLIFY_SETUP.md          # Guia de deploy
└── README.md                 # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+
- Python 3.11+
- npm ou pnpm

### Frontend
```bash
cd virtusia-frontend
npm install
npm run dev
```

### Backend
```bash
cd virtusia-backend
pip install -r requirements.txt
python src/main.py
```

## 🌐 Deploy no Netlify

O projeto está totalmente configurado para deploy no Netlify. Consulte o arquivo `NETLIFY_SETUP.md` para instruções detalhadas.

### Configurações Essenciais:
1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Configuradas via `.env.example`
4. **Redirects**: SPA redirects configurados
5. **Node Version**: 20 (LTS)
6. **Security Headers**: Headers de segurança incluídos

## 🎯 Melhorias Implementadas

### 🎨 **Design Visual**
- ✅ Paleta de cores moderna (verde musgo + branco + azul claro)
- ✅ Gradientes suaves em toda a interface
- ✅ Ícones SVG personalizados de alta qualidade
- ✅ Efeitos de vidro (glass morphism)
- ✅ Sombras suaves e harmoniosas

### 🤖 **IA Integrada**
- ✅ Campo de texto para sugestões veganas na análise de refeições
- ✅ Integração com ChatGPT para alternativas veganas
- ✅ Chatbot nutricional com Gemini/Manus IA
- ✅ Respostas contextuais e personalizadas

### 🔧 **Backend Aprimorado**
- ✅ Endpoint `/ai/suggest-diet` para dietas personalizadas
- ✅ Sistema de notificações push via Firebase
- ✅ Cálculo automático de IMC e necessidades calóricas
- ✅ Recomendações baseadas em objetivos e perfil

### ⚡ **Frontend Otimizado**
- ✅ React Query para gerenciamento de estado assíncrono
- ✅ Hooks personalizados para todas as operações
- ✅ Cache inteligente e invalidação automática
- ✅ Animações suaves com Framer Motion
- ✅ Componentes animados (cards, botões, loaders)

### 🏷️ **Rebranding Completo**
- ✅ Nome alterado de "DruxNuti" para "Virtusia"
- ✅ Identidade visual atualizada
- ✅ Ícone personalizado criado
- ✅ Metadados e SEO otimizados

### 🚀 **Deploy Ready**
- ✅ Configuração completa para Netlify
- ✅ Arquivo `netlify.toml` configurado
- ✅ Variáveis de ambiente documentadas
- ✅ Headers de segurança implementados
- ✅ Redirects para SPA configurados
- ✅ Guia detalhado de deploy

## 🔐 Segurança

- **JWT Authentication**: Autenticação segura com tokens
- **CORS Configurado**: Proteção contra requisições maliciosas
- **Headers de Segurança**: CSP, XSS Protection, Frame Options
- **Variáveis de Ambiente**: Chaves sensíveis protegidas
- **Validação de Dados**: Validação rigorosa no backend

## 📊 Performance

- **React Query**: Cache inteligente reduz requisições
- **Lazy Loading**: Componentes carregados sob demanda
- **Otimização de Assets**: Compressão automática no build
- **Service Worker Ready**: Preparado para PWA
- **Lighthouse Score**: Otimizado para performance

## 🎨 Componentes Destacados

### Análise de Refeições com IA
```jsx
// Componente com sugestões veganas integradas
<MealAnalysisScreen />
```

### Chatbot Nutricional
```jsx
// IA para responder dúvidas nutricionais
<NutritionChatbot />
```

### Dashboard Animado
```jsx
// Dashboard com animações suaves
<DashboardScreen />
```

## 🔮 Próximos Passos

- [ ] Implementar PWA completo
- [ ] Adicionar modo offline
- [ ] Integrar com wearables
- [ ] Expandir base de alimentos
- [ ] Adicionar receitas personalizadas
- [ ] Implementar gamificação

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

**Equipe Virtusia**
- Website: [virtusia.app](https://virtusia.app)
- Email: contato@virtusia.app
- GitHub: [@virtusia](https://github.com/virtusia)

---

<div align="center">

**🌟 Virtusia - Transformando vidas através da tecnologia e nutrição inteligente 🌟**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/seu-usuario/virtusia)

</div>

