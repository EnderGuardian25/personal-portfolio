module.exports = {
  apps: [
    {
      name: "damiandc-website",
      script: "node_modules/.bin/next",
      // nginx is the only thing that should reach this — bound to loopback,
      // not 0.0.0.0. `next start` binds every interface unless -H says otherwise;
      // a HOSTNAME env var does nothing here, that only affects the
      // standalone server.js output, not the `next start` CLI.
      // Must be "localhost", NOT "127.0.0.1": Next normalizes 127.0.0.1 to
      // "localhost" in the proxy's request.nextUrl but not in the server's own
      // origin, so every proxy.js rewrite looks cross-origin, is fetched as an
      // external URL, and fails — lab.damiandc.com 404s. "localhost" binds
      // ::1 only, so nginx must proxy_pass to http://[::1]:3000.
      args: "start -H localhost",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
