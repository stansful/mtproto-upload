const MTProto = require('@mtproto/core');
const { sleep } = require('@mtproto/core/src/utils/common');

class MtprotoService {
	constructor(api_id, api_hash, path) {
		this.mtproto = new MTProto({
			api_id,
			api_hash,
			storageOptions: { path },
		});
	}

	async call(method, params, options = {}) {
		try {
			return this.mtproto.call(method, params, options);
		} catch (error) {
			console.log(`${method} error:`, error);
			const { error_code, error_message } = error;

			if (error_code === 420) {
				const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
				const ms = seconds * 1000;
				await sleep(ms);
				return this.call(method, params, options);
			}

			if (error_code === 303) {
				const [type, dcIdAsString] = error_message.split('_MIGRATE_');
				const dcId = Number(dcIdAsString);
				if (type === 'PHONE') {
					await this.mtproto.setDefaultDc(dcId);
				} else {
					Object.assign(options, { dcId });
				}

				return this.call(method, params, options);
			}

			return Promise.reject(error);
		}
	}
}

module.exports = MtprotoService;
