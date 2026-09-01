import * as fc from 'fast-check';

// Configure fast-check to run a minimum of 100 samples per property test
fc.configureGlobal({ numRuns: 100 });
