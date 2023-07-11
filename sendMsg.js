const {
        Lambda
      } = require("@aws-sdk/client-lambda"),
      {
        SQS
      } = require("@aws-sdk/client-sqs");
const sqs = new SQS();
const lambda = new Lambda();
   
   


module.exports.createOrderV2 = async (event) => {
    let now = new Date().toISOString;
  try {
    // Process and validate the order

console.log('Inside createOrderV2');
console.log(event.body)
// console.log(process.env.AWS_LAMBDA_FUNCTION_NAME);
// console.log(process.env.QUEUE_URL);
// console.log(process.env.DLQ_URL);
    // Send the order to the SQS queue
    const params = {
      MessageBody: JSON.stringify(event.body),
       QueueUrl: "https://sqs.us-east-1.amazonaws.com/766193629404/my-queue"
    };
    await sqs.sendMessage(params);
    return {
      statusCode: 200,
      body: JSON.stringify({ now: new Date().toISOString(), message: 'Order sent to Queue sucessfully' })
    };
  } catch (error) {
    // Handle errors and retries
    const retryCount = event.retryCount || 0;
    console.log('Inside CATCH {} OF createOrderV2');
    if (retryCount >= 3) {
      // Send the failed order to the DLQ
      const dlqParams = {
        MessageBody: JSON.stringify(event.body),
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/766193629404/my-queue"
        //QueueUrl: process.env.DLQ_URL
      };

      await sqs.sendMessage(dlqParams);

      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to process order after multiple attempts' })
      };
    }

    // Retry the order by re-invoking the function with an incremented retryCount
    const retryParams = {
      FunctionName: "mts-api-gateway-dev-createOrderV2",
      InvocationType: 'Event',
      Payload: JSON.stringify({
        body: event.body,
        retryCount: retryCount + 1
      })
    };

    await lambda.invoke(retryParams);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to process order, retrying...' })
    };
  }
};

