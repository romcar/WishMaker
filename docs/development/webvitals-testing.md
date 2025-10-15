# Jest Unit Tests for Web Vitals Rating Utility

## Test Coverage Summary

The `webVitalsRating.test.ts` file provides comprehensive Jest unit tests for the `getWebVitalsRating` utility function.

### Test Suite Structure

#### ✅ **getWebVitalsRating Function Tests**
- **CLS (Cumulative Layout Shift)**: 3 test cases covering good, needs-improvement, and poor ratings
- **FID (First Input Delay)**: 3 test cases covering all rating thresholds
- **FCP (First Contentful Paint)**: 3 test cases covering all rating thresholds
- **LCP (Largest Contentful Paint)**: 3 test cases covering all rating thresholds
- **TTFB (Time to First Byte)**: 3 test cases covering all rating thresholds
- **Unknown Metrics**: 2 test cases for unknown/invalid metric handling
- **Edge Cases**: 4 test cases covering boundary values, negatives, large values, and decimals

#### ✅ **WEB_VITALS_THRESHOLDS Tests**
- **Threshold Values**: Validates correct threshold configuration
- **Object Structure**: Ensures immutable structure and property existence

#### ✅ **WebVitalsRating Type Tests**
- **Type Validation**: Tests TypeScript type constraints

### Test Results
```
✅ 24 tests passed
⏱️  Time: ~0.7s
🔍 0 issues found by Codacy analysis
```

### Key Testing Features

1. **Comprehensive Coverage**: Tests all Web Vitals metrics (CLS, FID, FCP, LCP, TTFB)
2. **Boundary Testing**: Tests exact threshold values and edge cases
3. **Error Handling**: Tests unknown metrics and invalid inputs
4. **Type Safety**: Validates TypeScript type definitions
5. **Performance**: Fast execution (~700ms for all tests)

### Test Categories

- **Happy Path Tests**: Normal metric values within expected ranges
- **Boundary Tests**: Values at exact threshold boundaries
- **Error Cases**: Invalid/unknown metric names
- **Edge Cases**: Negative values, very large values, decimals
- **Configuration Tests**: Threshold object validation

### Usage

Run the tests:
```bash
npm test -- --testPathPattern=webVitalsRating.test.ts --watchAll=false
```

### Quality Assurance

- ✅ All tests pass
- ✅ ESLint compliance
- ✅ Semgrep security analysis passed
- ✅ Trivy vulnerability scan passed
- ✅ TypeScript compilation successful

This test suite ensures the `getWebVitalsRating` function correctly implements Core Web Vitals rating guidelines and handles all edge cases appropriately.