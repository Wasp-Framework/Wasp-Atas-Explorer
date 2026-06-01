import { sanitizeUploadedAggregationData } from './uploadSanitizer';

describe('sanitizeUploadedAggregationData', () => {
  it('removes unsupported top-level features and part classes while preserving supported parts', () => {
    const rawData = {
      parts: [
        { class_type: 'Part', name: 'Beam' },
        { class_type: 'MeshConstraint', name: 'Ignored constraint proxy' },
        { class_type: 'Part', name: 'Node' },
      ],
      global_constraints: [{ type: 'MeshConstraint' }, { type: 'PlaneConstraint' }],
      catalog: { foo: 'bar' },
    };

    const result = sanitizeUploadedAggregationData(rawData);

    expect(result.aggregationData.parts).toEqual([
      { class_type: 'Part', name: 'Beam' },
      { class_type: 'Part', name: 'Node' },
    ]);
    expect(result.aggregationData.global_constraints).toEqual([]);
    expect(result.aggregationData.catalog).toBeUndefined();
    expect(result.warnings).toEqual([
      'Ignored unsupported part classes: MeshConstraint (1).',
      'Ignored unsupported global constraints (2).',
      'Ignored unsupported catalog data from the uploaded aggregation.',
    ]);
  });
});
