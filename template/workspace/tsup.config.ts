import { log } from 'node:console';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'tsup';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function getFileJson(file: string): Partial<Record<string, any>> {
  const filepath = resolve(process.cwd(), file);
  if (!existsSync(filepath)) return {};
  const str = readFileSync(filepath, 'utf-8');
  let json;
  try {
    json = JSON.parse(str);
  } catch (e) {
    throw new Error(`Parse Error at ${filepath}: ${String(e)}`);
  }
  return json;
}

export default defineConfig((options) => {
  if (!options.silent) log('Dir:', process.cwd());

  return {
    entryPoints: ['./src'],
    outDir: getFileJson('tsconfig.json')?.compilerOptions?.outDir ?? './dist',
    bundle: false,
    clean: !!process.argv.find((el) => el === '--define.env=prod')
  };
});
