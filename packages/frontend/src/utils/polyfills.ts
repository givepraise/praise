/**
 * This is used for loading Rainbow Kit
 * Wallet Connect option for logging
 */

import { Buffer } from 'buffer';

window.global = window.global ?? window;
window.Buffer = window.Buffer ?? Buffer;
window.process = window.process ?? { env: {} }; // Minimal process polyfill

export {};
