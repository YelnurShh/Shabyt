import OpenAI from 'openai';

export const runtime = 'nodejs';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
const requestCounts = new Map<string, { count: number; resetsAt: number }>();

const instructions = `Сен Shabyt сайтының қазақша шығармашылық көмекшісісің. Сайт көркем еңбек пен қазақ халық мұрасын біріктіреді: ертегілер, жұмбақтар және ою-өрнектер.
Пайдаланушыға жылы, түсінікті қазақ тілінде жауап бер. Жауапты көбіне 2–5 қысқа абзацқа сыйдыр және Markdown белгілерін қолданба. Қажет болса сурет салу, композиция, түс таңдау немесе қолөнер бойынша нақты қадамдар ұсын. Ертегі мен ою туралы нақты деректі білмесең, ойдан тарихи мәлімет қоспа; белгісіз екенін айт. Жұмбақ сұралса, пайдаланушы бірден дайын жауап сұрамаса, алдымен ойлануға жетелейтін ишара бер. Балаларға түсінікті, қолдаушы үн қолдан. Өзіңді адам немесе жоба авторы деп таныстырма.`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return Response.json({ error: 'ЖИ чат әлі іске қосылмаған. Сайт иесі Groq API кілтін орнатуы керек.' }, { status: 503 });
  }

  if (Number(request.headers.get('content-length') ?? 0) > 20_000) {
    return Response.json({ error: 'Хабарлама тым ұзын.' }, { status: 413 });
  }

  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const current = requestCounts.get(address);
  if (current && current.resetsAt > now && current.count >= 12) {
    return Response.json({ error: 'Бір минуттағы сұрау шегі толды. Сәлден кейін қайталап көріңіз.' }, { status: 429 });
  }
  if (requestCounts.size > 1000) requestCounts.clear();
  requestCounts.set(address, current && current.resetsAt > now ? { count: current.count + 1, resetsAt: current.resetsAt } : { count: 1, resetsAt: now + 60_000 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Сұрау пішімі дұрыс емес.' }, { status: 400 });
  }

  const rawMessages = typeof body === 'object' && body !== null && 'messages' in body ? body.messages : null;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0 || rawMessages.length > 12) {
    return Response.json({ error: 'Әңгіме тарихы дұрыс емес.' }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const item of rawMessages) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') {
      return Response.json({ error: 'Хабарлама пішімі дұрыс емес.' }, { status: 400 });
    }
    const content = item.content.trim();
    if (!content || content.length > 1200) {
      return Response.json({ error: 'Әр хабарлама 1200 таңбадан аспауы керек.' }, { status: 400 });
    }
    messages.push({ role: item.role, content });
  }
  if (messages.at(-1)?.role !== 'user') {
    return Response.json({ error: 'Соңғы хабарлама сұрақ болуы керек.' }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
    const response = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: [{ role: 'system', content: instructions }, ...messages],
      max_completion_tokens: 650,
    });
    const answer = response.choices[0]?.message?.content?.trim();
    if (!answer) throw new Error('Empty model response');
    return Response.json({ message: answer });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('Groq chat request failed', { status: error.status, code: error.code });
      if (error.status === 429) {
        return Response.json({ error: 'Қазір сұраулар көп. Сәлден кейін қайталап көріңіз.' }, { status: 429 });
      }
      if (error.status === 404 && error.code === 'model_not_found') {
        return Response.json({ error: 'Таңдалған Groq моделі қолжетімсіз. GROQ_MODEL мәнін тексеріңіз.' }, { status: 503 });
      }
      if (error.status === 401 || error.status === 403) {
        return Response.json({ error: 'Groq API кілті жарамсыз немесе оған рұқсат жоқ.' }, { status: 503 });
      }
    }
    return Response.json({ error: 'Жауап алу мүмкін болмады. Біраздан кейін қайталап көріңіз.' }, { status: 502 });
  }
}
