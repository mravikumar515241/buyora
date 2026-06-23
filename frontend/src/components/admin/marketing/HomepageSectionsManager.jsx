import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react';
import { marketingService, PRODUCT_SOURCES, SECTION_TYPES } from '../../../services/marketingService';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { showToast } from '../../ui/Toast';

function parseConfig(json) {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function enrichSection(section) {
  const config = parseConfig(section.configJson);
  return {
    ...section,
    productSource: config.source || '',
    viewAllLink: config.viewAllLink || '',
  };
}

function buildConfig(section) {
  if (section.sectionType === 'PRODUCT_CAROUSEL') {
    const config = {
      source: section.productSource || 'trending',
      viewAllLink: section.viewAllLink || undefined,
    };
    if (section.productSource === 'curated' && section.productIds) {
      config.productIds = section.productIds;
    }
    return JSON.stringify(config);
  }
  if (section.configJson) return section.configJson;
  return section.sectionType === 'HERO_CAROUSEL'
    ? '{"bannerLocation":"HERO"}'
    : section.sectionType === 'BANNER_GRID'
      ? '{"bannerLocation":"DEALS_GRID"}'
      : '{}';
}

export function HomepageSectionsManager() {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-marketing-sections'],
    queryFn: () => marketingService.listSections(),
  });

  useEffect(() => {
    if (data?.length) {
      setSections([...data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(enrichSection));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      marketingService.updateSections(
        payload.map((s) => ({
          ...s,
          configJson: buildConfig(s),
        }))
      ),
    onSuccess: () => {
      showToast('Homepage sections updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-marketing-sections'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-homepage'] });
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to save sections', 'error'),
  });

  const move = (index, direction) => {
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next.map((s, i) => ({ ...s, sortOrder: i })));
  };

  const updateField = (index, field, value) => {
    setSections(sections.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const toggleVisible = (index) => {
    updateField(index, 'visible', !sections[index].visible);
  };

  const typeLabel = (type) => SECTION_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Section Management</h2>
          <p className="text-sm text-slate-500">
            Sections are stored in the database and rendered dynamically by type — no per-section API needed
          </p>
        </div>
        <Button onClick={() => saveMutation.mutate(sections)} disabled={saveMutation.isPending}>
          Save Changes
        </Button>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.sectionKey} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold">
                    {typeLabel(section.sectionType)}
                  </span>
                  <span className="text-slate-500">key: {section.sectionKey}</span>
                </div>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex gap-1 pt-1">
                    <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30" aria-label="Move up">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button type="button" disabled={index === sections.length - 1} onClick={() => move(index, 1)} className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30" aria-label="Move down">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 grid md:grid-cols-2 gap-3 min-w-0">
                    <Input label="Title" value={section.label || ''} onChange={(e) => updateField(index, 'label', e.target.value)} />
                    <Input label="Subtitle" value={section.subtitle || ''} onChange={(e) => updateField(index, 'subtitle', e.target.value)} />
                    <Input label="Product limit" type="number" min={1} max={50} value={section.displayLimit ?? 12} onChange={(e) => updateField(index, 'displayLimit', parseInt(e.target.value, 10) || 12)} />
                    {section.sectionType === 'PRODUCT_CAROUSEL' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Product source</label>
                          <select
                            value={section.productSource || 'trending'}
                            onChange={(e) => updateField(index, 'productSource', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3"
                          >
                            {PRODUCT_SOURCES.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {section.productSource === 'curated' && (
                          <Input label="Product IDs" value={section.productIds || ''} onChange={(e) => updateField(index, 'productIds', e.target.value)} placeholder="1, 2, 3" />
                        )}
                        <Input label="View all link" value={section.viewAllLink || ''} onChange={(e) => updateField(index, 'viewAllLink', e.target.value)} placeholder="/search?sort=best_selling" />
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleVisible(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold shrink-0 ${section.visible !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}
                  >
                    {section.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {section.visible !== false ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
