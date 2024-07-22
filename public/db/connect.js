"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentDB = exports.queueDB = exports.fileDB = void 0;
const deta_1 = require("deta");
const DetaProjectKey = process.env.DetaProjectKey;
if (!DetaProjectKey) {
    throw new Error('DetaProjectKey env is not found!');
}
const detaDB = (0, deta_1.Deta)(DetaProjectKey);
exports.fileDB = detaDB.Drive('file');
exports.queueDB = detaDB.Base('queue');
exports.sentDB = detaDB.Base('sent');
