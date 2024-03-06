import { buildFilterExpression } from './build-filter-expression.function';

describe('buildFilterExpression', () => {
  it('returns an object with ExpressionAttributeValues and FilterExpression corresponding to truthy values in source for the provided keys', () => {
    const source = {
      firstName: 'test-firstName-value',
      lastName: 'test-lastName-value',
      email: 'test-email-value',
      mobile: 'test-mobile-value',
      instagram: null,
    };

    const { ExpressionAttributeValues, FilterExpression } =
      buildFilterExpression(source, Object.keys(source));

    expect(ExpressionAttributeValues).toEqual({
      ':email': 'test-email-value',
      ':firstName': 'test-firstName-value',
      ':lastName': 'test-lastName-value',
      ':mobile': 'test-mobile-value',
    });
    expect(FilterExpression).toEqual(
      'firstName=:firstName and lastName=:lastName and email=:email and mobile=:mobile'
    );
  });

  it('returns an empty object when values in source are all falsey for the provided keys', () => {
    const source = {
      instagram: null,
    };

    const { ExpressionAttributeValues, FilterExpression } =
      buildFilterExpression(source, Object.keys(source));

    expect(ExpressionAttributeValues).toBeUndefined();
    expect(FilterExpression).toBeUndefined();
  });

  it('returns an object with ExpressionAttributeValues and FilterExpression set to undefined when there are no values provided', () => {
    const source = null;

    const { ExpressionAttributeValues, FilterExpression } =
      buildFilterExpression(source);

    expect(ExpressionAttributeValues).toBeUndefined();
    expect(FilterExpression).toBeUndefined();
  });
});
