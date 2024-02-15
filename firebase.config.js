require("dotenv").config();

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  // private_key: process.env.PRIVATE_KEY.replace(/\n/g, "\n"),
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3/1GojkCrkJj8\ny5VtVnewZLYeqtseozQOvvHaksoKmQ9F/t6v5nILpohPrE3vs1oDi3jsbR7NmKn4\n75b8aXGcDulp4BV1iBauG1cKG6WRt21pSriI5Zi6nx9tiPcPM3DogIOTyO8Zgvuo\no7a6FUNZxYerM/Ldm+kg2nk7jO/3Vp6RHEh6NIEKtEwj4c2Uujf5DoNIe25qe2d0\ncgoqU6t0TTsyKLKGDleB86eiHHwLPQGwWFoX2kqKOlSnaN567JqK9FDnYlWfWkW/\nDVCkek2He7v1O1Lx+3Eh2ddYDKQl6gjmKm0bbO4oqJVHWybyPgMXpqDmWcgMVWfZ\nYlQibxKzAgMBAAECggEAAVIGYX5aIY0/ySUEZG5PfnsE06g6X4R1yYjTsASN5MSr\n5qZhs9KMFlogPEAKXqnshZyDpMJTPBkYS+5ka7qtgqKMeXTqPe/lJicLQ/q1hq4a\n5exfLuI4oho3zQUGuW3wq6fNlh05xOSBGX8Sssop2Fr1m4vAJ0M2hnuRvg67aaUL\nGj9M1K9XXYiDLqfgxT8Ce89paWQzvgN/4+BNwEcefhrbhgyqp+k5e6NY+2lws1ZP\nuHFl3UrexcBHgrVPSaZN5iQYxcP+Un7AwWZYHIom4f9r9ZCL3xXcnBj1gpcfVlJQ\nqyVJttAfo/D5GQqEseqGhJ0s5pLiYArXEo00tGdm8QKBgQDpj1or6ra17xBVLxUm\nqtX4TMNa+I1Q9m42BZ+7J309E+YjNONDlgBaXEJDMUBOgtwKv78bQht7RfXVBhTw\nMcg5KFw8sTTsvOa4kFEwNjXFkM1hs+tTkUlZMpuCZh9r++bD7sh1W/Afs77TXSuP\nIt4u3rqtfjJ83/hAx0cZ+i2PMQKBgQDJrOxBCcrg28MYFNEcjJ7+pZKJjhOTGpll\nQAIJOohoMHegJX/WEglDqPDiEGOJS2HaeH+FWcV2MOPXs1Yi37NrhhS8qeHvMiQF\nk3vj+HJwX2NZp0d3PQTx0LYGL5H+fxckfzBa8PDTCP9uax03fNqzREyMDq175CZf\nbZu9/fKvIwKBgBhP6c0Eg7xwhDy5x/PceKV+KB/CG8O/wz0wXK44sBq5hY1IpheU\n97hwPh2MdOs3R/x+dUA7I20znSFtnqRaKkN45hETSTUTfNjdfPYNzo8gQaDX/7kV\nOJNmZzWtt7uf3yeqJYfB6D8EkOqjmjMuJ/6tBLWmm07QaaEknUwg9LkhAoGAAO6y\nvO49qOJ7OW5HNTmVNpovXkFw57o0wVoVaFOD8+9dbjkeKTA2KMDsNC9dNnJJxofO\nFyC+H/jD5OhoWorsOnAJQoIKkF+L+RageQJaDRjzzaNPWkbG8hND9C1eIG4X/kw0\nPgdlJaSiAbGvFeWW4UNMk00yEiOQ5doM4Uj+ST8CgYEAx6oExUJ2u+kJJ0phkj8E\n8Arae33UtPpijhcjVCxiv5nOE7VypNpx6k/3DN6ujcjS/xKSsyl/0Vzewehda52K\n23Vb/JdKWbDkprz2k2dsZPhWA7oeSjfbj0DZ4cuu3PTCKPCJRZ13jtQDOHd3OfMW\njBdIUI7seNUrres30dqDm6o=\n-----END PRIVATE KEY-----\n",
  client_x509_cert_url: process.env.CLIENT,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URL,
  token_uri: process.env.TOKEN_URL,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

module.exports = serviceAccount;
