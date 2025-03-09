// App config imports
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { logger } = require("./middleware/memoryLog");

// Routers Imports
const userRouter = require("./routes/userRouter");
const courseRouter = require("./routes/courseRouter");
const packageRouter = require("./routes/packageRouter");
const orderRouter = require("./routes/orderRouter");
const adminRouter = require("./routes/adminRouter");

// Swagger Imports
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./config/swagger");
const swaggerJsdoc = require("swagger-jsdoc");

// Firebase imports
const admin = require("firebase-admin");
const serviceAccount = require("./firebase.config");

// Error Handler inports
const {
  NotFoundErrorHandler,
  ServerErrorHandler,
} = require("./middleware/errors");

dotenv.config();

// Initialize Firebase App
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Configure app
const swaggerSpecs = swaggerJsdoc(swaggerOptions);
const app = express();
const PORT = process.env.PORT || 7000;

// Middlewares (Don't change order randomly)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Middleware: Server status logs
app.use(logger);

// Routers
app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/package", packageRouter);
app.use("/order", orderRouter);
// app.use("/admin", adminRouter);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 404: Not found
// app.use(NotFoundErrorHandler);

// 500: Error reporing
// app.use(ServerErrorHandler);

// Start Listening
app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT}`);
});
