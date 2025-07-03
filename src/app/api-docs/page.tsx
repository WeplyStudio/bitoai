
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageProvider';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Footer } from '@/components/layout/footer';
import { Code, Terminal } from 'lucide-react';

const ApiDocsPage = () => {
  const { t } = useLanguage();

  const documentationContent = `
### Introduction
Welcome to the Bito AI API documentation. This API allows you to integrate Bito's powerful conversational AI into your own applications, scripts, or services.

### Authentication
The API uses **Basic Authentication**. You must provide your Bito AI username and password in the \`Authorization\` header of your request.

- **Username**: Your Bito AI account username.
- **Password**: Your Bito AI account password.

The value for the \`Authorization\` header should be \`Basic \` followed by a base64-encoded string of \`username:password\`.

---

### Endpoints

#### 1. Chat Completion
This is the primary endpoint for interacting with the AI.

- **Method**: \`POST\`
- **URL**: \`/api/v1/chat\`

##### Headers
| Key             | Value                                     |
|-----------------|-------------------------------------------|
| \`Content-Type\`  | \`application/json\`                        |
| \`Authorization\` | \`Basic <base64(username:password)>\` |

##### Request Body (JSON)
| Field     | Type     | Required | Description                                                                                                                              |
|-----------|----------|----------|------------------------------------------------------------------------------------------------------------------------------------------|
| \`message\`   | \`string\` | Yes      | The user's prompt or message to the AI.                                                                                                  |
| \`mode\`      | \`string\` | No       | The AI personality mode. If omitted, defaults to \`default\`. Available pro modes: \`storyteller\`, \`sarcastic\`, \`technical\`, \`philosopher\`. |

##### Example Request (\`curl\`)
\`\`\`bash
curl -X POST https://bitoai.my.id/api/v1/chat \\
-H "Content-Type: application/json" \\
-H "Authorization: Basic YOUR_BASE64_AUTH_STRING" \\
-d '{
  "message": "Hello, who are you?",
  "mode": "professional"
}'
\`\`\`

##### Response Body (JSON)
| Field                             | Type     | Description                                                                 |
|-----------------------------------|----------|-----------------------------------------------------------------------------|
| \`response\`                        | \`string\` | The AI's generated text response.                                           |
| \`credits_remaining\`               | \`number\` | The number of credits left in your account after this request.                |
| \`requests_until_next_deduction\` | \`number\` | The number of free API requests remaining before the next credit is deducted. |

---

### Credit System
API usage is metered to ensure fair use and maintain service quality.

- **Rate**: 1 credit is consumed for every 100 successful API requests.
- **Tracking**: The response body includes fields to help you track your remaining credits and requests.
- **Topping Up**: To purchase more credits for API usage, please visit the [Top Up page](/pricing) and contact the admin.
  `;

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
                <Code className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('apiKey')} Documentation</h1>
              <p className="text-muted-foreground">Integrate Bito AI into your own applications.</p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Terminal /> Getting Started</CardTitle>
              <CardDescription>
                Follow these instructions to start making requests to the Bito AI API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {documentationContent}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default ApiDocsPage;
