import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import claimsRouter from './routes/claims';
import prescriptionsRouter from './routes/prescriptions';
import analyticsRouter from './routes/analytics';
import swaggerDocument from './swagger.json';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:3001'
}));

app.use(bodyParser.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/claims', claimsRouter);

app.use('/prescriptions', prescriptionsRouter);

app.use('/analytics', analyticsRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api-docs`);
});
