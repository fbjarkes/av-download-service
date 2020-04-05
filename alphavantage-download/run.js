const alpha = require('alphavantage');
const dotenv = require('dotenv');
const logger = require('./logger');
const {downloadAll} = require('./alphavantage-download'); 

const argv = require('yargs').argv;

const main = async (symbol) => {
    const {parsed: cfg} = dotenv.config();
	logger.info(`Using config config ${JSON.stringify(cfg)}`);
	
    if (argv.symbolsFile) {
        await downloadAll(cfg, {'interval': '1d', 'symbolsFile': argv.symbolsFile}, alpha({ key: cfg['API_KEY'] }));
    } 

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