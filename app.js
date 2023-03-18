require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// connect DB
const connectDB = require('./db/connect');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authMiddleware = require('./middleware/authentication');

// set
app.set('trust proxy', 1);

// extra packages
app.use(
  rateLimiter({
    windowsMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authMiddleware, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// start server
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port: ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
