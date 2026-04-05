import { useState, useEffect } from 'react';
import { BarChart3, Download, Package, ArrowLeftRight, AlertTriangle, Wrench, Printer } from 'lucide-react';
import API from '../utils/api';
import { format } from 'date-fns';

function ReportSection({ title, icon: Icon, children, onExport, onPrint }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <div className="flex gap-2">
          {onPrint && (
            <button onClick={onPrint} className="btn-secondary text-sm py-1.5">
              <Printer className="w-4 h-4" /> Print
            </button>
          )}
          {onExport && (
            <button onClick={onExport} className="btn-secondary text-sm py-1.5">
              <Download className="w-4 h-4" /> CSV
            </button>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [yearlyData, setYearlyData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    Promise.all([
      API.get('/reports/inventory-summary'),
      API.get('/reports/low-stock'),
      API.get('/reports/borrow-history'),
      API.get('/reports/maintenance-history'),
      API.get('/reports/yearly-summary', { params: { year: selectedYear } }),
    ]).then(([inv, low, borrow, maint, yearly]) => {
      setInventory(inv.data);
      setLowStock(low.data);
      setBorrowHistory(borrow.data);
      setMaintenanceHistory(maint.data);
      setYearlyData(yearly.data);
    }).finally(() => setLoading(false));
  }, [selectedYear]);

  const exportCSV = (data, headers, rows, filename) => {
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handlePrint = (title, content) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { font-size: 18px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 12px; }
            th { background: #f8fafc; font-weight: 600; }
            tr:nth-child(even) { background: #f8fafc; }
            .print-date { color: #64748b; font-size: 11px; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <h1>LOOKAGE Inventory Pro — ${title}</h1>
          <p class="print-date">Generated: ${new Date().toLocaleString()}</p>
          ${content}
        </body>
      </html>
    `);
    win.print();
  };

  const conditionBadge = (c) => {
    const colors = { Good: '#10b981', Damaged: '#ef4444', Maintenance: '#f59e0b' };
    return `<span style="background:${colors[c] || '#e2e8f0'}20;color:${colors[c] || '#6b7280'};padding:2px 8px;border-radius:9999px;font-size:11px">${c}</span>`;
  };

  const statusBadge = (s) => {
    const colors = { Borrowed: '#3b82f6', Returned: '#10b981', Overdue: '#ef4444' };
    return `<span style="background:${colors[s] || '#e2e8f0'}20;color:${colors[s] || '#6b7280'};padding:2px 8px;border-radius:9999px;font-size:11px">${s}</span>`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => <div key={j} className="h-10 bg-slate-100 dark:bg-slate-700 rounded" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Inventory analytics and exports</p>
      </div>

      {/* Inventory Summary */}
      <ReportSection
        title="Inventory Summary"
        icon={Package}
        onExport={() => exportCSV(
          inventory,
          ['Name', 'Category', 'Barcode', 'Total Qty', 'Available', 'Location', 'Condition'],
          inventory.map(e => [e.name, e.category?.name, e.barcode, e.quantity, e.availableStock, e.location, e.condition]),
          'inventory-summary.csv'
        )}
        onPrint={() => handlePrint('Inventory Summary', `
          <table>
            <tr><th>Name</th><th>Category</th><th>Barcode</th><th>Total</th><th>Available</th><th>Location</th><th>Condition</th></tr>
            ${inventory.map(e => `<tr>
              <td>${e.name}</td><td>${e.category?.name || ''}</td><td>${e.barcode || ''}</td>
              <td>${e.quantity}</td><td>${e.availableStock}</td><td>${e.location}</td>
              <td>${conditionBadge(e.condition)}</td>
            </tr>`).join('')}
          </table>
        `)}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Name', 'Category', 'Total', 'Available', 'Location', 'Condition'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {inventory.map(e => (
                <tr key={e._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{e.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{e.category?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{e.quantity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={e.availableStock === 0 ? 'text-red-500 font-semibold' : e.availableStock <= e.lowStockThreshold ? 'text-amber-500 font-semibold' : 'text-emerald-600 dark:text-emerald-400'}>
                      {e.availableStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{e.location}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${e.condition === 'Good' ? 'badge-green' : e.condition === 'Damaged' ? 'badge-red' : 'badge-yellow'}`}>{e.condition}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSection>

      {/* Low Stock */}
      <ReportSection
        title={`Low Stock Alert (${lowStock.length} items)`}
        icon={AlertTriangle}
        onExport={() => exportCSV(
          lowStock,
          ['Name', 'Category', 'Available', 'Total', 'Threshold'],
          lowStock.map(e => [e.name, e.category?.name, e.availableStock, e.quantity, e.lowStockThreshold]),
          'low-stock-report.csv'
        )}
      >
        {!lowStock.length ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">All items are well-stocked!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50 dark:bg-amber-900/20">
                <tr>
                  {['Name', 'Category', 'Available', 'Total', 'Threshold', 'Location'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 dark:divide-slate-700">
                {lowStock.map(e => (
                  <tr key={e._id} className="hover:bg-amber-50/50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{e.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{e.category?.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-600 dark:text-amber-400">{e.availableStock}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{e.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{e.lowStockThreshold}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{e.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      {/* Borrow History */}
      <ReportSection
        title="Borrow History"
        icon={ArrowLeftRight}
        onExport={() => exportCSV(
          borrowHistory,
          ['Equipment', 'Borrower', 'Department', 'Qty', 'Date Borrowed', 'Expected Return', 'Actual Return', 'Status'],
          borrowHistory.map(l => [
            l.equipment?.name, l.borrowerName, l.department, l.quantityBorrowed,
            format(new Date(l.dateBorrowed), 'MMM d, yyyy'),
            format(new Date(l.expectedReturn), 'MMM d, yyyy'),
            l.actualReturn ? format(new Date(l.actualReturn), 'MMM d, yyyy') : '',
            l.status
          ]),
          'borrow-history.csv'
        )}
        onPrint={() => handlePrint('Borrow History', `
          <table>
            <tr><th>Equipment</th><th>Borrower</th><th>Dept</th><th>Qty</th><th>Borrowed</th><th>Expected Return</th><th>Status</th></tr>
            ${borrowHistory.map(l => `<tr>
              <td>${l.equipment?.name || ''}</td><td>${l.borrowerName}</td><td>${l.department}</td>
              <td>${l.quantityBorrowed}</td>
              <td>${format(new Date(l.dateBorrowed), 'MMM d, yyyy')}</td>
              <td>${format(new Date(l.expectedReturn), 'MMM d, yyyy')}</td>
              <td>${statusBadge(l.status)}</td>
            </tr>`).join('')}
          </table>
        `)}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Equipment', 'Borrower', 'Department', 'Qty', 'Date Borrowed', 'Expected Return', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {borrowHistory.slice(0, 50).map(log => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{log.equipment?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.borrowerName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{log.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{log.quantityBorrowed}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{format(new Date(log.dateBorrowed), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{format(new Date(log.expectedReturn), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${log.status === 'Returned' ? 'badge-green' : log.status === 'Overdue' ? 'badge-red' : 'badge-blue'}`}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {borrowHistory.length > 50 && <p className="text-center text-sm text-slate-500 py-3">Showing 50 of {borrowHistory.length}. Export CSV for full data.</p>}
        </div>
      </ReportSection>

      {/* Maintenance History */}
      <ReportSection
        title="Maintenance History"
        icon={Wrench}
        onExport={() => exportCSV(
          maintenanceHistory,
          ['Equipment', 'Issue', 'Priority', 'Status', 'Cost', 'Technician', 'Reported', 'Completed'],
          maintenanceHistory.map(r => [
            r.equipment?.name, r.issueDescription, r.priority, r.status,
            r.cost?.toFixed(2), r.technician,
            format(new Date(r.dateReported), 'MMM d, yyyy'),
            r.dateCompleted ? format(new Date(r.dateCompleted), 'MMM d, yyyy') : ''
          ]),
          'maintenance-history.csv'
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Equipment', 'Issue', 'Priority', 'Status', 'Cost', 'Reported'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {maintenanceHistory.map(r => (
                <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{r.equipment?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                    <span className="truncate block">{r.issueDescription}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${r.priority === 'Low' ? 'badge-green' : r.priority === 'Medium' ? 'badge-blue' : r.priority === 'High' ? 'badge-yellow' : 'badge-red'}`}>{r.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${r.status === 'Completed' ? 'badge-green' : r.status === 'In Progress' ? 'badge-blue' : r.status === 'Pending' ? 'badge-yellow' : 'badge-gray'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${r.cost?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{format(new Date(r.dateReported), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSection>

      {/* Yearly Records */}
      {yearlyData && (
        <ReportSection
          title={`Yearly Summary - ${selectedYear}`}
          icon={BarChart3}
          onExport={() => {
            const rows = yearlyData.monthlyData.map(m => [
              m.month,
              m.borrows,
              m.borrowQuantity,
              m.maintenance,
              m.maintenanceCost.toFixed(2)
            ]);
            rows.push(['TOTAL', yearlyData.totals.borrows, yearlyData.totals.borrowedItems, yearlyData.totals.maintenanceRecords, yearlyData.totals.maintenanceCost]);
            exportCSV(
              yearlyData.monthlyData,
              ['Month', 'Borrow Records', 'Items Borrowed', 'Maintenance Records', 'Maintenance Cost'],
              rows,
              `yearly-summary-${selectedYear}.csv`
            );
          }}
          onPrint={() => handlePrint(`Yearly Summary - ${selectedYear}`, `
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px;">Totals</h3>
              <table style="width: 50%;">
                <tr>
                  <th>Borrow Records</th>
                  <th>Items Borrowed</th>
                  <th>Maintenance Records</th>
                  <th>Maintenance Cost</th>
                </tr>
                <tr>
                  <td>${yearlyData.totals.borrows}</td>
                  <td>${yearlyData.totals.borrowedItems}</td>
                  <td>${yearlyData.totals.maintenanceRecords}</td>
                  <td>$${yearlyData.totals.maintenanceCost}</td>
                </tr>
              </table>
            </div>
            <h3 style="margin: 20px 0 10px 0; font-size: 14px;">Monthly Breakdown</h3>
            <table>
              <tr><th>Month</th><th>Borrows</th><th>Items</th><th>Maintenance</th><th>Cost</th></tr>
              ${yearlyData.monthlyData.map(m => `<tr>
                <td>${m.month}</td>
                <td>${m.borrows}</td>
                <td>${m.borrowQuantity}</td>
                <td>${m.maintenance}</td>
                <td>$${m.maintenanceCost.toFixed(2)}</td>
              </tr>`).join('')}
            </table>
          `)}
        >
          <div className="p-6 space-y-6">
            {/* Year Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Select Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input sm:w-48"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase mb-1">Borrow Records</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{yearlyData.totals.borrows}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase mb-1">Items Borrowed</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{yearlyData.totals.borrowedItems}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase mb-1">Maintenance</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{yearlyData.totals.maintenanceRecords}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase mb-1">Maintenance Cost</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">${yearlyData.totals.maintenanceCost}</p>
              </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Month</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Borrows</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Items</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Maintenance</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {yearlyData.monthlyData.map((month, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{month.month}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{month.borrows}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{month.borrowQuantity}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{month.maintenance}</td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-semibold">${month.maintenanceCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ReportSection>
      )}
    </div>
  );
}
