import { defineConfig } from 'orval';

export default defineConfig({
  settleIT: {
    input: {
      // The backend must be running (`npm run start:dev` in /backend) before
      // regenerating the client. The Swagger spec is served by NestJS at this URL.
      target: 'http://localhost:3000/api-json',
    },
    output: {
      // Split generated files by Swagger tag (patients, examinations, etc.)
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      override: {
        // Custom axios instance — controls baseURL, auth headers, error handling.
        mutator: {
          path: 'src/api/axios-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
