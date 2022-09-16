// https://core.telegram.org/api/files#uploading-files
class UploadService {
	// all parts(max3000) must have same size except last. Conditions: partSize % 1024 = 0 and (512KB) 524288 % partSize = 0
	partSizes = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288];

	constructor(api) {
		this.api = api;
	}

	async uploadToServer(fileBuffer, fileId, fileName) {
		const imageSize = Buffer.byteLength(fileBuffer);
		const lastPartSizeElement = this.partSizes[this.partSizes.length - 1];
		const partMaxSize =
			imageSize >= lastPartSizeElement ? lastPartSizeElement : this.partSizes.reverse().find(size => imageSize <= size);
		const chunks = Math.ceil(imageSize / partMaxSize);
		console.log(`Number of file parts: ${chunks}`);
		if (chunks > 3000) {
			throw new Error('Number of file parts > than 3k');
		}

		await Promise.all(Array.from(Array(chunks).keys()).map(async (i) => {
			const partSize = i === chunks - 1 ? imageSize % partMaxSize : partMaxSize;
			const part = fileBuffer.slice(i * partMaxSize, i * partMaxSize + partSize);
			await this.api.call('upload.saveBigFilePart', {
				file_id: fileId,
				file_part: i,
				file_total_parts: chunks,
				bytes: part,
			});
		}));

		return {
			_: 'inputFileBig',
			id: fileId,
			parts: chunks,
			name: fileName,
		};
	}
}

module.exports = UploadService;
