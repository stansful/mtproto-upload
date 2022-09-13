require('dotenv').config();
const path = require('path');
const fs = require('fs');
const random = require('random-bigint');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const MtprotoService = require('./services/mtproto');
const AuthService = require('./services/auth');
const UploadService = require('./services/upload');

const credentials = {
	PHONE_NUMBER: process.env.PHONE_NUMBER, // '+79991113322',
	API_ID: process.env.API_ID, // '7777777',
	API_HASH: process.env.API_HASH, //'dadsd67sgdds67gag76',
};
const savePath = path.join(__dirname, 'storage', 'secretSession.json');

const start = async () => {
	try {
		const mtproto = new MtprotoService(credentials.API_ID, credentials.API_HASH, savePath);
		const auth = new AuthService(mtproto, credentials.PHONE_NUMBER);
		const user = await auth.getUser();

		if (!user) {
			// send confirm code to telegram app
			await auth.signIn(auth);
		}

		const { chats } = await mtproto.call('messages.getAllChats', { except_ids: [] });
		// console.log(chats, 'AllChats:') // find required chat by id or name... whatever
		const { id, access_hash } = chats.filter(chat => chat._ === 'channel').find(chat => chat.id === '1793809121');

		const videoName = 'The.Lord.of.the.Rings.The.Rings.of.Power.S01E01.720p.ColdFilm.mp4';
		const videoPath = path.join(__dirname, 'videos', videoName);

		const fileBuffer = fs.readFileSync(videoPath);
		const fileId = random(64);

		const fileMetaData = await ffprobe(videoPath, { path: ffprobeStatic.path });
		const { width, height, duration } = fileMetaData.streams[0];

		const uploader = new UploadService(mtproto);
		const inputFile = await uploader.uploadToServer(fileBuffer, fileId, videoName);

		const message = 'Video with some message!';
		const sendingToChannel = {
			_: 'inputPeerChannel',
			channel_id: id,
			access_hash,
		};
		const media = {
			_: 'inputMediaUploadedDocument',
			file: inputFile,
			mime_type: 'video/mp4',
			attributes: [
				{
					_: 'documentAttributeVideo',
					supports_streaming: true,
					w: width,
					h: height,
					duration: parseFloat(duration),
				},
			],
		};

		const result = await mtproto.call('messages.sendMedia', {
			media,
			message,
			peer: sendingToChannel,
			random_id: random(64),
		});
		console.log(result);
	} catch (e) {
		console.log(e, '\nERROR\n');
	}
};
start();
