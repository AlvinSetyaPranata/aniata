module.exports = {
  apps: [
    {
      name: 'aniata-fe',
      script: 'server.mjs',
      cwd: __dirname,
      env: {
        PORT: 3000,
        HOST: '0.0.0.0',
        NODE_ENV: 'production',
      },
    },
  ],
}
