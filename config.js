const isDevelopment = process.env.NODE_ENV === 'development'

module.exports = {
  isDevelopment,
  DEFAULT_PORT: isDevelopment ? 8080 : process.env.PORT,
  COINUSERS_URL: isDevelopment ?
    'http://localhost:8080' :
    'https://coinusers-app.herokuapp.com',
  COINCRYPTO_URL: !isDevelopment ?
    'http://localhost:3000' :
    'https://coincrypto-app.herokuapp.com',
  COINCHAIN_URL: isDevelopment ?
    'http://localhost:3001' :
    'https://coinchain-app.herokuapp.com',
  DATABASE: {
    URL: process.env.database_url,
  },
  MJ: {
    APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
    APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
  },
}
