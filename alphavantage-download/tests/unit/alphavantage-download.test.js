const chai = require('chai');
const sinon = require('sinon');
const AWS = require('aws-sdk');
const alpha = require('alphavantage');
const {S3Helper, DownloadHelper, downloadAll} = require('../../alphavantage-download');
const {TS_FORMAT_DAILY, ALPHAVANTAGE_DAILY_EXAMPLE} = require('../../timeseries');

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
							Body: Buffer.from('SPY\nQQQ')
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
				stub.withArgs({Bucket: 'bucket', Key: 'test/test.txt', Body: TS_FORMAT_DAILY}).returns({
					promise: async () => ({VersionId: 1})
				});
				
				const res = await s3Helper.saveDataToS3('test/test.txt', TS_FORMAT_DAILY);
				expect(res).to.be.true;
			});
		});
	});

	describe('downloadAll', () => {
		let sandbox;
		beforeEach(() => {
			sandbox = sinon.createSandbox();
		});
		afterEach(() => {
			sandbox.restore();
		});
		it('should save to S3 for each symbol', async () => {			
			sandbox.stub(S3Helper.prototype, 'getSymbolsFromS3').callsFake(async () => ['SPY','QQQ']);
			const saveDataToS3 = sandbox.stub(S3Helper.prototype, 'saveDataToS3').callsFake(async () => { return true });
			const alpha = {data: {
				daily: sandbox.stub().callsFake(async () => { return ALPHAVANTAGE_DAILY_EXAMPLE})
			}};

			await downloadAll({'S3_BUCKET': 'bucket', 'S3_DOWNLOAD_PATH_DAILY': 'daily'}, 'symbols/iwm.txt', alpha);
			
			expect(saveDataToS3.calledTwice).to.be.true;
		});
		
		it('should handle AlphaVantage error', async () => {
			sandbox.stub(S3Helper.prototype, 'getSymbolsFromS3').callsFake(async () => ['SPY','QQQ']);
			const alpha = {data: {
				daily: sandbox.stub().throws('Alpha Vantage Error')
			}};
			try {
				await downloadAll({'S3_BUCKET': 'bucket', 'S3_DOWNLOAD_PATH_DAILY': 'daily'}, 'symbols/iwm.txt', alpha);
			} catch (e) {
				expect(e).to.match(/Alpha Vantage Error/);
			}
		});
	});
});
