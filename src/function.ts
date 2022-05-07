import { createNodeMiddleware, createProbot } from 'probot';
import app from './app';

exports.probotApp = createNodeMiddleware(app, { probot: createProbot() });
