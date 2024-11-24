const express = require(`express`);
const app = express();

PORT = 3000;

app.use(express.json());

app.use(require(`morgan`)(`dev`));

app.use((req, res, next) => {
  next({ status: 404, message: `Endpoint not found`});
})


app.listen(PORT, () => {
  console.log(`You are now listening on port ${PORT}`);
});