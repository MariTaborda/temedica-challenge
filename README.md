# Temedica Challenge

Thank you for the opportunity to work on this technical challenge :) Below are the instructions to set up and run the project, including both the backend and frontend components.

## Instructions for the backend: 

1. Navigate to the `backend` directory:
   ```shell
   cd backend
   ```
2. Install the required packages:
   ```shell
   npm install
   ```
3. Check node version:
   ```shell
   node -v
   ```
   Make sure you are using Node.js version 22.
4. Start the DB:
   ```shell
   docker compose up -d
   ```
5. Use the PostgreSQL configuration from the `.env file` in the `backend` directory to set up your data source.
6. Run the migration that creates the tables and everything else:
   ```shell
   npx prisma migrate dev
   ```
7. Generate the Prisma client:
   ```shell
   npx prisma generate
   ```
8. Seed the database with initial data:
   ```shell
   npx prisma db seed
   ```
9. Start the server:
   ```shell
   npm run dev
   ```

## Instructions for the tests:

1. Execute the tests in the `backend` directory:
   ```shell
   npm test
   ```

## Instructions for the frontend:

1. Navigate to the `frontend` directory:
   ```shell
   cd frontend
   ```
2. Install the required packages:
   ```shell
   npm install
   ```
3. Start the frontend application:
   ```shell
   npm start
   ```

## Assumptions made and important notes:

1. The backend server runs on `http://localhost:3000`.
2. The frontend application runs on `http://localhost:3001`.
3. The database is a PostgreSQL database running in a Docker container. 
4. The database connection URL is set in the `.env` file in the backend directory. 
5. The SQL schema is in the `migration.sql` file located in `prisma/migrations/20250825141104_init`.
6. Following the instruction to "Keep the dashboard minimal but functional (1–2 charts are sufficient)," I implemented two charts: a bar chart and a line chart. Each chart utilizes backend aggregation endpoints—one for the top 10 prescribed drugs and the other for total claim cost per patient.
7. I created a Postman collection with the all endpoints. You can find it in the root directory of the project with the name `temedica-challenge.postman_collection.json`.
8. You can check the endpoints documentation using Swagger. Once the backend server is running, navigate to `http://localhost:3000/api-docs` to access the Swagger UI.

## API Endpoints:

### Claims Endpoints

#### POST /claims — Create a new claim
Request Body:

```
{
  "patientId": 1,
  "submissionDate": "2025-08-27T12:00:00Z",
  "reimbursementDate": "2025-08-28T12:00:00Z",
  "totalCost": 100
}

```

Response: Returns the created claim object.

#### GET /claims — Retrieve all claims (optionally filter by patientId)
Example: `/claims?patientId=1`
Response: Array of claim objects.

#### GET /claims/:id — Retrieve a specific claim by ID
Response: Claim object including related patient, prescriptions, and diagnoses.

#### PUT /claims/:id — Update a claim
Request Body: (any of the updatable fields)

```
{
  "totalCost": 150
}

```

Response: Returns the updated claim object.

#### DELETE /claims/:id — Delete a claim by ID
Response: Confirmation message and deleted claim data.

#### GET /claims/total-cost-per-patient — Get total claim costs grouped by patient
Response:

```
[
  {
    "patientId": 1,
    "totalCost": 300
  },
  ...
]
```

#### GET /claims/average-prescriptions — Get average number of prescriptions per claim
Response:

```
{
  "averagePrescriptionsPerClaim": 2.5
}
```

### Prescriptions Endpoints

#### POST /prescriptions — Create a new prescription
Request Body:

```
{
  "claimId": 1,
  "drugCodeAtc": 123456,
  "quantity": 10,
  "lineCost": 50.0
}
```

Response: Returns the created prescription object.

#### GET /prescriptions — Retrieve prescriptions (optionally filter by claimId)
Example: `/prescriptions?claimId=1`
Response: Array of prescription objects.

#### GET /prescriptions/:id — Retrieve a prescription by ID
Response: Prescription object including related claim.

#### PUT /prescriptions/:id — Update a prescription
Request Body: (fields to update)

```
{
  "quantity": 20
}
```
Response: Updated prescription object.

#### DELETE /prescriptions/:id — Delete a prescription by ID
Response: Confirmation message and deleted prescription data.

### Analytics Endpoints

#### GET /analytics/top-drugs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD — Get top 10 prescribed drugs within a date range
Example: `/analytics/top-drugs?startDate=2025-01-01&endDate=2025-08-01`
Response:

```
[
  { "drugCode": 123456, "prescribedCount": 45 },
  { "drugCode": 654321, "prescribedCount": 38 }
]
```