# Arquitetura e Estrutura Técnica do DruxNuti

## 1. Visão Geral da Arquitetura

O aplicativo DruxNuti será desenvolvido seguindo uma arquitetura de três camadas (3-tier architecture), separando claramente a apresentação, lógica de negócio e persistência de dados. Esta abordagem garante escalabilidade, manutenibilidade e facilita futuras expansões do sistema.

### 1.1. Componentes Principais

A arquitetura do DruxNuti é composta pelos seguintes componentes principais:

**Frontend Mobile (Camada de Apresentação):**
- Aplicativo móvel desenvolvido em React Native
- Interface de usuário responsiva e intuitiva
- Gerenciamento de estado local com Redux ou Context API
- Integração com câmera e sensores do dispositivo
- Comunicação com backend via APIs REST

**Backend API (Camada de Lógica de Negócio):**
- Servidor desenvolvido em Flask (Python)
- APIs REST para comunicação com o frontend
- Processamento de imagens e integração com IA
- Autenticação e autorização de usuários
- Lógica de recomendações e análises

**Banco de Dados (Camada de Persistência):**
- PostgreSQL como banco de dados principal
- Armazenamento de dados de usuários, refeições, exercícios e metas
- Estrutura relacional otimizada para consultas complexas
- Backup e recuperação automatizados

**Serviços Externos:**
- APIs de nutrição (FatSecret, TACO API)
- Serviços de IA para análise de imagem
- Serviços de armazenamento de imagens (AWS S3 ou similar)
- Serviços de notificação push

## 2. Stack Tecnológico Escolhido

### 2.1. Frontend Mobile - React Native

A escolha do React Native para o desenvolvimento do frontend móvel se baseia em várias vantagens identificadas durante a pesquisa técnica:

**Vantagens do React Native:**
- Desenvolvimento multiplataforma com código único para iOS e Android
- Performance próxima ao nativo devido à compilação para código nativo
- Vasta comunidade e ecossistema de bibliotecas
- Facilidade de manutenção e atualizações
- Acesso nativo a recursos do dispositivo (câmera, sensores, notificações)
- Possibilidade de reutilização de código entre web e mobile

**Bibliotecas e Dependências Principais:**
- **React Navigation**: Navegação entre telas
- **React Native Camera**: Acesso à câmera para análise de refeições
- **Redux Toolkit**: Gerenciamento de estado global
- **Axios**: Comunicação HTTP com o backend
- **React Native Vector Icons**: Ícones consistentes
- **React Native Async Storage**: Armazenamento local
- **React Native Push Notification**: Notificações push
- **React Native Charts**: Visualização de dados e progresso

### 2.2. Backend API - Flask

O Flask foi escolhido como framework backend devido à sua simplicidade, flexibilidade e excelente integração com bibliotecas de IA e processamento de dados:

**Vantagens do Flask:**
- Framework leve e flexível
- Excelente para desenvolvimento de APIs REST
- Integração nativa com bibliotecas Python de IA (TensorFlow, PyTorch, OpenCV)
- Facilidade de deployment e escalabilidade
- Vasta documentação e comunidade ativa

**Bibliotecas e Dependências Principais:**
- **Flask-RESTful**: Criação de APIs REST estruturadas
- **Flask-SQLAlchemy**: ORM para interação com banco de dados
- **Flask-Migrate**: Migrações de banco de dados
- **Flask-JWT-Extended**: Autenticação JWT
- **Flask-CORS**: Suporte a CORS para comunicação com frontend
- **Pillow**: Processamento de imagens
- **OpenCV**: Análise avançada de imagens
- **Requests**: Comunicação com APIs externas
- **Celery**: Processamento assíncrono de tarefas
- **Redis**: Cache e broker para Celery

### 2.3. Banco de Dados - PostgreSQL

O PostgreSQL foi selecionado como sistema de gerenciamento de banco de dados devido às suas características robustas e adequação ao projeto:

**Vantagens do PostgreSQL:**
- Banco de dados relacional robusto e confiável
- Suporte a tipos de dados complexos (JSON, arrays)
- Excelente performance para consultas complexas
- Suporte a índices avançados e otimização de consultas
- Extensibilidade e suporte a extensões especializadas
- Conformidade com padrões SQL

## 3. Estrutura do Banco de Dados

### 3.1. Modelo Entidade-Relacionamento

O banco de dados do DruxNuti foi projetado para suportar todas as funcionalidades do aplicativo, mantendo a integridade referencial e otimizando as consultas mais frequentes.

**Entidades Principais:**

**Users (Usuários):**
- id (Primary Key)
- email (Unique)
- password_hash
- first_name
- last_name
- date_of_birth
- gender
- height
- activity_level
- created_at
- updated_at

**UserProfiles (Perfis de Usuário):**
- id (Primary Key)
- user_id (Foreign Key → Users)
- current_weight
- target_weight
- daily_calorie_goal
- dietary_restrictions
- fitness_goals
- updated_at

**Meals (Refeições):**
- id (Primary Key)
- user_id (Foreign Key → Users)
- image_url
- meal_type (breakfast, lunch, dinner, snack)
- total_calories
- total_protein
- total_carbs
- total_fat
- ai_analysis_result
- health_score
- created_at

**MealFoods (Alimentos da Refeição):**
- id (Primary Key)
- meal_id (Foreign Key → Meals)
- food_id (Foreign Key → Foods)
- quantity
- unit

**Foods (Alimentos):**
- id (Primary Key)
- name
- calories_per_100g
- protein_per_100g
- carbs_per_100g
- fat_per_100g
- fiber_per_100g
- source_api
- external_id

**Exercises (Exercícios):**
- id (Primary Key)
- name
- description
- muscle_groups
- difficulty_level
- calories_per_minute
- instructions
- image_url

**UserExercises (Exercícios do Usuário):**
- id (Primary Key)
- user_id (Foreign Key → Users)
- exercise_id (Foreign Key → Exercises)
- duration_minutes
- sets
- reps
- calories_burned
- completed_at

**Goals (Metas):**
- id (Primary Key)
- user_id (Foreign Key → Users)
- goal_type (weight_loss, muscle_gain, maintenance)
- target_value
- current_value
- target_date
- status (active, completed, paused)
- created_at

**BodyMeasurements (Medidas Corporais):**
- id (Primary Key)
- user_id (Foreign Key → Users)
- weight
- body_fat_percentage
- muscle_mass
- waist_circumference
- chest_circumference
- arm_circumference
- measured_at

**Recommendations (Recomendações):**
- id (Primary Key)
- user_id (Foreign Key → Users)
- recommendation_type (meal, exercise, goal)
- content
- ai_confidence_score
- status (pending, accepted, rejected)
- created_at

### 3.2. Relacionamentos e Índices

**Relacionamentos Principais:**
- Um usuário pode ter múltiplas refeições (1:N)
- Uma refeição pode conter múltiplos alimentos (N:M através de MealFoods)
- Um usuário pode realizar múltiplos exercícios (1:N)
- Um usuário pode ter múltiplas metas (1:N)
- Um usuário pode ter múltiplas medidas corporais (1:N)

**Índices Otimizados:**
- Índice composto em (user_id, created_at) para consultas temporais
- Índice em meal_type para filtragem por tipo de refeição
- Índice em goal_type e status para consultas de metas
- Índice full-text em Foods.name para busca de alimentos

## 4. APIs REST e Endpoints

### 4.1. Estrutura das APIs

As APIs do DruxNuti seguem os princípios REST, utilizando métodos HTTP apropriados e códigos de status padronizados. Todas as APIs retornam dados em formato JSON e implementam autenticação JWT.

**Estrutura Base da URL:**
```
https://api.druxnuti.com/v1/
```

**Headers Padrão:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### 4.2. Endpoints de Autenticação

**POST /auth/register**
- Registro de novo usuário
- Body: email, password, first_name, last_name, date_of_birth, gender

**POST /auth/login**
- Login do usuário
- Body: email, password
- Response: access_token, refresh_token, user_info

**POST /auth/refresh**
- Renovação do token de acesso
- Body: refresh_token

**POST /auth/logout**
- Logout do usuário
- Invalidação do token

### 4.3. Endpoints de Usuário

**GET /users/profile**
- Obter perfil do usuário autenticado

**PUT /users/profile**
- Atualizar perfil do usuário
- Body: current_weight, target_weight, daily_calorie_goal, dietary_restrictions, fitness_goals

**GET /users/dashboard**
- Dados do dashboard principal
- Response: daily_progress, recent_meals, upcoming_exercises, goal_status

### 4.4. Endpoints de Refeições

**POST /meals/analyze**
- Análise de refeição via imagem
- Body: image (multipart/form-data), meal_type
- Response: detected_foods, nutritional_analysis, health_score, recommendations

**GET /meals**
- Listar refeições do usuário
- Query params: date_from, date_to, meal_type, limit, offset

**POST /meals**
- Salvar refeição analisada
- Body: image_url, meal_type, foods, nutritional_data

**GET /meals/{meal_id}**
- Obter detalhes de uma refeição específica

**DELETE /meals/{meal_id}**
- Excluir refeição

### 4.5. Endpoints de Exercícios

**GET /exercises**
- Listar exercícios disponíveis
- Query params: muscle_group, difficulty, search

**GET /exercises/recommendations**
- Obter exercícios recomendados pela IA
- Response: personalized_workout, difficulty_adjusted, goal_aligned

**POST /exercises/log**
- Registrar exercício realizado
- Body: exercise_id, duration, sets, reps

**GET /exercises/history**
- Histórico de exercícios do usuário
- Query params: date_from, date_to, exercise_id

### 4.6. Endpoints de Metas

**GET /goals**
- Listar metas do usuário
- Query params: status, goal_type

**POST /goals**
- Criar nova meta
- Body: goal_type, target_value, target_date

**PUT /goals/{goal_id}**
- Atualizar meta
- Body: target_value, target_date, status

**GET /goals/{goal_id}/progress**
- Obter progresso de uma meta específica

### 4.7. Endpoints de Medidas Corporais

**POST /measurements**
- Registrar nova medida corporal
- Body: weight, body_fat_percentage, measurements

**GET /measurements**
- Histórico de medidas corporais
- Query params: date_from, date_to, measurement_type

**GET /measurements/trends**
- Análise de tendências das medidas

### 4.8. Endpoints de Recomendações

**GET /recommendations**
- Obter recomendações personalizadas da IA
- Query params: type (meal, exercise, goal)

**POST /recommendations/{recommendation_id}/feedback**
- Fornecer feedback sobre recomendação
- Body: rating, accepted, comments

## 5. Integração com Serviços de IA

### 5.1. Análise de Imagem de Refeições

A funcionalidade principal do DruxNuti - análise de refeições via imagem - será implementada através de uma combinação de serviços:

**Pipeline de Processamento:**
1. **Pré-processamento da Imagem**: Redimensionamento, normalização e melhoria de qualidade
2. **Detecção de Alimentos**: Utilização de modelos de visão computacional (YOLO, ResNet)
3. **Estimativa de Porções**: Algoritmos de estimativa de volume e peso
4. **Consulta Nutricional**: Busca em APIs de nutrição (FatSecret, TACO)
5. **Análise de Saúde**: Avaliação da qualidade nutricional da refeição
6. **Geração de Recomendações**: Sugestões personalizadas baseadas no perfil do usuário

**Tecnologias Utilizadas:**
- **OpenCV**: Processamento de imagem
- **TensorFlow/PyTorch**: Modelos de deep learning
- **YOLOv8**: Detecção de objetos (alimentos)
- **APIs Externas**: FatSecret, TACO API para dados nutricionais

### 5.2. Sistema de Recomendações

O sistema de recomendações do DruxNuti utilizará algoritmos de machine learning para personalizar sugestões:

**Tipos de Recomendações:**
- **Refeições**: Baseadas em preferências, restrições e objetivos
- **Exercícios**: Adaptados ao nível de condicionamento e metas
- **Metas**: Definição de objetivos realistas e alcançáveis

**Algoritmos Utilizados:**
- **Collaborative Filtering**: Recomendações baseadas em usuários similares
- **Content-Based Filtering**: Recomendações baseadas no perfil do usuário
- **Hybrid Approach**: Combinação de múltiplas técnicas

## 6. Segurança e Privacidade

### 6.1. Autenticação e Autorização

**JWT (JSON Web Tokens):**
- Tokens de acesso com expiração de 1 hora
- Tokens de refresh com expiração de 30 dias
- Assinatura com chave secreta robusta

**Criptografia de Senhas:**
- Hash com bcrypt e salt aleatório
- Política de senhas fortes obrigatória

### 6.2. Proteção de Dados

**LGPD Compliance:**
- Consentimento explícito para coleta de dados
- Direito ao esquecimento implementado
- Minimização de dados coletados
- Transparência no uso dos dados

**Criptografia:**
- HTTPS obrigatório para todas as comunicações
- Criptografia de dados sensíveis no banco
- Armazenamento seguro de imagens

### 6.3. Validação e Sanitização

**Input Validation:**
- Validação rigorosa de todos os inputs
- Sanitização de dados para prevenir SQL injection
- Rate limiting para prevenir ataques de força bruta

## 7. Escalabilidade e Performance

### 7.1. Arquitetura Escalável

**Microserviços (Futuro):**
- Separação de responsabilidades em serviços independentes
- API Gateway para roteamento e autenticação
- Load balancing para distribuição de carga

**Cache Strategy:**
- Redis para cache de sessões e dados frequentes
- Cache de resultados de análise de IA
- CDN para servir imagens e assets estáticos

### 7.2. Otimização de Performance

**Banco de Dados:**
- Índices otimizados para consultas frequentes
- Particionamento de tabelas grandes
- Connection pooling

**APIs:**
- Paginação para listagens grandes
- Compressão gzip para responses
- Processamento assíncrono para tarefas pesadas

## 8. Monitoramento e Logging

### 8.1. Logging Estruturado

**Níveis de Log:**
- ERROR: Erros críticos que afetam funcionalidade
- WARN: Situações anômalas que não impedem funcionamento
- INFO: Eventos importantes do sistema
- DEBUG: Informações detalhadas para desenvolvimento

**Ferramentas:**
- Python logging com formatação JSON
- Centralização de logs com ELK Stack (futuro)

### 8.2. Métricas e Alertas

**Métricas Importantes:**
- Tempo de resposta das APIs
- Taxa de erro por endpoint
- Uso de recursos (CPU, memória, disco)
- Número de usuários ativos

**Alertas:**
- Notificação automática para erros críticos
- Monitoramento de performance degradada
- Alertas de segurança para tentativas de acesso suspeitas

