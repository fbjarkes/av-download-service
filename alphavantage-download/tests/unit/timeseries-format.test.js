const chai = require('chai');
const {AlphaVantageConverter, TS_FORMAT_DAILY} = require('./../../timeseries-format');
const expect = chai.expect;

describe('Time Series Tests', () => {
	const daily = {
		'Meta Data': {
			'1. Information': 'Daily Prices (open, high, low, close) and Volumes',
			'2. Symbol': 'MSFT',
			'3. Last Refreshed': '2020-03-13',
			'4. Output Size': 'Compact',
			'5. Time Zone': 'US/Eastern'
		},
		'Time Series (Daily)': {
			'2020-03-24': {
				'1. open': '143.7500',
				'2. high': '149.6000',
				'3. low': '141.2700',
				'4. close': '148.3400',
				'5. volume': '81850079'
			},
			'2020-03-23': {
				'1. open': '137.0100',
				'2. high': '140.5700',
				'3. low': '132.5200',
				'4. close': '135.9800',
				'5. volume': '78975176'
			},
			'2020-03-20': {
				'1. open': '146.0000',
				'2. high': '147.1000',
				'3. low': '135.8600',
				'4. close': '137.3500',
				'5. volume': '84866215'
			}
		}
	};

	const intraday = {
		'Meta Data': {
			'1. Information': 'Intraday (5min) open, high, low, close prices and volume',
			'2. Symbol': 'MSFT',
			'3. Last Refreshed': '2020-03-24 16:00:00',
			'4. Interval': '5min',
			'5. Output Size': 'Compact',
			'6. Time Zone': 'US/Eastern'
		},
		'Time Series (5min)': {
			'2020-03-24 16:00:00': {
				'1. open': '148.1400',
				'2. high': '148.5900',
				'3. low': '147.1300',
				'4. close': '148.3500',
				'5. volume': '3813495'
			},
			'2020-03-24 15:55:00': {
				'1. open': '146.0400',
				'2. high': '148.1900',
				'3. low': '145.5300',
				'4. close': '148.1300',
				'5. volume': '1830626'
			},
			'2020-03-24 15:50:00': {
				'1. open': '147.2900',
				'2. high': '147.5900',
				'3. low': '145.6900',
				'4. close': '146.0600',
				'5. volume': '1107963'
			}
		}
	};

	describe('convertDaily', () => {
		it.only('should convert daily data to simple generic format', async () => {
			expect(AlphaVantageConverter.convertDaily(daily)).to.deep.equal(TS_FORMAT_DAILY);
		});
	});
});
