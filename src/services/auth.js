const input = require('input');

class AuthService {
	constructor(api, phoneNumber) {
		this.api = api;
		this.phoneNumber = phoneNumber;
	}

	async #sendCode() {
		return this.api.call('auth.sendCode', {
			phone_number: this.phoneNumber,
			settings: { _: 'codeSettings' },
		});
	}

	async #signIn(phone_code_hash) {
		const phone_code = await input.text('Please, enter code?');
		return this.api.call('auth.signIn', {
			phone_code,
			phone_number: this.phoneNumber,
			phone_code_hash,
		});
	}

	async #signUp(phone_code_hash, first_name = 'John', last_name = 'Doe') {
		return this.api.call('auth.signUp', {
			phone_number: this.phoneNumber,
			phone_code_hash,
			first_name,
			last_name,
		});
	}

	async #getPassword() {
		return this.api.call('account.getPassword');
	}

	async #checkPassword(srp_id, A, M1) {
		return this.api.call('auth.checkPassword', {
			password: {
				_: 'inputCheckPasswordSRP',
				srp_id,
				A,
				M1,
			},
		});
	}

	async getUser() {
		try {
			return await this.api.call('users.getFullUser', {
				id: { _: 'inputUserSelf' },
			});
		} catch (e) {
			return null;
		}
	}

	async signIn() {
		try {
			const codeInfo = await this.#sendCode();
			const codeHash = codeInfo.phone_code_hash;
			const signInResult = await this.#signIn(codeHash);
			if (signInResult._ === 'auth.authorizationSignUpRequired') {
				await this.#signUp(codeHash);
			}
		} catch (e) {
			if (e.error_message !== 'SESSION_PASSWORD_NEEDED') {
				console.log('auth error', e);
			}
			const { srp_id, current_algo, srp_B } = await this.#getPassword();
			const { g, p, salt1, salt2 } = current_algo;
			const password = await input.text('Please, enter password?');
			const { A, M1 } = await this.api.mtproto.crypto.getSRPParams({
				g,
				p,
				salt1,
				salt2,
				gB: srp_B,
				password,
			});
			await this.#checkPassword(srp_id, A, M1);
		}
	}
}

module.exports = AuthService;
