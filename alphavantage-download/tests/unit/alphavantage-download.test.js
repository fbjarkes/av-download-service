const chai = require('chai');
const sinon = require('sinon');
const AWS = require('aws-sdk');
const alpha = require('alphavantage');
const {S3Helper, DownloadHelper, downloadAll} = require('../../alphavantage-download');
const {TS_FORMAT_DAILY, ALPHAVANTAGE_DAILY_EXAMPLE, ALPHAVANTAGE_INTRADAY_EXAMPLE } = require('../../timeseries');

const expect = chai.expect;

describe('AlphaVantage Download Tests', () => {
	describe('S3Helper', () => {
		let sandbox;
		beforeEach(() => {
			sandbox = sinon.createSandbox();
		});
		afterEach(() => {
			sandbox.restore();
		});
		describe('getSymbolsFromS3', () => {
			it('should call S3 getObject and return symbols as array', async () => {
				const s3 = new AWS.S3();
				const s3Helper = new S3Helper('bucket', s3);
				sandbox.stub(s3, 'getObject').returns({
					promise: async () => {
						return {
							LastModified: new Date(),
							Body: Buffer.from('SPY\nQQQ\n#IWM\n')
						};
					}
				});
				const res = await s3Helper.getSymbolsFromS3('test.txt');
				expect(res).to.deep.equal(['SPY', 'QQQ'])
			});
		});
	
		describe('saveDataToS3', () => {
			it('should write/overwrite file to S3', async () => {			
				const s3 = new AWS.S3();
				const s3Helper = new S3Helper('bucket', s3);
				const stub = sandbox.stub(s3, 'putObject');
				stub.withArgs({Bucket: 'bucket', Key: 'test/test.json', Body: JSON.stringify(TS_FORMAT_DAILY, null, 2)}).returns({
					promise: async () => ({VersionId: 1})
				});
				
				const res = await s3Helper.saveDataToS3('test/test.json', TS_FORMAT_DAILY);
				expect(res).to.be.true;
			});
		});
	});

	describe('downloadAll', () => {
		let sandbox;
		const cfg = {
			API_KEY: 1234,
			S3_BUCKET: 'bucket',
			S3_SYMBOL_PATH: 'symbols',
			S3_PATH_DAILY: 'data/daily',
			S3_PATH_INTRADAY: 'data/intraday'
		}
		const params = {
			interval: '1d',
			symbolsFile: 'leaders.txt'
		}
		
		beforeEach(() => {
			sandbox = sinon.createSandbox();
		});
		afterEach(() => {
			sandbox.restore();
		});
		it('should save daily data to S3 for each symbol', async () => {			
			sandbox.stub(S3Helper.prototype, 'getSymbolsFromS3').callsFake(async () => ['SPY','QQQ']);
			const saveDataToS3 = sandbox.stub(S3Helper.prototype, 'saveDataToS3').callsFake(async path => { 
				return true;
			});
			const alpha = {data: {
				daily: sandbox.stub().callsFake(async () => { return ALPHAVANTAGE_DAILY_EXAMPLE})
			}};

			await downloadAll(cfg, params, alpha);
			
			expect(saveDataToS3.calledTwice).to.be.true;
			expect(saveDataToS3.getCall(0).args[0]).to.equal('data/daily/SPY.json');
			expect(saveDataToS3.getCall(1).args[0]).to.equal('data/daily/QQQ.json');
		});

		it.only('should save intraday data to S3 for each symbol', async () => {			
			sandbox.stub(S3Helper.prototype, 'getSymbolsFromS3').callsFake(async () => ['SPY','QQQ']);
			const saveDataToS3 = sandbox.stub(S3Helper.prototype, 'saveDataToS3').callsFake(async () => { return true });
			const alpha = {data: {
				intraday: sandbox.stub().callsFake(async () => { return ALPHAVANTAGE_INTRADAY_EXAMPLE})
			}};

			await downloadAll(cfg, {interval: '5min', symbolsFile: 'intraday.txt'}, alpha);
			
			expect(saveDataToS3.calledTwice).to.be.true;
			expect(saveDataToS3.getCall(0).args[0]).to.equal('data/intraday/5min/SPY.json');
			expect(saveDataToS3.getCall(1).args[0]).to.equal('data/intraday/5min/QQQ.json');
		});
		
		it('should handle AlphaVantage error', async () => {
			sandbox.stub(S3Helper.prototype, 'getSymbolsFromS3').callsFake(async () => ['SPY','QQQ']);
			const alpha = {data: {
				daily: sandbox.stub().throws('Alpha Vantage Error')
			}};
			try {
				await downloadAll(cfg, params, alpha);
				throw new Error('Fail');
			} catch (e) {
				expect(e).to.match(/Alpha Vantage Error/);
			}
		});

		it('should handle invalid config', async () => {
			const invalid = {
				API_KEY: 1234,
				S3_BUCKET: 'bucket',
				S3_SYMBOL_PATH: '', // invalid
				S3_PATH_DAILY: 'data/daily',
				S3_PATH_INTRADAY: 'data/intraday'
			}
			try {
				await downloadAll(invalid, params);
				throw new Error('Fail');
			} catch (e) {
				expect(e).to.match(/Invalid config/);
			}
		});

		it('should handle invalid symbols file', async () => {
			const invalid = {
				interval: '1d',
				symbolsFile: '' // invalid
			}
			try {
				await downloadAll(cfg, invalid);
				throw new Error('Fail');
			} catch (e) {
				expect(e).to.match(/Invalid parameters/);
			}
		});

		it('should handle invalid interval', async () => {
			const cfg = {
				API_KEY: 1234,
				S3_BUCKET: 'bucket',
				S3_SYMBOL_PATH: 'symbols',
				S3_PATH_DAILY: 'data/daily',
				S3_PATH_INTRADAY: 'data/intraday'
			}
			const params = {
				interval: '240min', // invalid
				symbolsFile: 'iwm.txt'
			}
			try {
				await downloadAll(cfg, params);
				throw new Error('Fail');
			} catch (e) {
				expect(e).to.match(/Invalid interval/);
			}
		});
	});
});
