const chai = require('chai');
const {AlphaVantageConverter, TS_FORMAT_DAILY, TS_FORMAT_INTRADAY, ALPHAVANTAGE_DAILY_EXAMPLE, ALPHAVANTAGE_INTRADAY_EXAMPLE} = require('./../../timeseries');
const expect = chai.expect;

describe('Time Series Tests', () => {
	describe('convertDaily', () => {
		it('should convert daily data to simple generic format', async () => {
			expect(AlphaVantageConverter.convertDaily(ALPHAVANTAGE_DAILY_EXAMPLE)).to.deep.equal(TS_FORMAT_DAILY);
		});
	});

	describe('convertIntraday', () => {
		it('should convert intraday data to simple generic format', async () => {
			expect(AlphaVantageConverter.convertIntraday(ALPHAVANTAGE_INTRADAY_EXAMPLE, '5min')).to.deep.equal(TS_FORMAT_INTRADAY);
		});
	});
});
