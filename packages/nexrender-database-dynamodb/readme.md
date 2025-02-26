# Database: DynamoDB

DynamoDB database provider for `@nexrender/server`.

## Installation

```
npm i @nexrender/database-dynamodb -g
```

##  DynamoDB Table

Create a table in DynamoDB with the following schema:
- Primary key: `uid` (String)

## Configuration

In order to use this, `NEXRENDER_DATABASE_PROVIDER` needs to be set to `dynamodb`.
The following environment variables are available:

```bash
# Enable DynamoDB database provider
NEXRENDER_DATABASE_PROVIDER="dynamodb"
# The name of the DynamoDB table to use (default: nexrender-jobs)
DYNAMODB_TABLE_NAME="nexrender-jobs"

# Configure AWS credentials (IAM user)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region

# When using AWS STS (temporary credentials)
AWS_SESSION_TOKEN=your_session_token
AWS_PROFILE=your_profile
```
