import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (app) => {
  const isHeaderEnabled = process.env.NODE_ENV !== 'production';

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    addHeaders: {
      'x-ratelimit-limit': isHeaderEnabled,
      'x-ratelimit-remaining': isHeaderEnabled,
      'x-ratelimit-reset': isHeaderEnabled,
      'retry-after': isHeaderEnabled,
    },
    addHeadersOnExceeding: {
      'x-ratelimit-limit': isHeaderEnabled,
      'x-ratelimit-remaining': isHeaderEnabled,
      'x-ratelimit-reset': isHeaderEnabled,
    }
  });
});