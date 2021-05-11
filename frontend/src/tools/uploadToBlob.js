import { BlobServiceClient } from '@azure/storage-blob';

async function uploadToBlob(fileName, file) {
	const blobServiceClient = new BlobServiceClient('https://fitnessappblob.blob.core.windows.net/?sv=2020-02-10&ss=b&srt=sco&sp=rwdlacx&se=2022-05-12T01:15:18Z&st=2021-05-10T17:15:18Z&sip=0.0.0.0-255.255.255.255&spr=https,http&sig=Z2UOLXFM4MHuedhXq%2BMXXodC6uLwi%2FQcndR65QS%2FcPg%3D');

	const containerClient = blobServiceClient.getContainerClient('images');
	const blockBlobClient = containerClient.getBlockBlobClient(fileName);

	await blockBlobClient.uploadData(file);
	return {url: `https://fitnessappblob.blob.core.windows.net/images/${fileName}`, deleteBlob: () => blockBlobClient.deleteIfExists()};
}

export default uploadToBlob;