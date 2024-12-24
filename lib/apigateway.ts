import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
    productMicroservice: IFunction;
    basketMicroservice: IFunction;
    orderingMicroservices: IFunction;
}

/**
 * SwnApiGateway
 *
 * This file defines the SwnApiGateway construct, which sets up API Gateways for different microservices in an e-commerce application.
 * Each microservice (Product, Basket, and Ordering) has its own API Gateway configuration that routes HTTP requests to corresponding Lambda functions.
 *
 * Key Features:
 * - Product Service API Gateway: Manages operations on product resources.
 * - Basket Service API Gateway: Manages basket operations and checkout flow.
 * - Ordering Service API Gateway: Handles order retrieval and query-based filtering.
 */

export class SwnApiGateway extends Construct {

    constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
        super(scope, id);

        // Initialize API Gateways for each microservice
        this.createProductApi(props.productMicroservice);
        this.createBasketApi(props.basketMicroservice);
        this.createOrderApi(props.orderingMicroservices);
    }

    /**
     * Creates an API Gateway for the Product Microservice.
     *
     * Routes:
     * - GET /product
     * - POST /product
     * - GET /product/{id}
     * - PUT /product/{id}
     * - DELETE /product/{id}
     */
    private createProductApi(productMicroservice: IFunction): void {
        const apigw = new LambdaRestApi(this, 'productApi', {
            restApiName: 'Product Service',
            handler: productMicroservice,
            proxy: false
        });

        const product = apigw.root.addResource('product');
        product.addMethod('GET');   // GET /product
        product.addMethod('POST'); // POST /product

        const singleProduct = product.addResource('{id}'); // /product/{id}
        singleProduct.addMethod('GET');     // GET /product/{id}
        singleProduct.addMethod('PUT');     // PUT /product/{id}
        singleProduct.addMethod('DELETE');  // DELETE /product/{id}
    }

    /**
     * Creates an API Gateway for the Basket Microservice.
     *
     * Routes:
     * - GET /basket
     * - POST /basket
     * - GET /basket/{userName}
     * - DELETE /basket/{userName}
     * - POST /basket/checkout
     */
    private createBasketApi(basketMicroservice: IFunction): void {
        const apigw = new LambdaRestApi(this, 'basketApi', {
            restApiName: 'Basket Service',
            handler: basketMicroservice,
            proxy: false
        });

        const basket = apigw.root.addResource('basket');
        basket.addMethod('GET');    // GET /basket
        basket.addMethod('POST');   // POST /basket

        const singleBasket = basket.addResource('{userName}'); // /basket/{userName}
        singleBasket.addMethod('GET'); // GET /basket/{userName}
        singleBasket.addMethod('DELETE'); // DELETE /basket/{userName}

        const basketCheckout = basket.addResource('checkout');
        basketCheckout.addMethod('POST'); // POST /basket/checkout
        // Expected request payload: { userName: "swn" }
    }

    /**
     * Creates an API Gateway for the Ordering Microservice.
     *
     * Routes:
     * - GET /order
     * - GET /order/{userName} (with optional query parameters)
     *   Example: /order/swn?orderDate=timestamp
     */
    private createOrderApi(orderingMicroservices: IFunction): void {
        const apigw = new LambdaRestApi(this, 'orderApi', {
            restApiName: 'Order Service',
            handler: orderingMicroservices,
            proxy: false
        });

        const order = apigw.root.addResource('order');
        order.addMethod('GET'); // GET /order

        const singleOrder = order.addResource('{userName}'); // /order/{userName}
        singleOrder.addMethod('GET'); // GET /order/{userName}
        // Expected request: /order/swn?orderDate=timestamp
        // Ordering MS parses input and query parameters for DynamoDB filtering
    }
}
