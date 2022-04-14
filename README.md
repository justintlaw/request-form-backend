# Request Form Backend
The backend code for the Request Form app.

## Description
This is contains two parts. First, the infrastructure which is located in the `/lib` folder, and the api itself which is located under `src/api`. The infrastructure consists of a fully functioning code pipeline that deploys a DynamoDB table as well as an API written in Node express setup through API Gateway/AWS Lambda.

### Running Locally
`cd src/api`
`npm run db:start` - create dynamodb locally in docker
`npm run db:setup` - setup the table locally
`npm run api:local` - run the express api locally
(optional) `npm run db:gui` - expose a gui for dynamodb on port 8001

## AWS cdk commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Information
* `aws codestar-connections create-connection --provider-type GitHub --connection-name RequestFormBackendCode` Create a codestar connection via the aws cli
