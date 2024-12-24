import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

/**
 * SwnMicroservices
 *
 * This construct defines the microservices for the e-commerce system, including:
 * - Product Microservice: Manages product data in DynamoDB.
 * - Basket Microservice: Manages user baskets and emits events for the checkout process.
 * - Ordering Microservice: Handles order data and uses DynamoDB for persistence.
 */
interface SwnMicroservicesProps {
  productTable: ITable; // DynamoDB table for products
  basketTable: ITable;  // DynamoDB table for baskets
  orderTable: ITable;   // DynamoDB table for orders
}

export class SwnMicroservices extends Construct {
  // Public properties to expose the created Lambda functions
  public readonly productMicroservice: NodejsFunction;
  public readonly basketMicroservice: NodejsFunction;
  public readonly orderingMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
    super(scope, id);

    // Initialize microservices
    this.productMicroservice = this.createProductFunction(props.productTable);
    this.basketMicroservice = this.createBasketFunction(props.basketTable);
    this.orderingMicroservice = this.createOrderingFunction(props.orderTable);
  }

  /**
   * Creates the Product Microservice Lambda function.
   * @param productTable DynamoDB table for storing product data.
   * @returns NodejsFunction instance for the product microservice.
   */
  private createProductFunction(productTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'], // Exclude problematic dependencies
      },
      environment: {
        PRIMARY_KEY: 'id', // Partition key for the DynamoDB table
        DYNAMODB_TABLE_NAME: productTable.tableName, // Table name
        LOG_LEVEL: 'INFO', // Log level for better debugging
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
      entry: join(__dirname, `/../src/product/index.js`), // Entry point for the Lambda function
      ...nodeJsFunctionProps,
    });

    // Grant permissions for the Lambda to read and write to the product table
    productTable.grantReadWriteData(productFunction);

    return productFunction;
  }

  /**
   * Creates the Basket Microservice Lambda function.
   * @param basketTable DynamoDB table for storing basket data.
   * @returns NodejsFunction instance for the basket microservice.
   */
  private createBasketFunction(basketTable: ITable): NodejsFunction {
    const basketFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk', 'uuid'], // Exclude problematic dependencies
      },
      environment: {
        PRIMARY_KEY: 'userName', // Partition key for the DynamoDB table
        DYNAMODB_TABLE_NAME: basketTable.tableName, // Table name
        EVENT_SOURCE: "com.swn.basket.checkoutbasket", // EventBridge source for basket events
        EVENT_DETAILTYPE: "CheckoutBasket", // Event detail type for checkout
        EVENT_BUSNAME: "SwnEventBus", // Event bus name
        LOG_LEVEL: 'INFO', // Log level for better debugging
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const basketFunction = new NodejsFunction(this, 'basketLambdaFunction', {
      entry: join(__dirname, `/../src/basket/index.js`), // Entry point for the Lambda function
      ...basketFunctionProps,
    });

    // Grant permissions for the Lambda to read and write to the basket table
    basketTable.grantReadWriteData(basketFunction);

    return basketFunction;
  }

  /**
   * Creates the Ordering Microservice Lambda function.
   * @param orderTable DynamoDB table for storing order data.
   * @returns NodejsFunction instance for the ordering microservice.
   */
  private createOrderingFunction(orderTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk', 'uuid'], // Exclude problematic dependencies
      },
      environment: {
        PRIMARY_KEY: 'userName', // Partition key for the DynamoDB table
        SORT_KEY: 'orderDate', // Sort key for the DynamoDB table
        DYNAMODB_TABLE_NAME: orderTable.tableName, // Table name
        LOG_LEVEL: 'INFO', // Log level for better debugging
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const orderFunction = new NodejsFunction(this, 'orderingLambdaFunction', {
      entry: join(__dirname, `/../src/ordering/index.js`), // Entry point for the Lambda function
      ...nodeJsFunctionProps,
    });

    // Grant permissions for the Lambda to read and write to the order table
    orderTable.grantReadWriteData(orderFunction);

    return orderFunction;
  }
}
