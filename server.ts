import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { globalVocabularyRepo } from './server/db/repository';
import { buildAllDatasets } from './server/seeds/builder';
import { getDatabase } from './server/db/connection';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize persistent database & seed datasets on boot
console.log('Initializing persistent SQLite database & language libraries...');
const db = getDatabase();
buildAllDatasets();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    totalVocabularyItems: globalVocabularyRepo.totalCount,
    timestamp: new Date().toISOString(),
  });
});

// Languages & varieties endpoint with capabilities
app.get('/api/languages', (req, res) => {
  try {
    const langRows: any[] = db.prepare('SELECT * FROM languages ORDER BY name ASC').all();
    const varRows: any[] = db.prepare('SELECT * FROM language_varieties ORDER BY name ASC').all();

    const languages = langRows.map((l) => ({
      id: l.id,
      name: l.name,
      nativeName: l.native_name,
      familyId: l.family_id,
      defaultVarietyId: l.default_variety_id,
      capabilities: JSON.parse(l.capabilities || '{}'),
      varieties: varRows
        .filter((v) => v.language_id === l.id)
        .map((v) => ({
          id: v.id,
          languageId: v.language_id,
          name: v.name,
          nativeName: v.native_name,
          region: v.region,
          defaultWritingSystem: v.default_writing_system,
          defaultPronunciationSystem: v.default_pronunciation_system,
          capabilities: JSON.parse(v.capabilities || '{}'),
        })),
    }));

    res.json({ success: true, languages });
  } catch (err: any) {
    console.error('Error in GET /api/languages:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Categories endpoint with real-time item counts
app.get('/api/categories', (req, res) => {
  try {
    const { language } = req.query;
    const categories = globalVocabularyRepo.getCategories(language as string);
    res.json({
      success: true,
      categories,
    });
  } catch (err: any) {
    console.error('Error in GET /api/categories:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Primary paginated vocabulary / learning items query
const handleVocabularyQuery = (req: express.Request, res: express.Response) => {
  try {
    const {
      language,
      languageVariant,
      category,
      difficulty,
      frequencyBand,
      itemType,
      search,
      page,
      limit,
      sortBy,
      sortDirection,
      bookmarkedOnly,
      statusFilter,
    } = req.query;

    const queryResult = globalVocabularyRepo.query({
      language: language as string,
      languageVariant: languageVariant as string,
      category: category as string,
      difficulty: difficulty as any,
      frequencyBand: frequencyBand as any,
      itemType: itemType as any,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      sortBy: (sortBy as any) || 'frequencyRank',
      sortDirection: (sortDirection as any) || 'asc',
      bookmarkedOnly: bookmarkedOnly === 'true',
      statusFilter: statusFilter as any,
    });

    res.json({
      success: true,
      ...queryResult,
    });
  } catch (err: any) {
    console.error('Error in GET /api/vocabulary:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

app.get('/api/vocabulary', handleVocabularyQuery);
app.get('/api/learning-items', handleVocabularyQuery);

// Random vocabulary items for practice/quizzes
app.get('/api/vocabulary/random', (req, res) => {
  try {
    const { language, count, category, difficulty, itemType } = req.query;
    if (!language) {
      return res.status(400).json({ error: 'Language parameter is required' });
    }

    const items = globalVocabularyRepo.getRandom(
      language as string,
      count ? parseInt(count as string, 10) : 10,
      category as string,
      difficulty as any,
      itemType as any
    );

    res.json({ success: true, items });
  } catch (err: any) {
    console.error('Error in GET /api/vocabulary/random:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Alias practice random
app.get('/api/practice/random', (req, res) => {
  try {
    const { language, count, category, difficulty, itemType } = req.query;
    if (!language) {
      return res.status(400).json({ error: 'Language parameter is required' });
    }

    const items = globalVocabularyRepo.getRandom(
      language as string,
      count ? parseInt(count as string, 10) : 10,
      category as string,
      difficulty as any,
      itemType as any
    );

    res.json({ success: true, items });
  } catch (err: any) {
    console.error('Error in GET /api/practice/random:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Items due for SRS review
app.get('/api/practice/due', (req, res) => {
  try {
    const { language, limit } = req.query;
    if (!language) {
      return res.status(400).json({ error: 'Language parameter is required' });
    }

    const items = globalVocabularyRepo.getDueReviews(
      language as string,
      limit ? parseInt(limit as string, 10) : 20
    );

    res.json({ success: true, items });
  } catch (err: any) {
    console.error('Error in GET /api/practice/due:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Record practice outcome, update SRS, award calculated XP
app.post('/api/practice/review', (req, res) => {
  try {
    const { itemId, languageId, activityType, rating, score } = req.body;
    if (!itemId || !languageId) {
      return res.status(400).json({ error: 'itemId and languageId are required' });
    }

    const result = globalVocabularyRepo.recordPractice({
      itemId,
      languageId,
      activityType: activityType || 'flashcard',
      rating,
      score,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error in POST /api/practice/review:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Smart vocabulary recommendations
app.get('/api/vocabulary/recommendations', (req, res) => {
  try {
    const { language, currentBand, strategy, limit } = req.query;
    if (!language) {
      return res.status(400).json({ error: 'Language parameter is required' });
    }

    const items = globalVocabularyRepo.getRecommendations(
      language as string,
      (currentBand as any) || 'high',
      (strategy as any) || 'expand_core',
      limit ? parseInt(limit as string, 10) : 10
    );

    res.json({ success: true, items });
  } catch (err: any) {
    console.error('Error in GET /api/vocabulary/recommendations:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Global vocabulary library stats and audit reports
app.get('/api/vocabulary/stats', (req, res) => {
  try {
    const reports = globalVocabularyRepo.getAuditReports();
    res.json({
      success: true,
      totalCount: globalVocabularyRepo.totalCount,
      reports,
    });
  } catch (err: any) {
    console.error('Error in GET /api/vocabulary/stats:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Admin re-seed and metadata enrichment endpoint
app.post('/api/vocabulary/reseed', (req, res) => {
  try {
    const force = req.body?.force !== false;
    buildAllDatasets(force);
    const reports = globalVocabularyRepo.getAuditReports();
    res.json({
      success: true,
      totalCount: globalVocabularyRepo.totalCount,
      reports,
    });
  } catch (err: any) {
    console.error('Error in POST /api/vocabulary/reseed:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Vocabulary categories with item counts
app.get('/api/vocabulary/categories', (req, res) => {
  try {
    const { language } = req.query;
    const categories = globalVocabularyRepo.getCategories(language as string);
    res.json({ success: true, categories });
  } catch (err: any) {
    console.error('Error in GET /api/vocabulary/categories:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Single vocabulary item by ID
app.get('/api/vocabulary/:id', (req, res) => {
  try {
    const item = globalVocabularyRepo.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Vocabulary item not found' });
    }
    res.json({ success: true, item });
  } catch (err: any) {
    console.error('Error in GET /api/vocabulary/:id:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// User Progress
app.get('/api/user/progress', (req, res) => {
  try {
    const { language } = req.query;
    const progress = globalVocabularyRepo.getUserProgress('local-learner', language as string);
    res.json({ success: true, progress });
  } catch (err: any) {
    console.error('Error in GET /api/user/progress:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// User Bookmarks
app.post('/api/user/bookmarks', (req, res) => {
  try {
    const { itemId, bookmarked } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: 'itemId is required' });
    }
    globalVocabularyRepo.toggleBookmark(itemId, bookmarked !== false);
    res.json({ success: true, itemId, isBookmarked: bookmarked !== false });
  } catch (err: any) {
    console.error('Error in POST /api/user/bookmarks:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// User Custom Items
app.post('/api/user/custom-items', (req, res) => {
  try {
    const created = globalVocabularyRepo.addCustomItem(req.body);
    res.json({ success: true, item: created });
  } catch (err: any) {
    console.error('Error in POST /api/user/custom-items:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.delete('/api/user/custom-items/:id', (req, res) => {
  try {
    globalVocabularyRepo.deleteCustomItem(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    console.error('Error in DELETE /api/user/custom-items/:id:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// User Settings
app.get('/api/user/settings', (req, res) => {
  try {
    const settings = globalVocabularyRepo.getUserSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    console.error('Error in GET /api/user/settings:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.put('/api/user/settings', (req, res) => {
  try {
    const updated = globalVocabularyRepo.updateUserSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('Error in PUT /api/user/settings:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// LocalStorage Client Migration endpoint
app.post('/api/user/migrate', (req, res) => {
  try {
    const result = globalVocabularyRepo.migrateClientData(req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error in POST /api/user/migrate:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// AI Vocabulary Deep Dive / Explainer endpoint
app.post('/api/gemini/explain-word', async (req, res) => {
  try {
    const { word, language, romanization, meaning, variety, writingSystem } = req.body;
    if (!word || !language) {
      return res.status(400).json({ error: 'Word and language are required' });
    }

    const ai = getGeminiClient();
    const isCantonese = (language + (variety || '')).toLowerCase().includes('cantonese') || language === 'zh-yue';
    const isMandarin = (language + (variety || '')).toLowerCase().includes('mandarin') || language === 'zh' || language === 'zh-cmn';

    const romanizationGuide = isCantonese
      ? 'Use standard Cantonese Jyutping with tone numbers (e.g., nei5 hou2, m4 goi1). Do NOT use Mandarin Pinyin.'
      : isMandarin
      ? 'Use Hanyu Pinyin with tone marks (e.g., nǐ hǎo, xièxie).'
      : 'Use accurate romanization/phonetic transcription for this language.';

    const prompt = `You are a world-class linguist and master language tutor specializing in ${language} ${variety ? `(${variety})` : ''}.
Provide an educational breakdown of the vocabulary word: "${word}" (${romanization || ''}) which means "${meaning || ''}".
Writing system context: ${writingSystem || 'Standard'}.
Pronunciation system guideline: ${romanizationGuide}

Respond in strictly valid JSON format with the following structure:
{
  "etymologyOrMnemonic": "A vivid, memorable memory hook or etymological origin explaining how to memorize it easily (for Sinitic/Chinese varieties include character radical breakdown, components, or tone memory tip)",
  "culturalContext": "Brief cultural nuance, regional context (e.g. Hong Kong vs Mainland vs Taiwan if applicable), or natural etiquette of when native speakers use this word vs alternatives",
  "tonesOrPronunciationTip": "Phonetic explanation and tone contour guidance (${isCantonese ? 'Cantonese tones 1-6' : isMandarin ? 'Mandarin tones 1-4 + neutral' : 'accent/phonetic tips'})",
  "sentences": [
    {
      "native": "Sentence in target language variety",
      "romanization": "${isCantonese ? 'Accurate Cantonese Jyutping' : 'Romanization/pinyin/reading'}",
      "translation": "Natural English translation"
    },
    {
      "native": "Second sentence in target language variety",
      "romanization": "${isCantonese ? 'Accurate Cantonese Jyutping' : 'Romanization/pinyin/reading'}",
      "translation": "Natural English translation"
    }
  ],
  "synonymsOrRelated": [
    {
      "word": "Related word",
      "translation": "Meaning"
    }
  ]
}
Do not wrap in markdown quotes if possible, output pure JSON.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(cleaned);
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/gemini/explain-word:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate vocabulary explanation',
      isApiKeyMissing: !process.env.GEMINI_API_KEY,
    });
  }
});

// AI Generate Custom Flashcard from input
app.post('/api/gemini/generate-custom-word', async (req, res) => {
  try {
    const { input, targetLanguage, variety, writingSystem } = req.body;
    if (!input || !targetLanguage) {
      return res.status(400).json({ error: 'Input and targetLanguage are required' });
    }

    const ai = getGeminiClient();
    const isCantonese = (targetLanguage + (variety || '')).toLowerCase().includes('cantonese') || targetLanguage === 'zh-yue';
    const isMandarin = (targetLanguage + (variety || '')).toLowerCase().includes('mandarin') || targetLanguage === 'zh';

    const prompt = `A student wants to add a new vocabulary flashcard for learning ${targetLanguage} ${variety ? `(${variety})` : ''}.
The student provided: "${input}".
Preferred writing system: ${writingSystem || (isCantonese ? 'Traditional Hanzi' : 'Simplified Hanzi')}.

Detect if this is the target word or English meaning, and generate a complete, accurate vocabulary card for learning ${targetLanguage}.
${isCantonese ? 'IMPORTANT: This is CANTONESE. Provide Cantonese characters and standard Jyutping with tone numbers (e.g., nei5 hou2, m4 goi1). DO NOT output Mandarin pinyin.' : ''}

Respond strictly in valid JSON with this format:
{
  "word": "Word written in native script",
  "phonetic": "${isCantonese ? 'Jyutping with tone numbers (e.g., dim2 sam1)' : isMandarin ? 'Pinyin with tone marks (e.g. nǐ hǎo)' : 'Phonetic guide'}",
  "meaning": "Clear English translation / definition",
  "partOfSpeech": "Noun, Verb, Adjective, Idiom, Expression, Particle, or Measure Word",
  "category": "Daily Essentials, Food & Drink, Travel & Places, Social & Feelings, Work & Study, Time & Numbers, or Culture & Customs",
  "level": "${isMandarin ? 'HSK 1, HSK 2, or HSK 3' : 'Beginner (A1), Intermediate (A2-B1), or Advanced'}",
  "exampleSentence": {
    "native": "A natural, high-frequency example sentence",
    "phonetic": "Phonetic reading/romanization of sentence",
    "translation": "English translation"
  },
  "memoryTip": "A concise 1-sentence mnemonic memory trick or tone guide"
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.text || '{}';
    let cardData;
    try {
      cardData = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      cardData = JSON.parse(cleaned);
    }

    res.json({ success: true, card: cardData });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-custom-word:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate custom card',
      isApiKeyMissing: !process.env.GEMINI_API_KEY,
    });
  }
});

// AI Interactive Dialogue / Practice check
app.post('/api/gemini/dialogue-check', async (req, res) => {
  try {
    const { word, language, userSentence, variety } = req.body;
    if (!word || !language || !userSentence) {
      return res.status(400).json({ error: 'word, language, and userSentence are required' });
    }

    const ai = getGeminiClient();
    const isCantonese = (language + (variety || '')).toLowerCase().includes('cantonese') || language === 'zh-yue';

    const prompt = `The user is practicing the ${language} ${variety ? `(${variety})` : ''} vocabulary word "${word}".
The user attempted to write or say the following sentence:
"${userSentence}"

Evaluate the sentence for naturalness, grammar, and proper usage of "${word}".
${isCantonese ? 'CRITICAL: This is CANTONESE. Evaluate according to authentic spoken Cantonese grammar and colloquial usage (e.g. 點心, 唔該, 喺, 嘅, 冇, 食飯). Do NOT penalize Cantonese syntax as if it were Mandarin.' : ''}

Distinguish between:
- Correct and natural
- Correct but formal / literary
- Grammatically incorrect
- Unnatural phrasing or incorrect word choice

Respond in JSON:
{
  "isCorrect": true/false,
  "score": 0 to 100,
  "feedback": "Encouraging, constructive feedback in English explaining grammar nuances",
  "correction": "Polished, natural version of the sentence in ${language}",
  "correctionPhonetic": "${isCantonese ? 'Cantonese Jyutping transcription' : 'Phonetic/pinyin transcription'} of corrected sentence",
  "translation": "English translation of the corrected sentence"
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.text || '{}';
    let evaluation;
    try {
      evaluation = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      evaluation = JSON.parse(cleaned);
    }

    res.json({ success: true, evaluation });
  } catch (error: any) {
    console.error('Error in /api/gemini/dialogue-check:', error);
    res.status(500).json({
      error: error.message || 'Failed to evaluate sentence',
      isApiKeyMissing: !process.env.GEMINI_API_KEY,
    });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaDaily server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
