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

function looksLikeCompactAggregationExport(rawData: any) {
  return (
    rawData &&
    typeof rawData === 'object' &&
    typeof rawData.aggregation_name === 'string' &&
    rawData.parts &&
    typeof rawData.parts === 'object' &&
    !rawData.object_type
  );
}

export function sanitizeUploadedAggregationData(rawData: any): SanitizedUploadResult {
  if (looksLikeCompactAggregationExport(rawData)) {
    throw new Error(
      'This file uses the compact aggregation export format and cannot be uploaded here. ' +
      'Use a Wasp serialized aggregation file or re-download the dataset from the build screen.',
    );
  }

  const aggregationData = JSON.parse(JSON.stringify(rawData ?? {}));
  const warnings: string[] = [];

  aggregationData.object_type = aggregationData.object_type || 'Aggregation';
  aggregationData.name = aggregationData.name || 'Uploaded aggregation';
  aggregationData.rules = Array.isArray(aggregationData.rules) ? aggregationData.rules : [];
  aggregationData.global_constraints = Array.isArray(aggregationData.global_constraints)
    ? aggregationData.global_constraints
    : [];
  aggregationData.catalog = aggregationData.catalog ?? null;
  aggregationData.mode = Number.isFinite(aggregationData.mode) ? aggregationData.mode : 0;
  aggregationData.coll_check = typeof aggregationData.coll_check === 'boolean' ? aggregationData.coll_check : true;
  aggregationData.field = aggregationData.field ?? null;
  aggregationData.graph = aggregationData.graph && typeof aggregationData.graph === 'object' ? aggregationData.graph : {};
  aggregationData.aggregated_parts = aggregationData.aggregated_parts && typeof aggregationData.aggregated_parts === 'object'
    ? aggregationData.aggregated_parts
    : {};
  aggregationData.aggregated_parts_sequence = Array.isArray(aggregationData.aggregated_parts_sequence)
    ? aggregationData.aggregated_parts_sequence
    : [];

  const rawParts = normalizeParts(aggregationData.parts);
  aggregationData.parts = rawParts;
  const unsupportedPartClasses = rawParts
    .filter((part) => part && part.class_type && part.class_type !== 'Part')
    .map((part) => String(part.class_type));

  if (unsupportedPartClasses.length > 0) {
    const supportedParts = rawParts.filter((part) => !part?.class_type || part.class_type === 'Part');
    aggregationData.parts = supportedParts;
    warnings.push(`Ignored unsupported part classes: ${formatCounts(unsupportedPartClasses)}.`);
  }

  const globalConstraints = aggregationData.global_constraints;
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
