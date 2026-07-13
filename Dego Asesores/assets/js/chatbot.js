(function () {
  const WHATSAPP_NUMBER = '525575058869';
  const EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/degoasesores@gmail.com';

  const launcher = document.getElementById('chatLauncher');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const body = document.getElementById('chatBody');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const quick = document.getElementById('chatQuick');
  const waLink = document.getElementById('chatWaLink');
  const emailBtn = document.getElementById('chatEmailBtn');

  if (!launcher || !panel) return;

  let history = [];
  let opened = false;

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    body.appendChild(el);
    scrollToBottom();
    history.push({ role, text });
  }

  function addTyping() {
    const el = document.createElement('div');
    el.className = 'chat-msg bot typing';
    el.id = 'chatTypingIndicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('chatTypingIndicator');
    if (el) el.remove();
  }

  // Reglas de respuesta: cada entrada busca palabras clave en el mensaje
  // del visitante. No hay IA ni backend — todo corre en el navegador.
  const FAQ_RULES = [
    {
      keywords: ['retiro', 'jubila', 'pension', 'pensión'],
      reply: 'Nuestro Plan de Retiro te ayuda a construir el monto que necesitas para tu jubilación, con coberturas de protección adicionales. ¿Quieres que Benjamin te contacte para armar tu plan a la medida?'
    },
    {
      keywords: ['educacion', 'educación', 'hijos', 'universidad', 'escuela', 'estudios'],
      reply: 'El Plan de Educación es un ahorro sistematizado para asegurar los estudios de tus hijos a los 15, 18 o 22 años, con beneficios adicionales para ti como contratante. ¿Te gustaría cotizarlo?'
    },
    {
      keywords: ['ahorro', 'proteccion', 'protección', 'casa', 'viaje'],
      reply: 'El Plan de Ahorro y Protección es para metas a mediano o largo plazo (una casa, un viaje, imprevistos), con coberturas adicionales incluidas. ¿Quieres que te contactemos para ver montos y plazos?'
    },
    {
      keywords: ['empresa', 'negocio', 'fiscal', 'pyme'],
      reply: 'Para empresas armamos protección contra la inestabilidad financiera del negocio, con beneficios fiscales. ¿Te gustaría que Benjamin revise el caso de tu empresa?'
    },
    {
      keywords: ['medic', 'médic', 'salud', 'hospital', 'enfermedad', 'accidente', 'gastos medicos', 'gastos médicos'],
      reply: 'Los Seguros de Gastos Médicos Mayores cubren la atención médica necesaria ante una enfermedad o accidente, sin comprometer tu economía. ¿Quieres que te contactemos para ver coberturas?'
    },
    {
      keywords: ['invers', 'financ', 'patrimonio'],
      reply: 'La Asesoría Financiera es planificación de inversiones y estrategias para hacer crecer tu patrimonio, con protección incluida. ¿Te gustaría una asesoría personalizada?'
    },
    {
      keywords: ['precio', 'costo', 'cuanto cuesta', 'cuánto cuesta', 'cotiza'],
      reply: 'Los costos dependen de tu edad, el plan y la cobertura que elijas, así que Benjamin te da una cotización personalizada sin costo. ¿Te gustaría que te contacte?'
    },
    {
      keywords: ['direccion', 'dirección', 'ubicacion', 'ubicación', 'oficina', 'donde estan', 'dónde están'],
      reply: 'Nuestra oficina está en Av. Revolución 507, San Pedro de los Pinos, CDMX. Escríbenos antes por WhatsApp para asegurar que Benjamin esté disponible cuando llegues.'
    },
    {
      keywords: ['contact', 'asesor', 'humano', 'hablar con alguien', 'llamar', 'whatsapp'],
      reply: 'Claro, dale clic a "Continuar en WhatsApp" aquí abajo y Benjamin recibe todo lo que platicamos.'
    },
    {
      keywords: ['hola', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches'],
      reply: '¡Hola! ¿Sobre qué plan quieres saber más: retiro, educación, ahorro, empresas, gastos médicos o asesoría financiera?'
    },
    {
      keywords: ['gracias'],
      reply: 'Con gusto. Si prefieres, dale clic a "Continuar en WhatsApp" para que Benjamin te dé seguimiento directo.'
    }
  ];

  const FALLBACK_REPLY =
    'No tengo una respuesta exacta para eso, pero puedo orientarte sobre retiro, educación, ahorro y protección, empresas, gastos médicos o asesoría financiera. También puedes darle clic a "Continuar en WhatsApp" para hablar directo con Benjamin.';

  function getRuleBasedReply(userText) {
    const normalized = userText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    for (const rule of FAQ_RULES) {
      if (rule.keywords.some((kw) => normalized.includes(
        kw.normalize('NFD').replace(/[̀-ͯ]/g, '')
      ))) {
        return rule.reply;
      }
    }
    return FALLBACK_REPLY;
  }

  function sendToAssistant(userText) {
    addMessage('user', userText);
    addTyping();
    sendBtn.disabled = true;

    setTimeout(() => {
      removeTyping();
      addMessage('assistant', getRuleBasedReply(userText));
      sendBtn.disabled = false;
      updateHandoff();
    }, 500);
  }

  function updateHandoff() {
    const transcript = history
      .map((m) => (m.role === 'user' ? 'Visitante: ' : 'Asistente: ') + m.text)
      .join('\n');
    const summary = `Hola, vengo del chat del sitio de DEGO Asesores. Esto fue lo que platicamos:\n\n${transcript}`;
    waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
  }

  async function sendTranscriptByEmail() {
    if (history.length === 0) return;
    const transcript = history
      .map((m) => (m.role === 'user' ? 'Visitante: ' : 'Asistente: ') + m.text)
      .join('\n');
    emailBtn.textContent = 'Enviando…';
    try {
      await fetch(EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Conversación del chat del sitio DEGO Asesores',
          Conversacion: transcript
        })
      });
      emailBtn.textContent = 'Enviado ✓';
    } catch (e) {
      emailBtn.textContent = 'No se pudo enviar';
    }
    setTimeout(() => { emailBtn.textContent = 'Enviar por correo'; }, 3000);
  }

  function openChat() {
    panel.classList.add('open');
    opened = true;
    if (history.length === 0) {
      addMessage(
        'assistant',
        'Hola, soy el asistente de DEGO Asesores 👋 Puedo orientarte sobre nuestros planes (retiro, ahorro, educación, empresas, gastos médicos) o conectarte directo con Benjamin. ¿En qué te ayudo?'
      );
    }
    input.focus();
  }

  launcher.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendToAssistant(text);
  });

  quick.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => sendToAssistant(btn.textContent.trim()));
  });

  emailBtn.addEventListener('click', sendTranscriptByEmail);
})();
