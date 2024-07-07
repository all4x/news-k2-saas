import Fastify from 'fastify';
import axios from 'axios';
import cheerio from 'cheerio';

interface Article {
  title: string;
  link: string;
  img?: string;
  time: string;
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

// Rota para retornar as últimas 10 notícias
fastify.get('/news', async (request, reply) => {
  const news = await scrapeData();
  if (news) {
    return news;
  } else {
    reply.code(500).send({ error: 'Erro ao obter notícias.' });
  }
});

// Iniciar o servidor Fastify
const start = async () => {
  try {
    await fastify.listen({ port: 3002 });
    fastify.log.info(`Servidor Fastify rodando em http://localhost:3002`);
  } catch (err) {
    fastify.log.error(`Erro ao iniciar o servidor: ${err}`);
    process.exit(1);
  }
};

start();

