module.exports.createOrder = async (event) => {
  let output = {
    statusCode: 200,
    message: event
  }
 // return output
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        now: new Date().toISOString(),
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
