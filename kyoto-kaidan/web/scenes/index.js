import * as room from './room.js';
import * as outdoor from './outdoor.js';
import * as house from './house.js';
import * as debug from './debug.js';
export const SCENES = { ...room, ...outdoor, ...house, ...debug };
