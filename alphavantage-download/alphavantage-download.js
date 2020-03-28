const argv = require('yargs').argv;
const alpha = require('alphavantage');
const {AlphaVantageConverter} = require('./timeseries-format');


const getSymbolsFromS3 = async s3Path => {
    console.log('TODO: getSymbolsFromS3()');
    return ['SPY', 'IWM'];
};

const saveDataToS3 = (timeSeries, s3Path) => {
    console.log('saveDataToS3:', s3Path);
    console.log(timeSeries);
    return {'Status': 'OK'};
};

const downloadAll = async (symbolsFile, targetPath) => {
    const av = alpha({key:'1234'}); // TODO: get from .env
    console.log(`Fetching symbols file '${symbolsFile}'`);
    const symbols = await getSymbolsFromS3(symbolsFile);
    console.log(symbols);
    const results = await Promise.all(symbols.map(async symbol => av.data.daily(symbol).then(AlphaVantageConverter.convertDaily(data)).then(ts => saveDataToS3(data, targetPath))));
    console.log(results);
};

module.exports = {getSymbolsFromS3, saveDataToS3, downloadAll};


const main = async symbol => {
    if (argv.symbol) {
        const av = alpha({key: '12345'});
        let data;
        switch(argv.interval) {
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
}

main();
