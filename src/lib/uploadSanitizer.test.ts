import { createAggregationFromData } from 'webwaspjs';
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

  it('normalizes Wasp serialized uploads without stripping supported aggregation state', () => {
    const rawData = {
      name: 'Uploaded export',
      parts: {
        a: { class_type: 'Part', name: 'Beam' },
      },
      aggregated_parts: {
        '0': { id: 0, name: 'Beam' },
      },
      aggregated_parts_sequence: [0],
    };

    const result = sanitizeUploadedAggregationData(rawData);

    expect(result.aggregationData).toEqual({
      object_type: 'Aggregation',
      name: 'Uploaded export',
      parts: [{ class_type: 'Part', name: 'Beam' }],
      rules: [],
      global_constraints: [],
      catalog: null,
      mode: 0,
      coll_check: true,
      field: null,
      graph: {},
      aggregated_parts: {
        '0': { id: 0, name: 'Beam' },
      },
      aggregated_parts_sequence: [0],
    });
    expect(result.warnings).toEqual([]);
  });

  it('accepts webwaspjs 0.3.5 serialized aggregation payloads', () => {
    const rawData = {
      object_type: 'Aggregation',
      name: 'Direct upload check',
      parts: [],
      rules: [],
      rnd_seed: 7,
      global_constraints: [],
      catalog: null,
      mode: 0,
      coll_check: true,
      field: null,
      graph: {},
      include_aggr_geo: false,
      aggregated_parts: {},
      aggregated_parts_sequence: [],
    };

    const { aggregationData, warnings } = sanitizeUploadedAggregationData(rawData);
    const aggregation = createAggregationFromData(aggregationData);

    expect(aggregation.name).toBe('Direct upload check');
    expect(typeof aggregation.toData).toBe('function');
    expect(warnings).toEqual([]);
  });

  it('rejects the legacy compact aggregation export format with a clear error', () => {
    const rawData = {
      aggregation_name: 'Legacy compact export',
      parts: {
        a: { class_type: 'Part', name: 'Beam' },
      },
    };

    expect(() => sanitizeUploadedAggregationData(rawData)).toThrow(
      'This file uses the compact aggregation export format and cannot be uploaded here. Use a Wasp serialized aggregation file or re-download the dataset from the build screen.',
    );
  });
});
