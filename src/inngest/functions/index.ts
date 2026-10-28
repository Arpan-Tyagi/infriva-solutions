import { leadReceived, slaSweeper } from './lead-received';
import { quoteSubmitted, quoteReviewed, followUpReminder, leadStageChanged } from './sales-workflow';
import { metaLeadsReconcile } from './meta-reconcile';

export const functions = [
  leadReceived,
  slaSweeper,
  quoteSubmitted,
  quoteReviewed,
  followUpReminder,
  leadStageChanged,
  metaLeadsReconcile,
];
