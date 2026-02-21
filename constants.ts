
import { Post, User, Lesson } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Diretor ESF',
    email: 'admin@esf.com',
    role: 'admin',
    avatar: 'https://picsum.photos/seed/admin/200',
    bio: 'Gestor da Escola de Sabedoria Finanças.'
  },
  {
    id: 'mentor-1',
    name: 'Professor Silas',
    email: 'mentor@esf.com',
    role: 'mentor',
    avatar: 'https://picsum.photos/seed/mentor/200',
    bio: 'Mentor sênior especialista em mordomia cristã.'
  },
  {
    id: 'user-1',
    name: 'Tiago Aprendiz',
    email: 'aluno@esf.com',
    role: 'student',
    avatar: 'https://picsum.photos/seed/student/200',
    bio: 'Buscando sabedoria para gerir meus primeiros frutos.'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    userId: 'admin-1',
    title: 'Mentalidade de Riqueza',
    summary: 'A verdadeira riqueza começa na mente e no espírito. Nesta aula, exploramos como a mordomia cristã transforma nossa visão sobre o dinheiro, saindo da escassez para a abundância com propósito.',
    exercises: [
      { scenario: 'Identificando Crenças', instructions: 'Escreva 3 frases que você ouviu sobre dinheiro na infância e como elas afetam sua visão hoje.' },
      { scenario: 'Gratidão Ativa', instructions: 'Liste 5 coisas não materiais pelas quais você é grato e como o dinheiro poderia potencializar sua ajuda a outros nessas áreas.' },
      { scenario: 'Propósito Financeiro', instructions: 'Se você ganhasse 1 milhão hoje, qual seria a primeira causa social ou espiritual que você apoiaria e por quê?' }
    ],
    tests: Array.from({ length: 10 }, (_, i) => ({
      question: `Questão ${i + 1}: O que define um bom mordomo financeiro?`,
      options: ['Acumular sem limites', 'Gastar com prazer imediato', 'Gerir recursos para a glória de Deus', 'Esconder o talento no chão'],
      correctIndex: 2,
      explanation: 'A mordomia cristã foca na gestão responsável dos recursos que nos foram confiados.'
    })),
    article: '# Rompendo as Correntes da Mente\n\nNossas ações são frutos de nossas convicções. Se você acredita que o dinheiro é a raiz de todo mal (interpretando mal a bíblia, que diz que o AMOR ao dinheiro é a raiz), você sabotará seu sucesso.\n\nPrecisamos entender que o dinheiro é uma ferramenta neutra que amplia quem nós já somos. Ser rico para ser generoso é um chamado bíblico de provisão.',
    sources: [],
    timestamp: Date.now() - 10000000
  },
  {
    id: 'lesson-2',
    userId: 'admin-1',
    title: 'O Poder dos Juros Compostos',
    summary: 'Entenda como o tempo é o seu maior aliado na construção de patrimônio. Juros compostos são a oitava maravilha do mundo: quem entende, ganha; quem não entende, paga.',
    exercises: [
      { scenario: 'Cálculo de Longo Prazo', instructions: 'Se você poupar 50 reais por mês a uma taxa de 1% ao mês, quanto terá em 10 anos? Descreva o impacto do tempo.' },
      { scenario: 'Paciência vs Imediatismo', instructions: 'Dê um exemplo de algo que você quis comprar por impulso e como o valor desse item investido hoje renderia em 5 anos.' },
      { scenario: 'Investimento em Si Mesmo', instructions: 'Qual habilidade você pode aprender hoje que aumentará seu valor de mercado no futuro?' }
    ],
    tests: Array.from({ length: 10 }, (_, i) => ({
      question: `Questão ${i + 1}: Qual o fator mais importante nos juros compostos?`,
      options: ['O valor inicial', 'A cor da nota', 'O tempo de exposição', 'A sorte'],
      correctIndex: 2,
      explanation: 'O tempo é a variável exponencial na fórmula dos juros compostos.'
    })),
    article: '# A Mágica do Tempo\n\nOs juros compostos trabalham enquanto você dorme. Começar cedo, mesmo com pouco, é melhor do que começar tarde com muito. A disciplina supera o talento quando o assunto é acumulação de longo prazo.',
    sources: [],
    timestamp: Date.now() - 5000000
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'admin-1',
    userName: 'Admin ESF',
    userAvatar: 'https://picsum.photos/seed/admin/200',
    type: 'article',
    content: 'A regra dos 50-30-20 é essencial para quem está começando. 50% para necessidades, 30% para desejos e 20% para poupar.',
    title: 'Como dividir sua mesada',
    description: 'Dica de ouro para quem quer ter dinheiro sempre!',
    sourceUrl: 'https://escoladesabedoria.org/regra-50-30-20',
    likes: ['user-1'],
    comments: [
      { id: 'c1', userId: 'user-1', userName: 'Tiago Aprendiz', text: 'Valeu pela dica! Começo hoje.', timestamp: Date.now() }
    ],
    views: 154,
    timestamp: Date.now() - 3600000
  }
];
