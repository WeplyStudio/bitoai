import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-chat.ts';
import '@/ai/flows/feedback-incorporation.ts';
import '@/ai/flows/rename-project-flow.ts';
import '@/ai/flows/generate-username-flow.ts';
