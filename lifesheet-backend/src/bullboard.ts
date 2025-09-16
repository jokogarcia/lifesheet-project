import { Express } from 'express';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import tailorCVQueue from './q/tailorcv';
import tailorWorkExperienceQueue from './q/tailor-work-experience';
import createJobSummaryQueue from './q/create-job-summary';
import tailorSkillsQueue from './q/tailor-skills';
import createCoverLetterQueue from './q/create-cover-letter';
import translateCVQueue from './q/translate-cv';

export function setupBullBoard(app: Express, route = '/bull') {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(route);
  createBullBoard({
    queues: [
      new BullMQAdapter(tailorCVQueue),
      new BullMQAdapter(tailorWorkExperienceQueue),
      new BullMQAdapter(createJobSummaryQueue),
      new BullMQAdapter(tailorSkillsQueue),
      new BullMQAdapter(createCoverLetterQueue),
      new BullMQAdapter(translateCVQueue),
    ],
    serverAdapter,
  });
  app.use(route, serverAdapter.getRouter());
}
