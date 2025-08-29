export interface DrAjudaResponse {
  triggers: string[];
  responses: string[];
}

export interface DrAjudaResponseSystem {
  topics: DrAjudaResponse[];
  thankYouResponses: string[];
  fallbackResponses: string[];
}

// Normalize text for matching - remove accents and convert to lowercase
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const drAjudaResponses: DrAjudaResponseSystem = {
  topics: [
    {
      triggers: ['perder peso', 'emagrecer', 'saudável', 'de forma saudável', 'peso saudável'],
      responses: [
        '🌱 Para perder peso de forma saudável, combine uma alimentação equilibrada com exercícios regulares! O ideal é perder 0,5-1kg por semana. Que tal começar com pequenas mudanças na sua rotina?',
        '💚 O segredo está no equilíbrio! Foque em alimentos naturais, beba bastante água e inclua atividade física no seu dia. Lembre-se: não é uma corrida, é uma jornada de autocuidado!',
        '🏃‍♀️ Emagrecimento saudável é como plantar uma semente: precisa de tempo, cuidado e paciência! Coma bem, mova-se mais e seja gentil consigo mesmo no processo.',
        '✨ A fórmula mágica é simples: deficit calórico moderado + exercícios + sono de qualidade. Seu corpo merece esse carinho e você merece se sentir bem na sua pele!'
      ]
    },
    {
      triggers: ['noite', 'jantar', 'comer à noite', 'comer de noite', 'tarde'],
      responses: [
        '🌙 À noite, prefira alimentos leves e de fácil digestão! Proteínas magras, vegetais cozidos ou uma salada são ótimas opções. Evite frituras e doces pelo menos 2h antes de dormir.',
        '🥗 Que tal um jantar colorido? Peixes, frango grelhado, legumes no vapor ou uma sopa nutritiva são perfeitos para a noite. Seu sono (e seu corpo) vão agradecer!',
        '🍽️ A regra de ouro é: jantar como um pobre, mas de forma nutritiva! Aposte em refeições leves que nutrem sem pesar. Ovos mexidos com vegetais são uma delícia!',
        '⭐ À noite nosso metabolismo fica mais lento, então escolha alimentos que seu corpo consegue processar facilmente. Proteínas + vegetais = combinação perfeita!'
      ]
    },
    {
      triggers: ['treinar', 'treino', 'vezes por semana', 'quantas vezes', 'exercício', 'atividade física'],
      responses: [
        '💪 Para iniciantes, 3x por semana já faz uma diferença incrível! O importante é ser consistente. Comece devagar e vá aumentando gradualmente. Seu corpo precisa de tempo para se adaptar.',
        '🏋️‍♀️ O ideal são 150 minutos de atividade moderada por semana, ou seja, uns 30 min, 5x por semana. Mas se conseguir 3x já está ótimo! Qualidade é melhor que quantidade.',
        '🎯 Minha dica é: 3-4 vezes por semana com 1 dia de descanso entre os treinos. Assim você dá tempo pro corpo se recuperar e ficar mais forte. Que tal começar hoje?',
        '⚡ Para quem está começando: 3x por semana é perfeito! Alterne treinos de força com cardio e sempre inclua alongamento. Lembre-se: constância é a chave do sucesso!'
      ]
    },
    {
      triggers: ['motivação', 'desânimo', 'desmotivado', 'ânimo', 'desistir', 'difícil'],
      responses: [
        '🌟 Ei, você não está sozinho nessa jornada! Todo mundo tem dias difíceis, mas lembre-se: cada pequeno passo conta. Você já deu o primeiro passo ao buscar ajuda!',
        '💎 Sabe o que eu vejo em você? Uma pessoa corajosa que decidiu cuidar da própria saúde! Isso já é incrível. Nos dias difíceis, lembre-se do seu "porquê" e seja gentil consigo mesmo.',
        '🔥 A motivação vem e vai, mas os hábitos ficam! Comece pequeno: uma caminhada, um copo d\'água extra, uma refeição nutritiva. Pequenas vitórias constroem grandes conquistas!',
        '🌈 Você sabe que já superou 100% dos seus dias difíceis até agora? Isso mostra sua força! Confie no processo, confie em você. Estou aqui para te apoiar sempre!'
      ]
    }
  ],
  thankYouResponses: [
    '💚 Fico feliz em ajudar, você está no caminho certo!',
    '🌟 Continue firme, você merece cada conquista!',
    '👏 Parabéns pela dedicação, você está arrasando!',
    '☀️ Sempre que precisar, estarei por aqui!',
    '✨ É um prazer fazer parte da sua jornada de saúde!',
    '🤗 Que bom que posso te apoiar! Você está indo muito bem!',
    '💪 Juntos somos mais fortes! Continue assim!'
  ],
  fallbackResponses: [
    '🤔 Interessante! Embora eu não tenha uma resposta específica para isso, posso te ajudar com dicas sobre alimentação saudável, exercícios ou motivação. O que mais te interessa?',
    '💭 Hmm, não tenho certeza sobre essa pergunta específica, mas estou aqui para te ajudar com temas de saúde e bem-estar! Que tal me perguntar sobre nutrição ou atividade física?',
    '🌱 Essa é uma pergunta interessante! Minha especialidade são dicas de emagrecimento saudável, motivação e hábitos. Como posso te ajudar nesses temas?',
    '💚 Adoraria te ajudar mais! Sou especialista em questões de saúde, alimentação e exercícios. Tem alguma dúvida sobre esses assuntos?'
  ]
};

// Track last responses to avoid immediate repetition
let lastBotResponse = '';
let usedResponsesPerTopic: Map<string, Set<string>> = new Map();

export const getReply = (message: string): string => {
  const normalizedMessage = normalizeText(message);
  
  // Check for thank you messages
  if (normalizedMessage.includes('obrigado') || normalizedMessage.includes('obrigada') || normalizedMessage.includes('brigado')) {
    return getUniqueResponse(drAjudaResponses.thankYouResponses, 'thanks');
  }
  
  // Check for topic matches
  for (const topic of drAjudaResponses.topics) {
    for (const trigger of topic.triggers) {
      if (normalizedMessage.includes(normalizeText(trigger))) {
        const topicKey = topic.triggers[0]; // Use first trigger as key
        return getUniqueResponse(topic.responses, topicKey);
      }
    }
  }
  
  // Fallback response
  return getUniqueResponse(drAjudaResponses.fallbackResponses, 'fallback');
};

const getUniqueResponse = (responses: string[], topicKey: string): string => {
  // Initialize used responses set for this topic if not exists
  if (!usedResponsesPerTopic.has(topicKey)) {
    usedResponsesPerTopic.set(topicKey, new Set());
  }
  
  const usedResponses = usedResponsesPerTopic.get(topicKey)!;
  
  // If all responses have been used, reset the set
  if (usedResponses.size >= responses.length) {
    usedResponses.clear();
  }
  
  // Filter out used responses and the last bot response
  const availableResponses = responses.filter(response => 
    !usedResponses.has(response) && response !== lastBotResponse
  );
  
  // If no available responses (shouldn't happen with reset logic), use all responses
  const responsePool = availableResponses.length > 0 ? availableResponses : responses;
  
  // Select random response
  const selectedResponse = responsePool[Math.floor(Math.random() * responsePool.length)];
  
  // Track usage
  usedResponses.add(selectedResponse);
  lastBotResponse = selectedResponse;
  
  return selectedResponse;
};