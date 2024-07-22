import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("<h1>App is running!</h1>");
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}.`);
});
