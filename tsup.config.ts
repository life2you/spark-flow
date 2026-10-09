import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react-flow': 'src/react-flow/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  tsconfig: './tsconfig.lib.json',
  external: ['react', 'react-dom', '@xyflow/react', 'lucide-react'],
  banner: {
    js: '"use client";',
  },
});
