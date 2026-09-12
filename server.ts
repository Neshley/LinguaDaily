import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { POST as explainWordHandler } from './api/gemini/explain-word';
import { POST as generateCustomWordHandler } from './api/gemini/generate-custom-word';
import { POST as dialogueCheckHandler } from './api/gemini/dialogue-check';
import dotenv from 'dotenv';
import { globalVocabularyRepo } from './server/db/repository';
import { buildAllDatasets } from './server/seeds/builder';
import { getDatabase } from './server/db/connection';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '256kb' }));

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

// Content generation is a build/CLI operation, not a public HTTP mutation.

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

// Local development adapters. Production uses the same handlers as Vercel serverless functions.
async function runGeminiHandler(handler: (request: Request) => Promise<Response>, req: express.Request, res: express.Response) {
  try {
    const request = new Request(`http://localhost:${PORT}${req.originalUrl}`, {
      method: req.method,
      headers: {
        'content-type': 'application/json',
        ...(req.headers['x-forwarded-for'] ? { 'x-forwarded-for': String(req.headers['x-forwarded-for']) } : {}),
      },
      body: JSON.stringify(req.body ?? {}),
    });
    const response = await handler(request);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.status(response.status).send(await response.text());
  } catch (error: any) {
    console.error('Local Gemini handler error:', error);
    res.status(500).json({ error: error?.message || 'AI request failed' });
  }
}

app.post('/api/gemini/explain-word', (req, res) => runGeminiHandler(explainWordHandler, req, res));
app.post('/api/gemini/generate-custom-word', (req, res) => runGeminiHandler(generateCustomWordHandler, req, res));
app.post('/api/gemini/dialogue-check', (req, res) => runGeminiHandler(dialogueCheckHandler, req, res));

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

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`LinguaDaily server running on http://127.0.0.1:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
