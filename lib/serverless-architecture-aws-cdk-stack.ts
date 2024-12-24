import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SwnDatabase } from './database';
import { SwnMicroservices } from './microservice';
import { SwnApiGateway } from './apigateway';
import { SwnQueue } from './queue';
import { SwnEventBus } from './eventbus';

/**
 * ServerlessArchitectureAwsCdkStack
 *
 * This CDK stack defines a serverless architecture for an e-commerce application. It integrates:
 * - DynamoDB tables for persistence (Database layer).
 * - Microservices for handling application logic (Product, Basket, and Ordering).
 * - API Gateway for routing HTTP requests to microservices.
 * - SQS for asynchronous messaging between services.
 * - EventBridge for event-driven communication.
 */
export class ServerlessArchitectureAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Setup the Database Layer
    // This creates DynamoDB tables for Product, Basket, and Order services.
    const database = new SwnDatabase(this, 'Database');

    // 2. Setup Microservices
    // Creates the Lambda functions that interact with the DynamoDB tables.
    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable: database.productTable, // Pass the Product table to the microservice
      basketTable: database.basketTable,   // Pass the Basket table to the microservice
      orderTable: database.orderTable      // Pass the Order table to the microservice
    });

    // 3. Setup API Gateway
    // Creates API Gateway integrations for the microservices.
    const apigateway = new SwnApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice, // Routes for Product
      basketMicroservice: microservices.basketMicroservice,   // Routes for Basket
      orderingMicroservices: microservices.orderingMicroservice // Routes for Orders
    });

    // 4. Setup SQS Queue
    // Configures an SQS queue for asynchronous order processing.
    const queue = new SwnQueue(this, 'Queue', {
      consumer: microservices.orderingMicroservice // Connects the queue to the Ordering microservice
    });

    // 5. Setup EventBridge Event Bus
    // Configures an event-driven architecture using EventBridge.
    const eventbus = new SwnEventBus(this, 'EventBus', {
      publisherFuntion: microservices.basketMicroservice, // Event publisher (Basket microservice)
      targetQueue: queue.orderQueue // Target queue for the events (Order queue)
    });
  }
}
