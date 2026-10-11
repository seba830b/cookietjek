// CORE + POOL. pool.mjs belongs to the recipe agent / weekly routine; tolerate it missing.
import { CORE } from './core.mjs';
let POOL = [], POOL_PRODUCTS = {};
try { ({ POOL = [], POOL_PRODUCTS = {} } = await import('./pool.mjs')); } catch (e) {
  if (e && e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
}
export { CORE, POOL, POOL_PRODUCTS };
export const ALL = [...CORE, ...POOL];
