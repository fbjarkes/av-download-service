const ALPHAVANTAGE_DAILY_EXAMPLE = {
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

const ALPHAVANTAGE_INTRADAY_EXAMPLE = {
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

const TS_FORMAT_INTRADAY = {
	symbol: 'MSFT',
	time_zone: 'US/Eastern',
	interval: '5min',
	data: {
		'2020-03-24 16:00:00': {
			open: '148.1400',
			high: '148.5900',
			low: '147.1300',
			close: '148.3500',
			volume: '3813495'
		},
		'2020-03-24 15:55:00': {
			open: '146.0400',
			high: '148.1900',
			low: '145.5300',
			close: '148.1300',
			volume: '1830626'
		},
		'2020-03-24 15:50:00': {
			open: '147.2900',
			high: '147.5900',
			low: '145.6900',
			close: '146.0600',
			volume: '1107963'
		}
	}
};

const TS_FORMAT_DAILY = {
	symbol: 'MSFT',
	time_zone: 'US/Eastern',
	data: {
		'2020-03-24': {
			open: Number('143.7500'),
			high: Number('149.6000'),
			low: Number('141.2700'),
			close: Number('148.3400'),
			volume: Number('81850079')
		},
		'2020-03-23': {
			open: Number('137.0100'),
			high: Number('140.5700'),
			low: Number('132.5200'),
			close: Number('135.9800'),
			volume: Number('78975176')
		},
		'2020-03-20': {
			open: Number('146.0000'),
			high: Number('147.1000'),
			low: Number('135.8600'),
			close: Number('137.3500'),
			volume: Number('84866215')
		}
	}
};

class TimeSeriesDaily {
	constructor(symbol, tz) {
		this.symbol = symbol;
		this.time_zone = tz;
		this.data = {};
	}

	addOHLC(date, ohlc) {
		this.data[date] = ohlc;
	}
}

class AlphaVantageConverter {
	static cleanData(data) {
		return {
			open: Number(data['1. open']),
			high: Number(data['2. high']),
			low: Number(data['3. low']),
			close: Number(data['4. close']),
			volume: Number(data['5. volume'])
		};
	}

	static convertDaily(data) {
		const timeSeries = new TimeSeriesDaily(data['Meta Data']['2. Symbol'], data['Meta Data']['5. Time Zone']);
		const series = data['Time Series (Daily)'];
		for (var key in series) {
			timeSeries.addOHLC(key, AlphaVantageConverter.cleanData(series[key]));
		}
		return timeSeries;
	}
}

module.exports = { TS_FORMAT_DAILY, TS_FORMAT_INTRADAY, AlphaVantageConverter, ALPHAVANTAGE_DAILY_EXAMPLE };
