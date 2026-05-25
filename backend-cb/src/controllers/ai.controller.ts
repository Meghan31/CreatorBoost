import { Response } from 'express';
import OpenAI from 'openai';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authenticate';

function getOpenAI() {
	if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
	return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getErrorDetails(err: any) {
	return {
		message: err?.error?.message ?? err?.message ?? 'Unknown error',
		type: err?.error?.type ?? err?.type ?? null,
		code: err?.error?.code ?? err?.code ?? null,
		status: err?.status ?? err?.response?.status ?? null,
	};
}

function sendAiError(res: Response, err: any, fallbackMessage: string) {
	const details = getErrorDetails(err);
	const isDev = process.env.NODE_ENV !== 'production';

	if (details.message === 'OPENAI_API_KEY not set') {
		res.status(503).json({ detail: 'OpenAI API key not configured.' });
		return;
	}

	// Surface details only in dev to help debug API/DB issues.
	res.status(500).json({
		detail: fallbackMessage,
		...(isDev
			? {
					error: details.message,
					error_type: details.type,
					error_code: details.code,
					status: details.status,
				}
			: {}),
	});
}

async function getChannelContext(userId: number): Promise<string> {
	const { rows } = await pool.query(
		`SELECT
       yc.channel_name, yc.subscriber_count, yc.view_count, yc.video_count,
       (SELECT JSON_AGG(v ORDER BY view_count DESC)
        FROM (SELECT title, view_count, like_count, engagement_rate
              FROM video_metrics WHERE channel_id = yc.id LIMIT 5) v
       ) AS top_videos
     FROM youtube_channels yc WHERE yc.user_id = $1 LIMIT 1`,
		[userId],
	);
	if (!rows[0]) return 'No YouTube channel connected yet.';
	const ch = rows[0];
	return `Channel: ${ch.channel_name}
Subscribers: ${ch.subscriber_count?.toLocaleString()}
Total Views: ${ch.view_count?.toLocaleString()}
Videos: ${ch.video_count}
Top Videos: ${JSON.stringify(ch.top_videos ?? [])}`;
}

export async function getChannelSummary(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { rows } = await pool.query(
			`SELECT content FROM ai_cache
       WHERE user_id = $1 AND cache_type = 'summary'
       ORDER BY created_at DESC LIMIT 1`,
			[req.userId],
		);
		res.json({ summary: rows[0]?.content?.text ?? null });
	} catch (err) {
		console.error('getChannelSummary error:', err);
		res.status(500).json({ detail: 'Failed to load summary.' });
	}
}

export async function generateChannelSummary(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const context = await getChannelContext(req.userId!);
		const openai = getOpenAI();

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are a YouTube growth expert. Analyse the channel data and write a concise 2-3 sentence summary highlighting key strengths and opportunities. Use **bold** for important metrics.',
				},
				{ role: 'user', content: context },
			],
			max_tokens: 200,
		});

		const text = completion.choices[0]?.message?.content ?? '';
		const usage = completion.usage;

		await pool.query(
			`INSERT INTO ai_cache (user_id, cache_type, content, prompt_tokens, completion_tokens)
       VALUES ($1, 'summary', $2, $3, $4)`,
			[
				req.userId,
				JSON.stringify({ text }),
				usage?.prompt_tokens ?? 0,
				usage?.completion_tokens ?? 0,
			],
		);

		res.json({ summary: text });
	} catch (err: any) {
		console.error('generateChannelSummary error:', err);
		sendAiError(res, err, 'Failed to generate summary.');
	}
}

export async function generateRecommendations(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const context = await getChannelContext(req.userId!);
		const openai = getOpenAI();

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are a YouTube growth strategist. Based on the channel data, give exactly 3 actionable growth recommendations. Format each as a bold title followed by a brief explanation. Use **bold** for titles.',
				},
				{ role: 'user', content: context },
			],
			max_tokens: 350,
		});

		const text = completion.choices[0]?.message?.content ?? '';
		res.json({ recommendations: text });
	} catch (err: any) {
		console.error('generateRecommendations error:', err);
		sendAiError(res, err, 'Failed to generate recommendations.');
	}
}

export async function generateTitleSuggestions(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { video_id } = req.body as { video_id?: string };
		const openai = getOpenAI();

		let videoContext = 'A YouTube tutorial video';
		if (video_id) {
			const { rows } = await pool.query(
				`SELECT title, view_count, engagement_rate FROM video_metrics
         WHERE youtube_video_id = $1 LIMIT 1`,
				[video_id],
			);
			if (rows[0])
				videoContext = `Video: "${rows[0].title}" (${rows[0].view_count} views, ${rows[0].engagement_rate}% engagement)`;
		}

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are an expert YouTube SEO strategist. Generate exactly 5 optimised title alternatives. Return ONLY a JSON array of strings, no explanation.',
				},
				{
					role: 'user',
					content: `Generate 5 SEO-optimised YouTube titles for: ${videoContext}`,
				},
			],
			max_tokens: 250,
			response_format: { type: 'json_object' },
		});

		const raw = completion.choices[0]?.message?.content ?? '{"titles":[]}';
		let titles: string[] = [];
		try {
			const parsed = JSON.parse(raw);
			titles = Array.isArray(parsed)
				? parsed
				: (parsed.titles ?? Object.values(parsed)[0] ?? []);
		} catch {
			titles = [];
		}

		res.json({ titles });
	} catch (err: any) {
		console.error('generateTitleSuggestions error:', err);
		sendAiError(res, err, 'Failed to generate titles.');
	}
}
