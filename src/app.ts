import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to express with TypeScript");
});

export default app;
