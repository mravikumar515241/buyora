import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketingService } from '../../../services/marketingService';
import { Card } from '../../ui/Card';

export function AuditLogPanel() {
  const [page, setPage] = useState(0);
  const size = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-marketing-audit', page],
    queryFn: () => marketingService.getAuditLogs({ page, size }),
  });

  const logs = data?.content ?? (Array.isArray(data) ? data : []);
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Audit Log</h2>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <p className="text-slate-500">No audit entries yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Entity</th>
                  <th className="py-2 pr-4">By</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="py-3 pr-4">{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                    <td className="py-3 pr-4">{log.performedByEmail || '—'}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded border disabled:opacity-40">Prev</button>
              <span className="px-3 py-1 text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
