export function buildFilterExpression<TSource>(
  source: TSource,
  keys?: string[]
) {
  if (!source) {
    return {};
  }

  const presentKeys = (keys?.length ? keys : Object.keys(source)).filter(
    (k) => source[k] || source[k] === false || source[k] === 0
  );

  const FilterExpression = presentKeys
    .map((k) => `${String(k)}=:${String(k)}`)
    .join(' and ');

  if (!presentKeys?.length) {
    return {};
  }

  const ExpressionAttributeValues = presentKeys.reduce((acc, k) => {
    acc[`:${String(k)}`] = source[k];

    return acc;
  }, {});

  return { ExpressionAttributeValues, FilterExpression };
}
