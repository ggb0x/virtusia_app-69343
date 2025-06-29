# Estrutura de Pastas e Organização do Projeto DruxNuti

## 1. Estrutura Geral do Projeto

```
druxnuti/
├── mobile/                     # Aplicativo React Native
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── screens/           # Telas do aplicativo
│   │   ├── navigation/        # Configuração de navegação
│   │   ├── services/          # Serviços e APIs
│   │   ├── store/             # Gerenciamento de estado (Redux)
│   │   ├── utils/             # Utilitários e helpers
│   │   ├── assets/            # Imagens, ícones, fontes
│   │   └── types/             # Definições de tipos TypeScript
│   ├── android/               # Código nativo Android
│   ├── ios/                   # Código nativo iOS
│   ├── package.json
│   └── README.md
│
├── backend/                   # API Flask
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/            # Modelos do banco de dados
│   │   ├── routes/            # Endpoints da API
│   │   ├── services/          # Lógica de negócio
│   │   ├── utils/             # Utilitários e helpers
│   │   ├── ai/                # Módulos de IA
│   │   └── config.py          # Configurações
│   ├── migrations/            # Migrações do banco
│   ├── tests/                 # Testes automatizados
│   ├── requirements.txt
│   ├── run.py                 # Ponto de entrada
│   └── README.md
│
├── database/                  # Scripts e schemas do banco
│   ├── schemas/               # Schemas SQL
│   ├── seeds/                 # Dados iniciais
│   └── migrations/            # Migrações manuais
│
├── docs/                      # Documentação
│   ├── api/                   # Documentação da API
│   ├── architecture/          # Documentação de arquitetura
│   └── user-guide/            # Guia do usuário
│
├── deployment/                # Configurações de deploy
│   ├── docker/                # Dockerfiles
│   ├── kubernetes/            # Manifests K8s
│   └── scripts/               # Scripts de deploy
│
└── README.md                  # Documentação principal
```

## 2. Estrutura Detalhada do Mobile (React Native)

```
mobile/src/
├── components/
│   ├── common/                # Componentes genéricos
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Loading/
│   │   └── Modal/
│   ├── forms/                 # Componentes de formulário
│   │   ├── LoginForm/
│   │   ├── ProfileForm/
│   │   └── MealForm/
│   └── charts/                # Componentes de gráficos
│       ├── ProgressChart/
│       ├── CalorieChart/
│       └── WeightChart/
│
├── screens/
│   ├── Auth/                  # Telas de autenticação
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── Dashboard/             # Tela principal
│   │   └── DashboardScreen.tsx
│   ├── Meals/                 # Telas de refeições
│   │   ├── MealAnalysisScreen.tsx
│   │   ├── MealHistoryScreen.tsx
│   │   └── MealDetailsScreen.tsx
│   ├── Exercises/             # Telas de exercícios
│   │   ├── ExerciseListScreen.tsx
│   │   ├── WorkoutScreen.tsx
│   │   └── ExerciseHistoryScreen.tsx
│   ├── Goals/                 # Telas de metas
│   │   ├── GoalsScreen.tsx
│   │   ├── CreateGoalScreen.tsx
│   │   └── ProgressScreen.tsx
│   └── Profile/               # Telas de perfil
│       ├── ProfileScreen.tsx
│       ├── SettingsScreen.tsx
│       └── MeasurementsScreen.tsx
│
├── navigation/
│   ├── AppNavigator.tsx       # Navegação principal
│   ├── AuthNavigator.tsx      # Navegação de autenticação
│   ├── TabNavigator.tsx       # Navegação por abas
│   └── types.ts               # Tipos de navegação
│
├── services/
│   ├── api/                   # Serviços de API
│   │   ├── auth.ts
│   │   ├── meals.ts
│   │   ├── exercises.ts
│   │   ├── goals.ts
│   │   └── users.ts
│   ├── storage/               # Armazenamento local
│   │   └── AsyncStorage.ts
│   ├── camera/                # Serviços de câmera
│   │   └── CameraService.ts
│   └── notifications/         # Notificações push
│       └── NotificationService.ts
│
├── store/                     # Redux store
│   ├── slices/                # Redux slices
│   │   ├── authSlice.ts
│   │   ├── mealsSlice.ts
│   │   ├── exercisesSlice.ts
│   │   └── goalsSlice.ts
│   ├── store.ts               # Configuração do store
│   └── types.ts               # Tipos do store
│
├── utils/
│   ├── constants.ts           # Constantes
│   ├── helpers.ts             # Funções auxiliares
│   ├── validators.ts          # Validações
│   └── formatters.ts          # Formatadores
│
├── assets/
│   ├── images/                # Imagens
│   ├── icons/                 # Ícones
│   └── fonts/                 # Fontes
│
└── types/
    ├── api.ts                 # Tipos da API
    ├── user.ts                # Tipos de usuário
    ├── meal.ts                # Tipos de refeição
    ├── exercise.ts            # Tipos de exercício
    └── goal.ts                # Tipos de meta
```

## 3. Estrutura Detalhada do Backend (Flask)

```
backend/app/
├── models/                    # Modelos SQLAlchemy
│   ├── __init__.py
│   ├── user.py                # Modelo de usuário
│   ├── meal.py                # Modelo de refeição
│   ├── food.py                # Modelo de alimento
│   ├── exercise.py            # Modelo de exercício
│   ├── goal.py                # Modelo de meta
│   ├── measurement.py         # Modelo de medidas
│   └── recommendation.py      # Modelo de recomendações
│
├── routes/                    # Endpoints da API
│   ├── __init__.py
│   ├── auth.py                # Rotas de autenticação
│   ├── users.py               # Rotas de usuários
│   ├── meals.py               # Rotas de refeições
│   ├── exercises.py           # Rotas de exercícios
│   ├── goals.py               # Rotas de metas
│   ├── measurements.py        # Rotas de medidas
│   └── recommendations.py     # Rotas de recomendações
│
├── services/                  # Lógica de negócio
│   ├── __init__.py
│   ├── auth_service.py        # Serviços de autenticação
│   ├── meal_service.py        # Serviços de refeições
│   ├── exercise_service.py    # Serviços de exercícios
│   ├── goal_service.py        # Serviços de metas
│   ├── nutrition_service.py   # Serviços de nutrição
│   └── recommendation_service.py # Serviços de recomendações
│
├── ai/                        # Módulos de IA
│   ├── __init__.py
│   ├── image_analysis/        # Análise de imagem
│   │   ├── food_detector.py   # Detecção de alimentos
│   │   ├── portion_estimator.py # Estimativa de porções
│   │   └── nutrition_analyzer.py # Análise nutricional
│   ├── recommendations/       # Sistema de recomendações
│   │   ├── meal_recommender.py # Recomendações de refeições
│   │   ├── exercise_recommender.py # Recomendações de exercícios
│   │   └── goal_recommender.py # Recomendações de metas
│   └── models/                # Modelos de ML
│       ├── food_classification.py
│       └── portion_estimation.py
│
├── utils/                     # Utilitários
│   ├── __init__.py
│   ├── decorators.py          # Decoradores customizados
│   ├── validators.py          # Validadores
│   ├── helpers.py             # Funções auxiliares
│   ├── image_processing.py    # Processamento de imagem
│   └── external_apis.py       # Integração com APIs externas
│
├── __init__.py                # Inicialização da aplicação
└── config.py                  # Configurações
```

## 4. Configurações e Dependências

### 4.1. Mobile - package.json

```json
{
  "name": "druxnuti-mobile",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.1.0",
    "axios": "^1.4.0",
    "react-native-camera": "^4.2.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-async-storage": "^1.19.0",
    "react-native-push-notification": "^8.1.0",
    "react-native-chart-kit": "^6.12.0",
    "react-native-image-picker": "^5.6.0",
    "react-native-permissions": "^3.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.72.0",
    "typescript": "^5.1.0",
    "eslint": "^8.42.0",
    "prettier": "^2.8.0"
  }
}
```

### 4.2. Backend - requirements.txt

```
Flask==2.3.2
Flask-RESTful==0.3.10
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.4
Flask-JWT-Extended==4.5.2
Flask-CORS==4.0.0
psycopg2-binary==2.9.6
Pillow==10.0.0
opencv-python==4.8.0
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
tensorflow==2.13.0
torch==2.0.1
torchvision==0.15.2
requests==2.31.0
celery==5.3.1
redis==4.6.0
python-dotenv==1.0.0
gunicorn==21.2.0
pytest==7.4.0
pytest-flask==1.2.0
```

## 5. Convenções de Código

### 5.1. Nomenclatura

**TypeScript/JavaScript (Mobile):**
- Componentes: PascalCase (ex: `MealAnalysisScreen`)
- Funções e variáveis: camelCase (ex: `analyzeMeal`)
- Constantes: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- Arquivos: kebab-case (ex: `meal-analysis-screen.tsx`)

**Python (Backend):**
- Classes: PascalCase (ex: `MealService`)
- Funções e variáveis: snake_case (ex: `analyze_meal`)
- Constantes: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- Arquivos: snake_case (ex: `meal_service.py`)

### 5.2. Estrutura de Commits

```
type(scope): description

Types:
- feat: nova funcionalidade
- fix: correção de bug
- docs: documentação
- style: formatação
- refactor: refatoração
- test: testes
- chore: tarefas de manutenção

Exemplos:
feat(mobile): add meal analysis screen
fix(backend): resolve authentication issue
docs(api): update endpoint documentation
```

### 5.3. Testes

**Mobile (Jest + React Native Testing Library):**
```
mobile/src/__tests__/
├── components/
├── screens/
├── services/
└── utils/
```

**Backend (pytest):**
```
backend/tests/
├── unit/
│   ├── test_models.py
│   ├── test_services.py
│   └── test_utils.py
├── integration/
│   ├── test_auth_routes.py
│   ├── test_meal_routes.py
│   └── test_exercise_routes.py
└── fixtures/
    └── test_data.py
```

## 6. Configuração de Desenvolvimento

### 6.1. Variáveis de Ambiente

**Mobile (.env):**
```
API_BASE_URL=http://localhost:5000/api/v1
ENVIRONMENT=development
```

**Backend (.env):**
```
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/druxnuti
JWT_SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
FATSECRET_API_KEY=your-fatsecret-key
FATSECRET_API_SECRET=your-fatsecret-secret
```

### 6.2. Scripts de Desenvolvimento

**Mobile (package.json scripts):**
```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

**Backend (Makefile):**
```makefile
install:
	pip install -r requirements.txt

run:
	python run.py

test:
	pytest

migrate:
	flask db upgrade

seed:
	python scripts/seed_database.py

lint:
	flake8 app/
```

Esta estrutura organizacional garante que o projeto seja escalável, maintível e siga as melhores práticas de desenvolvimento para ambas as plataformas (mobile e backend).

