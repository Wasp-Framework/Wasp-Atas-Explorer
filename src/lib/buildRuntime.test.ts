// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { createAggregationFromData } from 'webwaspjs';
import {
  downloadAggregationData,
  exportAggregationData,
  getAggregationDownloadFileName,
} from './buildRuntime';

describe('buildRuntime export helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports aggregation data through webwaspjs toFileData', () => {
    const toFileData = vi.fn(() => ({ aggregation_name: 'demo', parts: {} }));

    expect(exportAggregationData({ toFileData })).toEqual({ aggregation_name: 'demo', parts: {} });
    expect(toFileData).toHaveBeenCalledTimes(1);
  });

  it('sanitizes the download filename', () => {
    expect(getAggregationDownloadFileName('My Set: Draft.json')).toBe('My-Set-Draft.json');
    expect(getAggregationDownloadFileName('')).toBe('aggregation.json');
  });

  it('confirms real webwaspjs 0.3.2 aggregations expose toFileData', () => {
    const aggregation = createAggregationFromData({
      object_type: 'Aggregation',
      name: 'Direct toData check',
      parts: [],
      rules: [],
      rnd_seed: 7,
      global_constraints: [],
      catalog: null,
      mode: 0,
      coll_check: true,
      field: null,
      graph: {},
      include_aggr_geo: true,
      aggregated_parts: {},
      aggregated_parts_sequence: [],
    });

    expect(typeof aggregation.toFileData).toBe('function');
    expect(exportAggregationData(aggregation)).toEqual({
      aggregation_name: 'Direct toData check',
      parts: {},
    });
  });

  it('downloads the exported aggregation as json', () => {
    const createObjectURL = vi.fn(() => 'blob:download');
    const revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild');

    const result = downloadAggregationData(
      {
        toFileData: () => ({ aggregation_name: 'Test Export', parts: [{ id: 1 }] }),
      },
      'Test Export',
    );

    expect(result.fileName).toBe('Test-Export.json');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:download');
  });
});
