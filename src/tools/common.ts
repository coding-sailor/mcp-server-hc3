export type McpResponse = {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
  structuredContent?: Record<string, unknown>;
};

export function createErrorResponse(error: unknown): McpResponse {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
    ],
    isError: true,
  };
}

export function createSuccessResponse(message: string): McpResponse {
  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
}
