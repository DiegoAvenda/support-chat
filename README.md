# 💬 Soporte en Vivo con IA (RAG)

Aplicación de soporte al cliente en tiempo real con búsqueda vectorial automática (RAG) usando Google Gemini, MongoDB Atlas, React y Express.js.

## 🏗️ Estructura del Proyecto

```
support-chat/
├── client/          # React + Vite + Tailwind CSS (Frontend)
│   └── src/
│       ├── components/  # ChatHeader, MessageBubble, ArticleSuggestion, MessageInput
│       ├── hooks/       # useSSE (Server-Sent Events), useChat (envío de mensajes)
│       ├── pages/       # SelectRole, ChatPage, ArticlePage
│       └── constants.js
└── server/          # Express.js + MongoDB + Gemini (Backend)
    ├── src/
    │   ├── services/
    │   │   ├── rag.js   # Pipeline RAG: detección → embedding → vectorSearch
    │   │   └── sse.js   # Gestor de clientes SSE
    │   ├── routes/
    │   │   ├── chat.js       # POST /api/chat · GET /api/chat/stream
    │   │   └── articles.js   # GET /api/articles/:slug
    │   ├── db.js        # Conexión MongoDB (singleton)
    │   └── index.js     # Entry point Express
    └── scripts/
        └── seed.js      # Seed de artículos con embeddings Gemini
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
# Backend
cd support-chat/server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configurar variables de entorno del Backend

```bash
cd support-chat/server
cp .env.example .env
```

Edita `.env`:
```env
GEMINI_API_KEY=tu_clave_de_gemini
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=indi
PORT=3001
CLIENT_URL=http://localhost:5173
```

### 3. Crear el índice vectorial en MongoDB Atlas

Ve a **Atlas Search > Create Search Index > JSON Editor** en tu colección `articulos`:

```json
{
  "fields": [
    {
      "numDimensions": 768,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

> **Nombre del índice:** `vector_index`

### 4. Sembrar la base de datos con artículos de muestra

```bash
cd support-chat/server
node scripts/seed.js
```

Este script crea 5 artículos de ejemplo con embeddings de 768 dimensiones generados por `gemini-embedding-2`.

### 5. Iniciar los servidores

```bash
# Terminal 1 - Backend (puerto 3001)
cd support-chat/server
npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd support-chat/client
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) 🎉

## 🔑 Cómo Funciona el RAG

El pipeline de IA se activa automáticamente cuando un **Agente** usa frases de confirmación:

| Frase en inglés | Frase en español |
|---|---|
| `just to confirm` | `solo para confirmar` |
| `let me confirm if i understood correctly` | `déjame verificar si entendí bien` |
| `let me make sure i understand` | `déjame confirmar` |

**Flujo:**
1. Agente escribe: *"Just to confirm, you want to know how to reset your password, is that correct?"*
2. Backend detecta la frase trigger.
3. Extrae la consulta limpia: *"reset your password"*.
4. Genera embedding de 768 dims con `gemini-embedding-2`.
5. Ejecuta `$vectorSearch` en MongoDB Atlas.
6. Retorna el `slug` del artículo más relevante.
7. El frontend muestra una tarjeta de sugerencia con enlace al artículo.

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/chat` | Enviar mensaje (activa RAG si es agente) |
| `GET` | `/api/chat/stream` | SSE stream de mensajes en tiempo real |
| `GET` | `/api/articles/:slug` | Obtener artículo por slug |
| `GET` | `/api/articles` | Listar todos los artículos |
| `GET` | `/health` | Health check del servidor |

### POST /api/chat

**Body:**
```json
{
  "text": "Just to confirm, you want to know how to reset your password?",
  "userRole": "agent"
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "text": "...",
    "userRole": "agent",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "searchResultSlug": "como-restablecer-contrasena"
  },
  "searchResultSlug": "como-restablecer-contrasena"
}
```

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, React Router 6, Tailwind CSS 3, Vite 5
- **Backend:** Express.js 4, Node.js 22 (ESM)
- **Base de datos:** MongoDB Atlas con `$vectorSearch`
- **IA:** `@google/genai` → `gemini-embedding-2` (768 dims)
- **Tiempo real:** Server-Sent Events (SSE) con reconexión automática
