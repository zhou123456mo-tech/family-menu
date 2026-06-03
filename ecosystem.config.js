module.exports = {
  apps: [
    {
      name: 'home-menu',
      script: 'pnpm',
      args: 'dev',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
}
