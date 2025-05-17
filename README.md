

## Running the project on your machine

### Prerequisites

Node.js (version 22 or compatible), npm (version 10 or compatible),
Java JDK (version 21), and Docker (version 24.0.7 or compatible).

#### Backend Setup

Navigate to the backend directory:

```
cd backend
```

Run the docker containers:

```
docker-compose up
```



Configure environment variables for OAuth 2.0 and OIDC, aka the Continue with Google button. Give fake values if you do not want to test this feature:


set OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
set OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run the backend:

gradlew.bat bootRun


#### Frontend Setup


cp .env.example .env

npm install

npm run dev
