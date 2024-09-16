import { CreateBucketCommand, S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import 'dotenv/config'

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

export const upLoadFile = async (bucketName, filename, fileContent) => {
  console.log(`Uploading file: ${filename} to bucket ${bucketName}`);
  const command = new PutObjectCommand({ 
    Bucket: bucketName, 
    Key: filename, 
    Body: fileContent
   });

   try {
     const { ETag } = await s3.send(command);
     console.log(`File ${filename} uploaded with ETag: ${ETag}`);
   } catch (error) {
     console.error(`Error uploading file: ${filename} to bucket ${bucketName}`, error);
   }
}

const main = async () => {
  const bucketName = "s3-demo-bucket";
  await createBucket(bucketName);
  await upLoadFile(bucketName, "test2.txt", "Hello World 2");
}

main()
