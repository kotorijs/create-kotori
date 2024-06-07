#!/usr/bin/env tsx

import { Loader } from 'kotori-bot';
import { resolve } from 'node:path';

const kotori = new Loader({ mode: 'dev', dir: resolve(__dirname, '../')  });
kotori.run();
