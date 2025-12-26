// In-memory storage for clipboard items
export interface ClipboardItem {
  code: string;
  type: 'text' | 'image';
  content: string; // text content or base64 image
  createdAt: Date;
}

// Simple in-memory store
const store: Map<string, ClipboardItem> = new Map();

export const generateCode = (): string => {
  let code: string;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (store.has(code));
  return code;
};

export const saveItem = (type: 'text' | 'image', content: string): string => {
  const code = generateCode();
  store.set(code, {
    code,
    type,
    content,
    createdAt: new Date(),
  });
  return code;
};

export const getItem = (code: string): ClipboardItem | undefined => {
  return store.get(code);
};

export const hasItem = (code: string): boolean => {
  return store.has(code);
};
