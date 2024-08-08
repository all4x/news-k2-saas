import Fastify from 'fastify';
import axios from 'axios';
import cheerio from 'cheerio';

interface Article {
  title: string;
  link: string;
  img?: string;
  time: string;
}

interface ArticleContent {
  title: string;
  cleanContent: string;
  img?: string;
}

const fastify = Fastify({
  logger: true
});

// Função para realizar o web scraping e obter as últimas 10 notícias
async function scrapeData(): Promise<Article[] | undefined> {
  try {
    const response = await axios.get('https://canalsolar.com.br/noticias/');
    const $ = cheerio.load(response.data);

    const articles: Article[] = [];

    $('.elementor.elementor-527201.e-loop-item').each((index, element) => {
      if (index < 10) { // Limita a 10 artigos
        const title = $(element).find('h3').text().trim(); // Extrai o título da notícia
        const link = $(element).find('a').attr('href'); // Extrai o link da notícia
        let img = $(element).find('a > img').attr('data-lazy-src') || $(element).find('a > img').attr('src');
        const time = $(element).find('time').text();

        if (title && link) {
          // Converte o URL da imagem para absoluto se for relativo
          const imageUrl = img ? (img.startsWith('http') ? img : `https://canalsolar.com.br${img}`) : undefined;
          articles.push({ title, link, img: imageUrl, time });
        }
      }
    });

    return articles;
  } catch (error) {
    console.error('Erro ao fazer web scraping:', error);
    return undefined;
  }
}

async function scrapeContent(url: string): Promise<ArticleContent | undefined> {

  function limparTextoSemLinks(texto: string): string {
    // Remove links
    texto = texto.replace(/https?:\/\/\S+/g, '');
    // Remove tags HTML
    texto = texto.replace(/<[^>]*>/g, '');
    // Remove espaços em branco extras
    texto = texto.replace(/\s+/g, ' ').trim();
    return texto;
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('h1').text().trim();
    const img = $('img').first().attr('src');
    let content = $('.elementor-widget-container').text().trim(); // Seleciona o conteúdo pela classe

    // Limpa o conteúdo de espaços extras e quebras de linha
    content = content.replace(/\n\s*\n/g, '\n').trim();

    const cleanContent = limparTextoSemLinks(content)

    if (title && content) {
      return { title, img, cleanContent };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Erro ao fazer web scraping do conteúdo:', error);
    return undefined;
  }
}

// Rota para retornar as últimas 10 notícias
fastify.get('/news', async (request, reply) => {
  const news = await scrapeData();
  if (news) {
    return news;
  } else {
    reply.code(500).send({ error: 'Erro ao obter notícias.' });
  }
});

// Rota para pegar o conteúdo da notícia
fastify.get('/news-content', async (request, reply) => {
  const { url } = request.query as { url: string };
  if (!url) {
    reply.code(400).send({ error: 'URL da notícia é necessária.' });
    return;
  }

  const content = await scrapeContent(url);
  console.log(content)
  if (content) {
    return content;
  } else {
    reply.code(500).send({ error: 'Erro ao obter conteúdo da notícia.' });
  }
});

// Iniciar o servidor Fastify
const start = async () => {
  try {
    await fastify.listen({
      host: '0.0.0.0',
      port: process.env.PORT ? Number(process.env.PORT) : 3333

    });
    fastify.log.info(`Servidor Fastify rodando em http://localhost:80`);
  } catch (err) {
    fastify.log.error(`Erro ao iniciar o servidor: ${err}`);
    process.exit(1);
  }
};

start();

