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
		logger.debug(`getSymbolsFromS3(), path=${path}`);
		const params = { Bucket: this.bucket, Key: path };
		try {
			const res = await this.s3.getObject(params).promise();
			if (res.Body) {
				return res.Body.toString().split('\n').filter(symbol => symbol.length > 0 && !symbol.startsWith('#'));
			} else {
				console.log('No data in file', path);
			}
		} catch (err) {
			console.log(err);
		}

		return [];
	}

	async saveDataToS3(path, timeSeries) {
		logger.debug(`saveDataToS3(), path=${path}`);
		logger.silly(`timeseries=${JSON.stringify(timeSeries)}`);

		const params = { Bucket: this.bucket, Key: path, Body: JSON.stringify(timeSeries, null, 2)};
		try {
			await this.s3.putObject(params).promise();
			return true;
		} catch (err) {
			console.log(err);
		}
		return false;
	}
}

class DownloadHelper {

	async downloadDaily(symbols, targetPath, alpha, s3Helper) {
		return Promise.all(symbols.map(async (symbol) => {
			logger.debug(`downloadDaily(): Downloading daily data for '${symbol}' targetPath=${targetPath}`);
			alpha.data
				.daily(symbol)
				.then(data => AlphaVantageConverter.convertDaily(data))
				.then((ts) => s3Helper.saveDataToS3(`${targetPath}/${symbol}.json`, ts))
		}
		));
	}
	
	async downloadIntraday(symbols, interval, targetPath, alpha, s3Helper) {
		return Promise.all(symbols.map(async (symbol) => {
			logger.debug(`downloadIntraday(): Downloading intraday '${interval}' data for '${symbol}',  targetPath=${targetPath}`);
			alpha.data
				.intraday(symbol, interval)
				.then(data => AlphaVantageConverter.convertDaily(data))
				.then((ts) => s3Helper.saveDataToS3(ts, targetPath))
		}
		));
	}	
}

const downloadAll = async (config, {interval, symbolsFile}, av = alpha({ key: '1234' })) => {
	logger.debug(`downloadAll(): symbolsFile=${symbolsFile}, interval=${interval}, config=${JSON.stringify(config, null, 2)}`);

	if (!(config.API_KEY && config.S3_BUCKET && config.S3_SYMBOL_PATH && config.S3_PATH_DAILY && config.S3_PATH_INTRADAY)) {
		throw new Error('Invalid config')
	}

	if (!(interval && symbolsFile)) {
		throw new Error('Invalid parameters')
    }

	const s3Helper = new S3Helper(config['S3_BUCKET']);	
	const downloadHelper = new DownloadHelper();
	
	// Config for 5 requests per minute
	const limiter = new Bottleneck({
		reservoir: 5, // initial value
		reservoirRefreshAmount: 5,
		reservoirRefreshInterval: 5 * 1000, // must be divisible by 250
		maxConcurrent: 1,
		minTime: 333 // pick a value that makes sense for your use case
	});
	
	let wrapped, result, symbols;
	switch (interval) {
		case '1d': 
			symbols = await s3Helper.getSymbolsFromS3(`${config['S3_SYMBOL_PATH']}/${symbolsFile}`);
			wrapped = limiter.wrap(downloadHelper.downloadDaily);
			result = await wrapped(symbols, config['S3_PATH_DAILY'], av, s3Helper);
			break;
		
		case '1min':
		case '5min':
		case '15min':
		case '30min':
		case '60min':
			symbols = await s3Helper.getSymbolsFromS3(symbolsFile);
			wrapped = limiter.wrap(downloadHelper.downloadIntraday);
			result = await wrapped(symbols, interval, `${config['S3_PATH_INTRADAY']}/${interval}`, av, s3Helper);
			break;
		
		default:
			throw new Error('Invalid interval')
	}
	return result;
};

module.exports = { S3Helper, DownloadHelper, downloadAll };
