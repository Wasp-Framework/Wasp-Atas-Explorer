type SanitizedUploadResult = {
  aggregationData: any;
  warnings: string[];
};

function countByValue(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return counts;
}

function formatCounts(values: string[]) {
  return Array.from(countByValue(values).entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, count]) => `${label} (${count})`)
    .join(', ');
}

function normalizeParts(parts: any): any[] {
  if (Array.isArray(parts)) return parts;
  if (!parts || typeof parts !== 'object') return [];
  return Object.values(parts);
}

export function sanitizeUploadedAggregationData(rawData: any): SanitizedUploadResult {
  const aggregationData = JSON.parse(JSON.stringify(rawData ?? {}));
  const warnings: string[] = [];

  const rawParts = normalizeParts(aggregationData.parts);
  const unsupportedPartClasses = rawParts
    .filter((part) => part && part.class_type && part.class_type !== 'Part')
    .map((part) => String(part.class_type));

  if (unsupportedPartClasses.length > 0) {
    const supportedParts = rawParts.filter((part) => !part?.class_type || part.class_type === 'Part');
    aggregationData.parts = supportedParts;
    warnings.push(`Ignored unsupported part classes: ${formatCounts(unsupportedPartClasses)}.`);
  }

  const globalConstraints = Array.isArray(aggregationData.global_constraints)
    ? aggregationData.global_constraints
    : [];
  if (globalConstraints.length > 0) {
    aggregationData.global_constraints = [];
    warnings.push(`Ignored unsupported global constraints (${globalConstraints.length}).`);
  }

  if (aggregationData.catalog) {
    delete aggregationData.catalog;
    warnings.push('Ignored unsupported catalog data from the uploaded aggregation.');
  }

  return { aggregationData, warnings };
}
