import { BlobServiceClient } from "@azure/storage-blob";
import { NextApiRequest, NextApiResponse } from 'next';

interface Scrape {
  result_id: string;
}

const streamToBuffer = async (readableStream: NodeJS.ReadableStream): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data: Buffer | string) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
};

const getResult = async (blobId: string): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_BLOB_CONNECTION_STRING as string
  );
  const containerClient = blobServiceClient.getContainerClient("scrape");
  const blobClient = containerClient.getBlobClient(blobId);
  const downloadResponse = await blobClient.download();

  if (!downloadResponse.readableStreamBody) {
    throw new Error('No readable stream body available');
  }
  const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
  return downloaded.toString();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const scrape: Scrape = JSON.parse(req.body);
    const results = await getResult(scrape.result_id);

    res.status(200).json({ data: results });
  } catch (exc) {
    console.log(exc);
    res.status(400).json({ error: "Unable to construct scrape." });
  }
}
