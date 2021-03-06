/**
 * Server.js
 * -- Server class --> Responds to requests for Client Side Routes
 */
import Koa from 'koa';
import send from 'koa-send';
import _ from 'koa-route';
import * as routes from '../routes/routes.js';
import mount from 'koa-mount';
import bodyParser from 'koa-bodyparser';

class Server {

  // initialize Routes and Server
  constructor(options) {

    // setup server
    const server = new Koa();
    this.server = server;

    // passed in -- option from config.js
    this.port = options.port;

    // keep track of active requests
    this.activeRequests = 0;

    // log requests & track active -- middleware
    server.use(async (ctx, next) => {
      const start = new Date;
      this.activeRequests++;
      await next();
      const ms = new Date - start;
      this.activeRequests--;
      console.log(`${ctx.method} '${ctx.url}' -- ${ms} ms`);
      if (!options.test) {
        process.send({'cmd': 'notifyRequest'});
      }
    });

    // set up body parser for easy-access to json
    server.use(bodyParser({formLimit: '4mb'}));

    // make static folder static
    server.use(mount('/assets', async (ctx) => {
      await send(ctx, ctx.path, {
        root: `${__dirname}/../src/assets`,
      });
    }));

    // handle front page view -- proxy for /random/ until we (I) get some metric for rating -- switches on page 1
    server.use(_.get('/(.*)', routes.handleFP));
  }

  // log number of active requests
  logRequests() {
    console.log(`Active Requests: ${this.activeRequests}`);
  }

  // start server
  start () {
    this.server.listen(this.port);
  }
}

export default Server;
