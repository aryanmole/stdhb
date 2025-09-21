const aws = require('aws-sdk');

const s3 = new aws.S3({
  endpoint: process.env.S3_ENDPOINT, // e.g., http://localhost:9000 for minio
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: process.env.S3_REGION || 'us-east-1'
});

module.exports = s3;