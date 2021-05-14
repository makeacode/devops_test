## Setup

- install AWS cli (for configuring credentials)
- install SAM cli
- configure AWS credentials
- sam install --guided

## Usage

`sam install` will create a serverless application designed to monitor the an s3 bucket for files that match \*.json and push them into a dynamodb table with primary key being the description.event_id.

## Testing

Go to s3 and find the bucket matching the name chosen during install. Upload a sample incident file from the data folder. s3 will trigger a lambda function that will read the file and push it to a dynamodb table. Uploading the same file multiple times should update the matching row in dynamodb.
