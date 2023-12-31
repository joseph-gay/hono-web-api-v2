import { Hono, logger, timing } from "@deps";
import { log } from "@utils";
import { RouteGroup, Router } from "@lib";
import { errorHandler } from "@middleware";

/** Configuration object that defines the application settings. */
type AppConfig = {
  apiPrefix: string;
  apiRoutes: RouteGroup[];
};

/** Interface that defines the methods for an Application object. */
interface Application {
  handler(req: Request): Promise<Response>;
  bootstrap(): void;
}

/**
 * Class that encapsulates route and middleware configurations.
 * @implements {Application}
 */
export class ApplicationImpl implements Application {
  /** Hono instance that sets up the base API path. */
  private app: Hono;

  /** Router instance that manages the application's routes. */
  private router: Router;

  /**
   * @param {AppConfig} config - Configuration object for the application.
   */
  constructor({ apiPrefix, apiRoutes }: AppConfig) {
    this.app = new Hono().basePath(apiPrefix) as Hono;
    this.router = new Router({ router: this.app, routeGroups: apiRoutes });
  }

  /**
   * Handle a request and return a response.
   * @param {Request} req - The request to handle.
   * @return {Promise<Response>} Resolves with the response to the request.
   */
  public async handler(req: Request): Promise<Response> {
    const response = await this.app.fetch(req);
    return new Response(response.body, response);
  }

  /** Bootstrap the application. */
  public bootstrap(): void {
    this.registerMiddleware();
    this.registerRoutes();
    log.info("Application bootstrapped.");
  }

  /** Register the application's middleware. */
  private registerMiddleware(): void {
    this.app.use("*", errorHandler);
    this.app.use("*", timing());
    this.app.use("*", logger());
    log.info("Application middleware registered.");
  }

  /** Register the application's routes. */
  private registerRoutes(): void {
    this.router.createRoutes();
    // this.router.showRoutes(); // comment this line if you don't want to see the routes in the console
    log.info(`Application routes registered. Current router: ${this.router.RouterName}.`);
  }
}
