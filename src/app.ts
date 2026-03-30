import Fastify from 'fastify';
import AutoLoad from '@fastify/autoload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({
  logger: true,
});

const start = async () => {
  try {
    await app.register(AutoLoad, {
      dir: join(__dirname, 'plugins'),
      options: { someGlobalConfig: true }
    });

    await app.register(AutoLoad, {
      dir: join(__dirname, 'modules'),
      options: { prefix: '/api' },
      dirNameRoutePrefix: true,
      matchFilter: (path) => path.endsWith('index.ts') || path.endsWith('index.js'),
    });

    await app.listen({ port: app.config.PORT });
  } catch (err) {
    app.log.error(err);
  }
};

start();