import { CreateBucketCommand, S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import 'dotenv/config'
import * as fs from "fs";

const bucketName = "s3-demo-bucket"; // new bucket
const filename = "peru.pmtiles"; // new filename
const filePath = `./download-pmtiles/${filename}`;

const s3 = new S3Client({ 
  region: "auto",
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  } 
});

export const createBucket = async (bucketName) => {
  console.log(`Creating bucket: ${bucketName}`);
  const command = new CreateBucketCommand({ Bucket: bucketName });
  try {
    const { Location } = await s3.send(command);
    console.log(`Bucket ${bucketName} created with location ${Location}`);

  } catch (error) {
    if (error.code === "BucketAlreadyOwnedByYou") {
      console.log(`Bucket ${bucketName} already exists, skipping ...`);
      return;
    } else {
      console.error(`Error creating bucket: ${bucketName}`, error);
    }
  }
}

export const upLoadFile = async (bucketName, filename, filePath) => {
  console.log(`Uploading file: ${filename} to bucket ${bucketName}`);
  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;
  const chunkSize = 500 * 1024 * 1024; // 500 MB chunks
  const numChunks = Math.ceil(fileSize / chunkSize);

  const createMultipartUploadParams = {
    Bucket: bucketName,
    Key: filename
  }

  const createMultipartUploadCommand = new CreateMultipartUploadCommand(createMultipartUploadParams);
  const createMultipartUploadResponse = await s3.send(createMultipartUploadCommand);
  const uploadId = createMultipartUploadResponse.UploadId;

  const parts = [];

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize - 1, fileSize - 1);
    const chunk = fileBuffer.slice(start, end + 1);
  
    const uploadPartParams = {
      Bucket: bucketName,
      Key: filename,
      PartNumber: i + 1,
      UploadId: uploadId,
      Body: chunk,
    };
  
    const uploadPartCommand = new UploadPartCommand(uploadPartParams);
    const uploadPartResponse = await s3.send(uploadPartCommand);
    parts.push({
      ETag: uploadPartResponse.ETag,
      PartNumber: i + 1,
    });
  }

  const completeMultipartUploadParams = {
    Bucket: bucketName,
    Key: filename,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts
    }
  }
  
  const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(completeMultipartUploadParams);

  try {
    const { ETag } = await s3.send(completeMultipartUploadCommand);
    console.log(`File ${filename} uploaded with ETag: ${ETag}`);
  } catch (error) {
    console.error(`Error uploading file: ${filename} to bucket ${bucketName}`, error);
  }
}  

const main = async () => {
  await createBucket(bucketName);
  await upLoadFile(bucketName, filename, filePath);
}

main()