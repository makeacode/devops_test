/*
  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software
  without restriction, including without limitation the rights to use, copy, modify,
  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

const AWS = require("aws-sdk");
AWS.config.region = process.env.AWS_REGION;
const s3 = new AWS.S3();

const docClient = new AWS.DynamoDB.DocumentClient();

const ddbTable = process.env.DDBtable;

// The Lambda handler
exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  console.log("Using DDB table: ", ddbTable);

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        console.log("Incoming record: ", record);

        // Get original text from object in incoming event
        const originalText = await s3
          .getObject({
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key,
          })
          .promise();

        // Upload JSON to DynamoDB
        const jsonData = JSON.parse(originalText.Body.toString("utf-8"));
        console.log(jsonData);
        await ddbLoader(jsonData);
      } catch (err) {
        console.error(err);
      }
    })
  );
};

// Load JSON data to DynamoDB table
const ddbLoader = async (data) => {
  // Build params
  const params = {
    TableName: ddbTable,
    Item: {
      ID: data.description.event_id,
      ...data,
    },
  };

  // Push to DynamoDB
  try {
    const result = await docClient.put(params).promise();
    console.log("Success: ", result);
  } catch (err) {
    console.error("Error: ", err);
  }
};
