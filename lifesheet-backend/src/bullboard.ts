import { Express } from 'express';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import tailorCVQueue from './q/tailorcv';

export function setupBullBoard(app: Express, route = '/bull') {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(route);
  createBullBoard({
    queues: [new BullMQAdapter(tailorCVQueue)],
    serverAdapter,
  });
  app.use(route, serverAdapter.getRouter());
}
