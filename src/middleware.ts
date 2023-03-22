import { telemetry, chainMatch } from "@next-safe/middleware";
import { userAgent } from "next/server";

const withTelemetry = telemetry({
  middlewares: [
    (request) => {
      const { pathname } = request.nextUrl;
      const { ua, browser } = userAgent(request);
      console.log(
        `\n${request.method} ${pathname}${request.nextUrl.search} ${
          browser.name || ua
        }`
      );
    },
  ],
  profileLabel: "accessLogMiddleware",
});

export default chainMatch((request) => {
  const { pathname } = request.nextUrl;
  if (/^\/_next/.test(pathname)) {
    return false;
  }
  if (/favicon.ico/.test(pathname)) {
    return false;
  }
  return true;
})(withTelemetry);
