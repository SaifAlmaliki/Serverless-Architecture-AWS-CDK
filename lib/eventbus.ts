import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface SwnEventBusProps {
    publisherFuntion: IFunction; // Lambda function that publishes events to the event bus
    targetQueue: IQueue;         // SQS queue to which events are sent
}

/**
 * SwnEventBus
 * This construct sets up an EventBridge event bus with a rule to handle
 * events triggered by a publisher Lambda function and sends them to an SQS queue.
 */
export class SwnEventBus extends Construct {

    constructor(scope: Construct, id: string, props: SwnEventBusProps) {
        super(scope, id);

        // 1. Create the EventBridge event bus
        const bus = new EventBus(this, 'SwnEventBus', {
            eventBusName: 'SwnEventBus' // Assign a custom name to the event bus
        });

        // 2. Define a rule for processing "CheckoutBasket" events
        const checkoutBasketRule = new Rule(this, 'CheckoutBasketRule', {
            eventBus: bus,              // Associate the rule with the event bus
            enabled: true,              // Enable the rule
            description: 'Handles Basket checkout events', // Description of the rule
            eventPattern: {             // Define the event pattern to match
                source: ['com.swn.basket.checkoutbasket'],  // Source of the events
                detailType: ['CheckoutBasket']              // Type of events
            },
            ruleName: 'CheckoutBasketRule' // Assign a custom name to the rule
        });

        // 3. Add a target to the rule
        // This sends matching events to the provided SQS queue (targetQueue)
        checkoutBasketRule.addTarget(new SqsQueue(props.targetQueue));

        // 4. Grant permissions to the publisher Lambda function to send events to the bus
        bus.grantPutEventsTo(props.publisherFuntion);
        // Handles AccessDeniedException if the Lambda lacks events:PutEvents permissions
    }
}
