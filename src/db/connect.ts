import { Deta } from "deta";

const DetaProjectKey = process.env.DetaProjectKey;
if (!DetaProjectKey) {
    throw new Error("DetaProjectKey env is not found!");
}

const detaDB = Deta(DetaProjectKey);
export const fileDB = detaDB.Drive("file");
export const queueDB = detaDB.Base("queue");
export const publicSentDB = detaDB.Base("publicSent");
export const privateSentDB = detaDB.Base("privateSent");
