const argv = require('yargs').argv;
const alpha = require('alphavantage');
const AWS = require('aws-sdk');
const logger = require('./logger');
const Bottleneck = require('bottleneck');
const dotenv = require('dotenv');

const { AlphaVantageConverter } = require('./timeseries');

class S3Helper {

    constructor(bucket, s3 = new AWS.S3()) {
		this.bucket = bucket;
		this.s3 = s3;
    }
    
	async getSymbolsFromS3(path) {
		const params = { Bucket: this.bucket, Key: path };
		try {
			const res = await this.s3.getObject(params).promise();
			if (res.Body) {
				return res.Body.toString().split('\n');
			} else {
				console.log('No data in file', path);
			}
		} catch (err) {
			console.log(err);
		}

		return [];
	}

	async saveDataToS3(path, timeSeries) {
		const params = { Bucket: this.bucket, Key: path, Body: timeSeries };
		try {
			logger.debug(`saveDateToS3(): putObject with params ${params}`);
			await this.s3.putObject(params).promise();
			return true;
		} catch (err) {
			console.log(err);
		}
		return false;
	}
}

class DownloadHelper {

	async download(symbols, targetPath, alpha, s3Helper) {
		return Promise.all(symbols.map(async (symbol) => {
			logger.debug(`download(): Downloading daily data for '${symbol}'`);
			alpha.data
				.daily(symbol)
				.then(data => AlphaVantageConverter.convertDaily(data))
				.then((ts) => s3Helper.saveDataToS3(ts, targetPath))
		}
		));
	}	
}

const downloadAll = async (config, symbolsFile, av = alpha({ key: '1234' })) => {
	logger.debug(`downloadAll(): symbolsFile=${symbolsFile}, config=${config}`);
	//const alpha = alpha({ key: '1234' });
	const s3Helper = new S3Helper(config['S3_BUCKET']);	
	const downloadHelper = new DownloadHelper();
	const targetPath = config['S3_DOWNLOAD_PATH_DAILY'];
	// Config for 5 requests per minute
	const limiter = new Bottleneck({
		reservoir: 5, // initial value
		reservoirRefreshAmount: 5,
		reservoirRefreshInterval: 5 * 1000, // must be divisible by 250
		maxConcurrent: 1,
		minTime: 333 // pick a value that makes sense for your use case
	});
	
	const symbols = await s3Helper.getSymbolsFromS3(symbolsFile);
	logger.debug(`downloadAll(): Downloading for ${symbols.length} symbols`);
	
	const wrapped = limiter.wrap(downloadHelper.download);
	const result = await wrapped(symbols, targetPath, av, s3Helper);
};

module.exports = { S3Helper, DownloadHelper, downloadAll };

const main = async (symbol) => {
	if (argv.symbol) {
		const av = alpha({ key: '12345' });
		let data;
		switch (argv.interval) {
			case '1d':
				data = await av.data.daily(argv.symbol).then(AlphaVantageConverter.convertDaily);
				break;
			case '5min':
				data = await av.data.intraday(argv.symbol);
				break;
			default:
				console.log('Incorrect interval');
		}
		console.log(data);
	}
};

main();
