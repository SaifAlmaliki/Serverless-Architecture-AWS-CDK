# Serverless Architecture with AWS CDK

This project demonstrates a serverless e-commerce application using the AWS Cloud Development Kit (CDK) in TypeScript. It employs modern best practices for serverless architectures, event-driven design, and microservices.

---

## Project Overview

This project is designed to showcase:
- **Microservices Architecture**: Decoupled services for product management, basket operations, and order processing.
- **Serverless Components**:
  - AWS Lambda: For compute and microservice logic.
  - DynamoDB: As a NoSQL data store for persistence.
  - API Gateway: For RESTful API endpoints to interact with the microservices.
  - EventBridge: For event-driven communication between services.
  - SQS: For queue-based communication between services.
- **Infrastructure as Code (IaC)**: Entire infrastructure is defined using AWS CDK in TypeScript.

---

## Prerequisites

Before getting started, ensure you have the following installed:
- **Node.js** (v20 or later)
- **AWS CLI** (configured with appropriate credentials)
- **AWS CDK Toolkit** (v2 or later):
  ```bash
  npm install -g aws-cdk
  ```

## Project Components
### Microservices
The application is built using a microservices architecture:

- Product Microservice: Handles operations related to product data.
- Basket Microservice: Manages user baskets and emits checkout events.
- Ordering Microservice: Processes orders and saves them in DynamoDB.

## Event-Driven Architecture
The project uses AWS EventBridge to enable communication between microservices. For example:

- The Basket service emits a CheckoutBasket event after a user checks out.
- The Ordering service listens for this event to create an order.

## Infrastructure
The infrastructure is provisioned using AWS CDK and includes:

- API Gateway: For HTTP-based interaction with the services.
- DynamoDB: As a fast, scalable NoSQL database.
- Lambda Functions: For microservice logic.
- EventBridge: For decoupled service communication.
- SQS: For reliable message delivery.
