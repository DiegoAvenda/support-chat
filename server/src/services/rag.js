import { GoogleGenAI } from '@google/genai';
import { getDB } from '../db.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Phrases that trigger the RAG search when an agent uses them.
 * They indicate the agent is confirming their understanding of the client's problem.
 */
const TRIGGER_PHRASES = [
  'let me confirm if i understood correctly',
  'let me make sure i understand',
  'just to confirm',
  'déjame verificar si entendí bien',
  'solo para confirmar',
  'déjame confirmar',
];

/**
 * Trailing phrases to strip from the confirmation message
 * to extract only the core problem description.
 */
const TRAILING_CLEANUP_PATTERNS = [
  /[\s,.-]*(is that correct\??|¿?es eso correcto\??|that you want to know[^?]*\??|¿?eso es lo que[^?]*\??|right\??|correct\??)[\s]*$/gi,
  /[\s,.-]*(¿?is that right\??|¿?correcto\??|verdad\??)[\s]*$/gi,
];

/**
 * Check if an agent message contains a RAG-trigger confirmation phrase.
 * @param {string} text - The message text to analyze
 * @returns {{ triggered: boolean, query: string }}
 */
export function checkTriggerPhrases(text) {
  const lower = text.toLowerCase();

  for (const phrase of TRIGGER_PHRASES) {
    const idx = lower.indexOf(phrase);
    if (idx !== -1) {
      // Extract everything after the trigger phrase
      let query = text.slice(idx + phrase.length).trim();

      // Remove leading punctuation/conjunctions
      query = query.replace(/^[,.:;-]+\s*/g, '').trim();

      // Strip trailing confirmation questions
      for (const pattern of TRAILING_CLEANUP_PATTERNS) {
        query = query.replace(pattern, '').trim();
      }

      // If the extracted query is meaningful, use it; otherwise use the full message
      if (query.length < 10) {
        // Use a broader context: everything from trigger to end
        query = text.replace(new RegExp(phrase, 'gi'), '').trim();
        // Remove trailing confirmation questions from the full text too
        for (const pattern of TRAILING_CLEANUP_PATTERNS) {
          query = query.replace(pattern, '').trim();
        }
      }

      return { triggered: true, query: query || text };
    }
  }

  return { triggered: false, query: '' };
}

/**
 * Generate a 768-dimension embedding vector for the given text.
 * Uses gemini-embedding-2 with question-answering task type.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text) {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: {
      taskType: 'QUESTION_ANSWERING',
      outputDimensionality: 768,
    },
  });

  // The SDK returns embeddings in response.embeddings[0].values
  const embedding = response.embeddings?.[0]?.values;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Failed to generate embedding: unexpected response structure');
  }

  return embedding;
}

/**
 * Perform a $vectorSearch on the MongoDB "articulos" collection
 * and return the slug of the most relevant article.
 * @param {number[]} queryVector - 768-dim embedding vector
 * @returns {Promise<string|null>} - Article slug or null if not found
 */
export async function searchKnowledgeBase(queryVector) {
  const db = await getDB();
  const collection = db.collection('articulos');

  const pipeline = [
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryVector,
        numCandidates: 100,
        limit: 1,
      },
    },
    {
      $project: {
        _id: 0,
        slug: 1,
      },
    },
  ];

  const results = await collection.aggregate(pipeline).toArray();

  if (results.length > 0 && results[0].slug) {
    return results[0].slug;
  }

  return null;
}

/**
 * Full RAG pipeline: detect trigger → extract query → embed → search.
 * @param {string} text - Agent message text
 * @returns {Promise<string|null>} - Matching article slug, or null
 */
export async function runRAGPipeline(text) {
  const { triggered, query } = checkTriggerPhrases(text);

  if (!triggered || !query) {
    return null;
  }

  console.log(`🔍 RAG triggered. Query: "${query}"`);

  const vector = await generateEmbedding(query);
  const slug = await searchKnowledgeBase(vector);

  if (slug) {
    console.log(`✅ RAG result: slug="${slug}"`);
  } else {
    console.log('⚠️  RAG search returned no results.');
  }

  return slug;
}
