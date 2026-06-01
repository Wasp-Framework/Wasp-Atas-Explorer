import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_PAGES_BASE_PATH = '/Wasp-Atas-Explorer/';

function normalizeBasePath(value) {
  if (!value || value === '/') {
    return '/';
  }

  const trimmed = value.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

function resolveBasePath(mode) {
  if (process.env.VITE_BASE_PATH) {
    return normalizeBasePath(process.env.VITE_BASE_PATH);
  }

  if (mode !== 'production') {
    return '/';
  }

  const repoName = process.env.GITHUB_REPOSITORY?.split('/').pop();
  return normalizeBasePath(repoName ? `/${repoName}/` : DEFAULT_PAGES_BASE_PATH);
}

export default defineConfig(({ mode }) => ({
  root: __dirname,
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist')
  },
  base: resolveBasePath(mode),
}));
