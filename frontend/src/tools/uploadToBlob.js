import { BlobServiceClient } from '@azure/storage-blob';

async function uploadToBlob(fileName, file) {
	const blobServiceClient = new BlobServiceClient(process.env.REACT_APP_BLOB_CON_STR);

	const containerClient = blobServiceClient.getContainerClient('images');
	const blockBlobClient = containerClient.getBlockBlobClient(fileName);

	await blockBlobClient.uploadData(file);
	return {url: `https://fitnessappblob.blob.core.windows.net/images/${fileName}`, deleteBlob: () => blockBlobClient.deleteIfExists()};
}

export default uploadToBlob;