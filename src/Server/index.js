import Koa from 'koa';

const app = new Koa();

app.use((foo) => {
  foo.body = `<h1>Hello World!</h1>`;
});

app.listen(3000);