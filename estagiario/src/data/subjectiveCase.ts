export const SUBJECTIVE_CASE = {
  enunciado: `A candidata ou o candidato atua como advogado(a) criminal contratado pela família de Rafael Souza, condenado definitivamente à pena de 6 anos de reclusão, em regime inicialmente fechado, pela prática do crime de roubo simples.

Rafael iniciou o cumprimento da pena em 10/01/2023. Durante a execução penal, trabalhou regularmente dentro da unidade prisional por 210 dias, conforme atestado de trabalho juntado aos autos. Também concluiu curso educacional reconhecido pela administração penitenciária, com carga horária de 120 horas.

O sentenciado possui bom comportamento carcerário, comprovado por boletim informativo da unidade prisional. Não há registro de falta grave nos últimos 12 meses. A família informa que ele possui residência fixa e proposta de emprego lícito ao sair.

Apesar disso, o pedido administrativo de progressão de regime ainda não foi analisado. A família procura o escritório porque entende que Rafael já cumpriu tempo suficiente para progredir ao regime semiaberto.

Na qualidade de advogado(a), elabore a peça processual cabível, fundamentando juridicamente o pedido, incluindo os requerimentos adequados.`,

  instrucoes: [
    'Elabore a peça processual completa, com endereçamento correto ao Juízo da Vara de Execuções Criminais.',
    'Qualifique o sentenciado e indique o processo de execução penal.',
    'Demonstre o preenchimento dos requisitos objetivo e subjetivo para progressão de regime.',
    'Calcule a remição de pena por trabalho e estudo e inclua no pedido.',
    'Utilize fundamentação jurídica baseada na LEP e na Constituição Federal.',
    'Formule todos os pedidos cabíveis, inclusive juntada de documentos e intimação do MP.',
  ],

  criterios: [
    { item: 'Identificação correta da peça e endereçamento', pontos: 10 },
    { item: 'Qualificação mínima do sentenciado', pontos: 10 },
    { item: 'Cabimento e base legal (art. 112 e 126 da LEP)', pontos: 10 },
    { item: 'Cálculo do requisito objetivo (16% de 72 meses)', pontos: 15 },
    { item: 'Cálculo da remição (70 dias trabalho + 10 dias estudo)', pontos: 15 },
    { item: 'Análise do requisito subjetivo', pontos: 10 },
    { item: 'Fundamentação jurídica (LEP + CF)', pontos: 15 },
    { item: 'Pedidos completos e corretos', pontos: 10 },
    { item: 'Clareza, organização e linguagem profissional', pontos: 5 },
  ],
};

export const AI_CORRECTION_PROMPT = `Você é um corretor jurídico especializado em Direito Penal e Execução Penal.
Sua função é corrigir uma prova subjetiva aplicada em processo seletivo para vaga em escritório de advocacia.

A prova exige a elaboração de uma peça processual no estilo OAB, com base em caso prático de execução penal envolvendo pedido de progressão de regime com remição de pena.

Corrija a resposta do candidato com rigor técnico, mas de forma objetiva.

Atribua nota de 0 a 100, usando os seguintes critérios:
1. Identificação correta da peça cabível — 10 pontos
2. Endereçamento e estrutura formal da peça — 10 pontos
3. Análise correta dos fatos relevantes — 10 pontos
4. Cálculo do requisito objetivo para progressão — 15 pontos
5. Cálculo da remição por trabalho e estudo — 15 pontos
6. Análise do requisito subjetivo — 10 pontos
7. Fundamentação jurídica com base na LEP e Constituição — 15 pontos
8. Formulação correta dos pedidos — 10 pontos
9. Clareza, organização e linguagem profissional — 5 pontos

Ao corrigir, siga EXATAMENTE este formato:

NOTA FINAL: ___/100

CLASSIFICAÇÃO: [Excelente / Muito bom / Bom / Regular / Insuficiente]

PONTOS POSITIVOS:
[Liste os principais acertos]

PONTOS DE ATENÇÃO:
[Liste os erros, omissões ou fragilidades]

ANÁLISE TÉCNICA:
[Explique se a peça foi identificada corretamente, se os cálculos foram feitos adequadamente e se os pedidos foram bem formulados]

RISCO PRÁTICO:
[Informe se a peça, caso fosse protocolada, teria boa chance de ser compreendida e analisada pelo juízo]

RECOMENDAÇÃO: [aprovado / aprovado com ressalvas / mantido em análise / reprovado]

Penalize erros graves como: escolha de peça errada; ausência de pedido de remição; ausência de cálculo objetivo; fundamentação genérica; pedidos incompatíveis; linguagem confusa ou desorganizada.`;
