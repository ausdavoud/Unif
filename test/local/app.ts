import "dotenv/config";
import express from "express";
import { testAnalyzeMessages } from "./testAnalyze";
import { testPushMessage } from "./pushToDB";

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("<h1>App is running!</h1>");
});

app.get("/testpush", (req, res) => {
    testPushMessage()
    .then(() => res.send('ok'));
})

app.get("/testanalyze", (req, res) => {
    testAnalyzeMessages()
    .then(() => res.send('ok'));
})


app.get("/comment", (req, res) => {
    const ali = undefined
    res.send((String(ali)))
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}.`);
});
