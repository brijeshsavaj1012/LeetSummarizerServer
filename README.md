# Firestore Data Service

This Node.js application provides an API to call the model which provides the summary from the question and code then uploads and retrieves that data from Google Firestore.


## Prerequisites:

Node.js and npm
Firebase project with Firestore enabled
Firebase service account key

## Installation:

1. Clone the repository and install dependencies.

2. Create a .env file with your Firebase project ID.

3. Start the server:
  node index.js


## API Endpoints:

### POST /upload
Uploads a new document to Firestore with summary generated by model.

URL: /upload
Method: POST

Headers: Content-Type: application/json

Body: JSON with question, code, and userId

### POST /showbyid
Fetches documents from Firestore by userId.

URL: /showbyid
Method: POST

Headers: Content-Type: application/json

Body: JSON with userId


