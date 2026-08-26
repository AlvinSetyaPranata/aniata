module.exports = {
  apps: [
    {
      name: 'aniata-admin',
      script: 'server.mjs',
      cwd: __dirname,
      env: {
        PORT: 3002,
        HOST: '0.0.0.0',
        NODE_ENV: 'production',
      },
    },
  ],
}
