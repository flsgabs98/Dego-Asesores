// Netlify Function: proxies chat messages to Gemini so the API key
// never reaches the browser. Set GEMINI_API_KEY in Netlify's
// Site configuration → Environment variables (never in this file).

const SYSTEM_PROMPT = `Eres el asistente virtual del sitio web de DEGO Asesores, un despacho de seguros en la Ciudad de México dirigido por Benjamin Flores Cruz, Asesor Patrimonial y de Seguros afiliado a MAPFRE.

Tu trabajo es orientar a quien visita el sitio: responder preguntas generales sobre los planes que ofrece DEGO Asesores y ayudar a la persona a decidir si quiere que un asesor humano la contacte.

Planes que ofrece DEGO Asesores:
- Asesoría Financiera / Planificación de Inversiones
- Plan de Retiro
- Educación (ahorro para estudios de los hijos)
- Ahorro y Protección
- Seguros para Empresas
- Gastos Médicos Mayores

Datos de contacto reales:
- WhatsApp: 55 7505 8869
- Email: degoasesores@gmail.com
- Oficina: Av. Revolución 507, San Pedro de los Pinos, CDMX

Reglas importantes:
- Nunca inventes precios, coberturas exactas, exclusiones o condiciones legales de las pólizas — eso solo lo puede confirmar Benjamin. Si te preguntan precios o detalles de cobertura, explica que eso se cotiza de forma personalizada y ofrece conectar con Benjamin.
- Sé cálido, claro y breve (2-4 frases por respuesta). Nada de letras chiquitas ni tecnicismos innecesarios.
- Si la persona ya dio suficiente contexto (qué le interesa y algún dato de contacto), invítala a enviar la conversación por WhatsApp o a que un asesor la contacte.
- No pidas datos sensibles (no cuentas bancarias, no contraseñas, no identificaciones).`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falta configurar GEMINI_API_KEY en Netlify.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido.' }) };
  }

  const history = Array.isArray(payload.messages) ? payload.messages.slice(-20) : [];
  if (history.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Faltan mensajes.' }) };
  }

  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.text || '').slice(0, 2000) }]
  }));

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { temperature: 0.6, maxOutputTokens: 300 }
        })
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Error al contactar a Gemini.', detail: data }) };
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      'Perdón, no tengo una respuesta en este momento. ¿Quieres que te conecte directo con Benjamin por WhatsApp?';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno.', detail: String(err) }) };
  }
};
