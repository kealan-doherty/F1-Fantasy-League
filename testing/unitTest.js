import { jest } from '@jest/globals';
import { requireAuth, handleValidationErrors, validateSignIn } from '../middleware.js';
import { pullDriverResults } from '../public/pullRaceResults.js';

describe('requireAuth middleware', () => {
	test('allows access for authenticated users', () => {
		const req = {
			get: jest.fn().mockReturnValue(''),
			session: {
				user: {
					username: 'kealan'
				}
			}
		};
		const res = {
			redirect: jest.fn()
		};
		const next = jest.fn();

		requireAuth(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(res.redirect).not.toHaveBeenCalled();
	});

	test('redirects unauthenticated users to landing page', () => {
		const req = {
			get: jest.fn().mockReturnValue(''),
			originalUrl: '/profilePage',
			session: {}
		};
		const res = {
			redirect: jest.fn()
		};
		const next = jest.fn();

		requireAuth(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.redirect).toHaveBeenCalledWith('/');
		expect(res.redirect).toHaveBeenCalledTimes(1);
	});
});

describe('handleValidationErrors middleware', () => {
	test('returns 400 with error messages for invalid sign-in input', async () => {
		const req = {
			body: {
				username: '',
				password: ''
			}
		};

		for (const validator of validateSignIn) {
			await validator.run(req);
		}

		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
		const next = jest.fn();

		handleValidationErrors(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			errors: expect.arrayContaining([
				'Username field cannot be empty',
				'Password field cannot be blank'
			])
		});
	});

	test('calls next for valid sign-in input', async () => {
		const req = {
			body: {
				username: 'kealan',
				password: 'supersecret'
			}
		};

		for (const validator of validateSignIn) {
			await validator.run(req);
		}

		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
		const next = jest.fn();

		handleValidationErrors(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
	});
});

describe('pullDriverResults', () => {
	test('maps driver numbers and converts finishing positions to fantasy points', () => {
		const apiPayload = [
			{ driver_number: 1, position: 1 },
			{ driver_number: 3, position: 2 },
			{ driver_number: 81, position: 3 },
			{ driver_number: 44, position: 4 },
			{ driver_number: 63, position: 5 },
			{ driver_number: 12, position: 6 },
			{ driver_number: 14, position: 7 },
			{ driver_number: 55, position: 8 },
			{ driver_number: 23, position: 9 },
			{ driver_number: 30, position: 10 }
		];

		const results = pullDriverResults(apiPayload);

		expect(results).toEqual({
			Lando_Norris: 25,
			Max_Verstappen: 18,
			Oscar_Piastri: 15,
			Lewis_Hamilton: 12,
			George_Russell: 10,
			Kimi_Antonelli: 8,
			Fernando_Alonso: 6,
			Carlos_Sainz: 4,
			Alex_Albon: 2,
			Liam_Lawson: 1
		});
	});
});

describe('pullDriverResults', () => {
	test('ignores unknown driver numbers while still scoring known drivers', () => {
		const apiPayload = [
			{ driver_number: 999, position: 1 },
			{ driver_number: 3, position: 2 },
			{ driver_number: 81, position: 3 },
			{ driver_number: 44, position: 4 },
			{ driver_number: 63, position: 5 },
			{ driver_number: 12, position: 6 },
			{ driver_number: 14, position: 7 },
			{ driver_number: 55, position: 8 },
			{ driver_number: 23, position: 9 },
			{ driver_number: 30, position: 10 }
		];

		const results = pullDriverResults(apiPayload);

		expect(results.Unknown_Driver).toBeUndefined();
		expect(results).toMatchObject({
			Max_Verstappen: 18,
			Oscar_Piastri: 15,
			Lewis_Hamilton: 12,
			George_Russell: 10,
			Kimi_Antonelli: 8,
			Fernando_Alonso: 6,
			Carlos_Sainz: 4,
			Alex_Albon: 2,
			Liam_Lawson: 1
		});
	});
});

describe('pullDriverResults', () => {
	test('handles missing position data', () => {
		const apiPayload = [
			{ driver_number: 1 },
			{ driver_number: 3, position: null },
			{ driver_number: 81, position: 3 },
			{ driver_number: 44, position: 4 },
			{ driver_number: 63, position: 5 },
			{ driver_number: 12, position: 6 },
			{ driver_number: 14, position: 7 },
			{ driver_number: 55, position: 8 },
			{ driver_number: 23, position: 9 },
			{ driver_number: 30, position: 10 }
		];

		const results = pullDriverResults(apiPayload);

		expect(results.Lando_Norris).toBeUndefined();
		expect(results.Max_Verstappen).toBeNull();
	});
});

