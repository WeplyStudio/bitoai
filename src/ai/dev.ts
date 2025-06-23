import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-prompt.ts';
import '@/ai/flows/summarize-chat.ts';
import '@/ai/flows/feedback-incorporation.ts';