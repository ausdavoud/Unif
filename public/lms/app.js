"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.get("/", (req, res) => {
    res.send("<h1>App is running!</h1>");
});
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}.`);
});
