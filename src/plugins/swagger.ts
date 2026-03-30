import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { RouteOptions } from 'fastify';

export default fp(async (app) => {
  await app.register(fastifySwagger, {
    openapi: {
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter Access Token'
          }
        }
      }
    },
  });

  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });

  app.addHook('onRoute', routeOptions => {
    if (!routeOptions.schema) routeOptions.schema = {};

    applyAutoTags(routeOptions);
    applySecurityLock(routeOptions, app.isAuth);
  });
});


function applyAutoTags(routeOptions: RouteOptions) {
  const parts = routeOptions.url.split('/');
  const segment = parts[2];

  if (segment && (!routeOptions.schema || !routeOptions.schema.tags)) {
    const tagName = segment.charAt(0).toUpperCase() + segment.slice(1);
    routeOptions.schema = {
      ...routeOptions.schema,
      tags: [tagName]
    };
  }
};

function applySecurityLock(routeOptions: RouteOptions, authDecorator: any) {
  const handlers = [routeOptions.preValidation, routeOptions.preHandler].flat();
  const isProtected = handlers.some(h => h === authDecorator);

  if (isProtected) {
    routeOptions.schema = {
      ...routeOptions.schema,
      security: [{ bearerAuth: [] }]
    };
  }
};