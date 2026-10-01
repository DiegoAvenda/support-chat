#!/usr/bin/env node
/**
 * seed.js — Seeds the MongoDB "articulos" collection with sample articles
 * and generates embeddings using the Gemini API.
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Prerequisites:
 *   - GEMINI_API_KEY in .env
 *   - MONGODB_URI in .env
 *   - The "vector_index" must be created manually in MongoDB Atlas UI.
 *
 * Vector Index Configuration (Atlas Search > Create Index > JSON):
 * {
 *   "fields": [
 *     {
 *       "numDimensions": 768,
 *       "path": "embedding",
 *       "similarity": "cosine",
 *       "type": "vector"
 *     }
 *   ]
 * }
 */

import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SAMPLE_ARTICLES = [
  {
    slug: 'como-restablecer-contrasena',
    title: 'Cómo restablecer tu contraseña',
    content: `Para restablecer tu contraseña, sigue estos pasos:
1. Ve a la página de inicio de sesión.
2. Haz clic en "¿Olvidaste tu contraseña?".
3. Ingresa tu correo electrónico registrado.
4. Revisa tu bandeja de entrada (y spam) para el enlace de restablecimiento.
5. El enlace expira en 24 horas.
Si no recibes el correo, verifica que el email esté correctamente escrito.`,
    categoria: 'cuenta',
    tags: ['contraseña', 'acceso', 'seguridad'],
  },
  {
    slug: 'metodos-de-pago-aceptados',
    title: 'Métodos de pago aceptados',
    content: `Aceptamos los siguientes métodos de pago:
- Tarjetas de crédito/débito: Visa, Mastercard, American Express.
- Transferencia bancaria (SPEI en México).
- PayPal.
- OXXO Pay (pago en efectivo).
Los pagos son procesados de forma segura con cifrado SSL. 
Las facturas se envían automáticamente al correo registrado.`,
    categoria: 'pagos',
    tags: ['pago', 'factura', 'tarjeta', 'SPEI', 'PayPal'],
  },
  {
    slug: 'politica-de-devoluciones',
    title: 'Política de devoluciones y reembolsos',
    content: `Tienes hasta 30 días naturales desde la fecha de compra para solicitar una devolución.
Condiciones:
- El producto debe estar en su empaque original sin abrir.
- Productos digitales no tienen devolución una vez descargados.
- Los reembolsos se procesan en 5-10 días hábiles.
Para iniciar una devolución, contacta a soporte con tu número de orden.`,
    categoria: 'devoluciones',
    tags: ['reembolso', 'devolución', 'garantía'],
  },
  {
    slug: 'como-cancelar-suscripcion',
    title: 'Cómo cancelar tu suscripción',
    content: `Para cancelar tu suscripción:
1. Inicia sesión en tu cuenta.
2. Ve a "Configuración" > "Suscripción".
3. Haz clic en "Cancelar suscripción".
4. Confirma la cancelación en el diálogo.
Tu acceso continuará hasta el final del período de facturación actual.
No se realizarán cargos adicionales. Puedes reactivar en cualquier momento.`,
    categoria: 'suscripcion',
    tags: ['cancelar', 'suscripción', 'baja'],
  },
  {
    slug: 'error-de-inicio-de-sesion',
    title: 'Solución a errores de inicio de sesión',
    content: `Si tienes problemas para iniciar sesión:
1. Verifica que el correo y contraseña sean correctos.
2. Asegúrate de que Bloq Mayús no esté activado.
3. Limpia las cookies y caché de tu navegador.
4. Intenta en modo incógnito.
5. Si usas inicio de sesión social (Google/Facebook), intenta con ese mismo método.
Si el problema persiste, restablece tu contraseña o contáctanos.`,
    categoria: 'cuenta',
    tags: ['login', 'acceso', 'error', 'inicio de sesión'],
  },
];

async function generateEmbedding(text) {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 768,
    },
  });

  return response.embeddings?.[0]?.values;
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'indi');
    const collection = db.collection('articulos');

    console.log(`\n🌱 Seeding ${SAMPLE_ARTICLES.length} articles...\n`);

    for (const article of SAMPLE_ARTICLES) {
      console.log(`  📝 Processing: "${article.title}"...`);

      // Generate embedding from title + content
      const textToEmbed = `${article.title}\n\n${article.content}`;
      const embedding = await generateEmbedding(textToEmbed);

      if (!embedding) {
        console.warn(`  ⚠️  No embedding generated for "${article.slug}", skipping.`);
        continue;
      }

      await collection.updateOne(
        { slug: article.slug },
        {
          $set: {
            ...article,
            embedding,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      console.log(`  ✅ "${article.slug}" upserted. Embedding dims: ${embedding.length}`);

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Next step: Create the vector_index in MongoDB Atlas:');
    console.log('   Database: indi | Collection: articulos | Index name: vector_index');
    console.log('   Field: "embedding" | Dimensions: 768 | Similarity: cosine\n');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
