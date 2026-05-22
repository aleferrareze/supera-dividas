import { Question } from '../types/exam';

export const questions: Question[] = [
  {
    id: 1,
    category: 'Triagem Jurídica',
    statement:
      'Em uma triagem penal, o primeiro critério de classificação de urgência deve considerar principalmente:',
    options: [
      { id: 'A', text: 'A capacidade financeira do cliente e a origem do lead.' },
      {
        id: 'B',
        text: 'A existência de prisão, mandado, audiência próxima ou prazo processual.',
      },
      { id: 'C', text: 'O número de documentos enviados pelo cliente.' },
      { id: 'D', text: 'A gravidade abstrata do crime informado.' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 2,
    category: 'Triagem Jurídica',
    statement:
      'Um familiar informa que o investigado foi preso em flagrante durante a madrugada e ainda não passou por audiência de custódia. A providência mais adequada na triagem é:',
    options: [
      {
        id: 'A',
        text: 'Classificar como atendimento comum e aguardar envio completo dos autos.',
      },
      {
        id: 'B',
        text: 'Solicitar apenas comprovante de residência e informar que o caso será analisado posteriormente.',
      },
      {
        id: 'C',
        text: 'Classificar como urgência máxima, colher dados da prisão, local de custódia e documentos disponíveis.',
      },
      { id: 'D', text: 'Encaminhar diretamente para execução penal.' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 3,
    category: 'Triagem Jurídica',
    statement:
      'Ao perguntar se o caso está em boletim de ocorrência, inquérito, denúncia, ação penal, recurso ou execução penal, o formulário busca identificar:',
    options: [
      {
        id: 'A',
        text: 'A fase procedimental e o tipo de estratégia jurídica possível.',
      },
      { id: 'B', text: 'A renda mensal do cliente.' },
      { id: 'C', text: 'O grau de confiança do cliente no escritório.' },
      { id: 'D', text: 'A forma de pagamento mais adequada.' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 4,
    category: 'Direito Penal',
    statement:
      'Qual conjunto de informações é mais relevante para uma análise inicial de pedido de liberdade?',
    options: [
      {
        id: 'A',
        text: 'Origem do lead, preferência de contato e horário disponível.',
      },
      {
        id: 'B',
        text: 'Local da prisão, tipo de prisão, audiência de custódia, antecedentes, residência fixa e trabalho.',
      },
      {
        id: 'C',
        text: 'Número de seguidores do cliente e valor disponível para entrada.',
      },
      { id: 'D', text: 'Apenas o relato emocional da família.' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 5,
    category: 'Direito Penal',
    statement:
      'A existência de residência fixa, ocupação lícita e dependentes é relevante, sobretudo, para:',
    options: [
      {
        id: 'A',
        text: 'Demonstrar condições pessoais favoráveis em pedidos de liberdade ou medidas cautelares.',
      },
      {
        id: 'B',
        text: 'Comprovar automaticamente a inocência do acusado.',
      },
      {
        id: 'C',
        text: 'Impedir o oferecimento de denúncia pelo Ministério Público.',
      },
      {
        id: 'D',
        text: 'Anular qualquer mandado de prisão existente.',
      },
    ],
    correctAnswer: 'A',
  },
  {
    id: 6,
    category: 'Direito Penal',
    statement:
      'Em relação às provas, a pergunta sobre câmeras de segurança, testemunhas, prints, áudios e documentos tem como finalidade principal:',
    options: [
      {
        id: 'A',
        text: 'Substituir a análise jurídica feita pelo advogado.',
      },
      {
        id: 'B',
        text: 'Identificar elementos que podem confirmar, esclarecer ou contestar a narrativa dos fatos.',
      },
      {
        id: 'C',
        text: 'Garantir que a pessoa investigada será absolvida.',
      },
      {
        id: 'D',
        text: 'Evitar que o escritório precise acessar o processo.',
      },
    ],
    correctAnswer: 'B',
  },
  {
    id: 7,
    category: 'Processo Penal',
    statement:
      'Qual situação indica possível necessidade de análise de nulidade ou ilicitude probatória?',
    options: [
      {
        id: 'A',
        text: 'O cliente possui comprovante de residência em nome próprio.',
      },
      {
        id: 'B',
        text: 'A pessoa foi intimada para comparecer em audiência.',
      },
      {
        id: 'C',
        text: 'Houve entrada em domicílio sem mandado, consentimento válido ou situação flagrancial clara.',
      },
      {
        id: 'D',
        text: 'O familiar não sabe informar o número do processo.',
      },
    ],
    correctAnswer: 'C',
  },
  {
    id: 8,
    category: 'Execução Penal',
    statement:
      'Em um caso de execução penal, qual combinação de dados é mais importante para análise de benefícios?',
    options: [
      {
        id: 'A',
        text: 'Nome do advogado anterior, origem do lead e horário preferido de atendimento.',
      },
      {
        id: 'B',
        text: 'Unidade prisional, regime atual, pena aplicada, cálculo de pena, faltas graves, trabalho/estudo e datas de requisito.',
      },
      { id: 'C', text: 'Apenas o crime da condenação.' },
      { id: 'D', text: 'Apenas a cidade onde reside a família.' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 9,
    category: 'Execução Penal',
    statement:
      'A pergunta sobre falta grave em execução penal é relevante porque ela pode:',
    options: [
      {
        id: 'A',
        text: 'Alterar a estratégia comercial do escritório, mas não interfere na pena.',
      },
      {
        id: 'B',
        text: 'Impactar benefícios como progressão de regime, livramento condicional e remição.',
      },
      {
        id: 'C',
        text: 'Extinguir automaticamente a punibilidade.',
      },
      {
        id: 'D',
        text: 'Impedir definitivamente qualquer novo pedido.',
      },
    ],
    correctAnswer: 'B',
  },
  {
    id: 10,
    category: 'Atendimento Jurídico',
    statement:
      'Quando o formulário pergunta se o cliente já possui advogado no caso, a principal preocupação é:',
    options: [
      { id: 'A', text: 'Evitar análise jurídica do caso.' },
      {
        id: 'B',
        text: 'Verificar questões éticas, atuação anterior, documentos já produzidos e eventual necessidade de substabelecimento ou revogação.',
      },
      {
        id: 'C',
        text: 'Encerrar automaticamente o atendimento.',
      },
      {
        id: 'D',
        text: 'Definir que o caso não pode ser aceito.',
      },
    ],
    correctAnswer: 'B',
  },
  {
    id: 11,
    category: 'Atendimento Jurídico',
    statement:
      'A coleta de autorização para contato por WhatsApp, envio de atualizações e tratamento de dados pessoais está relacionada principalmente a:',
    options: [
      {
        id: 'A',
        text: 'Gestão de atendimento, comunicação consentida e proteção de dados.',
      },
      {
        id: 'B',
        text: 'Definição da competência criminal.',
      },
      { id: 'C', text: 'Fixação da pena-base.' },
      { id: 'D', text: 'Escolha da tese absolutória.' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 12,
    category: 'Gestão',
    statement:
      'A classificação interna "novo lead, aguardando documentos, proposta enviada, follow-up, contratado ou perdido" tem função de:',
    options: [
      {
        id: 'A',
        text: 'Controle de CRM e organização do fluxo comercial.',
      },
      { id: 'B', text: 'Controle de regime prisional.' },
      { id: 'C', text: 'Cálculo de prescrição penal.' },
      { id: 'D', text: 'Registro de antecedentes criminais.' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 13,
    category: 'Automação e Softwares',
    statement: 'O Pipefy é utilizado principalmente para:',
    options: [
      { id: 'A', text: 'Emitir notas fiscais.' },
      {
        id: 'B',
        text: 'Gerenciar fluxos de trabalho automatizados.',
      },
      { id: 'C', text: 'Agendar reuniões com clientes.' },
      { id: 'D', text: 'Controlar prazos processuais.' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 14,
    category: 'Automação e Softwares',
    statement: 'O ASAAS é uma ferramenta utilizada para:',
    options: [
      {
        id: 'A',
        text: 'Emitir faturas de cobrança e gerenciar pagamentos.',
      },
      { id: 'B', text: 'Gerenciar documentos jurídicos.' },
      { id: 'C', text: 'Controlar o fluxo de caixa.' },
      { id: 'D', text: 'Organizar planilhas financeiras.' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 15,
    category: 'Automação e Softwares',
    statement: 'O MindMeister é utilizado para:',
    options: [
      { id: 'A', text: 'Controlar assinaturas digitais.' },
      {
        id: 'B',
        text: 'Criar mapas mentais para organizar ideias.',
      },
      { id: 'C', text: 'Gerenciar planilhas financeiras.' },
      { id: 'D', text: 'Controlar prazos de vencimento.' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 16,
    category: 'Automação e Softwares',
    statement: 'ZapSign é uma ferramenta útil para:',
    options: [
      {
        id: 'A',
        text: 'Criar mapas mentais para planejamento estratégico.',
      },
      {
        id: 'B',
        text: 'Organizar e acompanhar prazos processuais.',
      },
      {
        id: 'C',
        text: 'Assinaturas digitais de documentos jurídicos de maneira segura e rápida.',
      },
      { id: 'D', text: 'Emitir cobranças e faturas.' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 17,
    category: 'Automação e Softwares',
    statement: 'O Calendly permite:',
    options: [
      { id: 'A', text: 'Criação de documentos jurídicos.' },
      {
        id: 'B',
        text: 'O agendamento de reuniões e compromissos de maneira automatizada com os leads.',
      },
      { id: 'C', text: 'Gestão de prazos processuais.' },
      {
        id: 'D',
        text: 'Controle de entrada e saída de funcionário.',
      },
    ],
    correctAnswer: 'B',
  },
  {
    id: 18,
    category: 'Automação e Softwares',
    statement: 'Legalcloud é conhecido por:',
    options: [
      {
        id: 'A',
        text: 'Oferecer ferramentas de gerenciamento financeiro para advogados.',
      },
      {
        id: 'B',
        text: 'Emissão de notas fiscais e documentos financeiros.',
      },
      {
        id: 'C',
        text: 'Ser um software de controle de prazos processuais e acompanhamento de processos judiciais.',
      },
      {
        id: 'D',
        text: 'Gerenciar contratos e assinaturas digitais.',
      },
    ],
    correctAnswer: 'C',
  },
  {
    id: 19,
    category: 'Automação e Softwares',
    statement: 'O Notion é uma plataforma usada para:',
    options: [
      {
        id: 'A',
        text: 'Gestão de conhecimento, organização de tarefas e armazenamento de documentos colaborativos.',
      },
      {
        id: 'B',
        text: 'Acompanhamento de prazos processuais.',
      },
      {
        id: 'C',
        text: 'Realização de reuniões com clientes.',
      },
      {
        id: 'D',
        text: 'Controle de pagamentos e cobranças.',
      },
    ],
    correctAnswer: 'A',
  },
  {
    id: 20,
    category: 'Automação e Softwares',
    statement: 'Thunderbird é utilizado para:',
    options: [
      {
        id: 'A',
        text: 'Gerenciamento de e-mails corporativos.',
      },
      { id: 'B', text: 'Criação de relatórios financeiros.' },
      {
        id: 'C',
        text: 'Compartilhamento de documentos em tempo real.',
      },
      { id: 'D', text: 'Controle de prazos processuais.' },
    ],
    correctAnswer: 'A',
  },
];
