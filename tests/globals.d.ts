// Augment Window so page.evaluate() callbacks can reference window.formatpad
interface Window {
  formatpad: {
    platform: string;
    dropFile: (path: string) => void;
    autoSaveRecovery: (filePath: string | null, content: string) => Promise<void>;
    clearRecovery: (filePath: string | null) => Promise<void>;
    saveFile: (filePath: string, content: string) => Promise<unknown>;
    saveFileAs: (content: string) => Promise<unknown>;
    openFileDialog: () => Promise<unknown>;
    getSystemTheme: () => Promise<string>;
    setTitle: (title: string) => void;
    [key: string]: unknown;
  };
}
