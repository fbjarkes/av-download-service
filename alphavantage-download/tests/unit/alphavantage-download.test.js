
const chai = require('chai');
const alphaDownload = require('../../alphavantage-download');

const expect = chai.expect;
var event, context;

describe('AlphaVantage Download Tests', () => {
    describe('getSymbolsFromS3', () => {
        it('should read all symbols in specified .txt file on S3', () => {});
    });
    
    describe(('saveToS3'), () => {
        it('should write/overwrite file to S3');
    });

    describe('downloadAll', () => {
        it('should call get-symbols-function, then call AV download-function for each symbol, then call save to S3-function');
        it('should call the AV download function in parallel at max rate per minute (default=30)');
        it('should handle throttling errors and retry gracefully');
    });
});
