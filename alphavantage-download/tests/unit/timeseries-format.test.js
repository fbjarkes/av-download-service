const chai = require('chai');
const {AlphaVantageConverter, TS_FORMAT_DAILY, ALPHAVANTAGE_DAILY_EXAMPLE} = require('./../../timeseries');
const expect = chai.expect;

describe('Time Series Tests', () => {


	describe('convertDaily', () => {
		it('should convert daily data to simple generic format', async () => {
			expect(AlphaVantageConverter.convertDaily(ALPHAVANTAGE_DAILY_EXAMPLE)).to.deep.equal(TS_FORMAT_DAILY);
		});
	});
});
