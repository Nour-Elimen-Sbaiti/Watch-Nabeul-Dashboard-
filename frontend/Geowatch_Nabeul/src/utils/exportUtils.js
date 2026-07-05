/**
 * Export Utilities for Geowatch Dashboard
 * Provides functions to export data as CSV, Excel, and maps as images
 */

/**
 * Convert data to CSV format and trigger download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToCSV = (data, filename = 'export') => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      let value = row[header];
      // Handle strings with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Export data as JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToJSON = (data, filename = 'export') => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Download a file
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Capture map container as image
 * @param {string} containerId - ID of the map container
 * @param {string} filename - Name of the file (without extension)
 * @param {Function} callback - Callback with the data URL
 */
export const captureMapAsImage = (containerId, filename = 'map', callback = null) => {
  // Try to find the map container
  let element = document.getElementById(containerId);
  
  // Fallback: try to find any map-related container
  if (!element) {
    element = document.querySelector('.leaflet-container')?.closest('div');
  }
  if (!element) {
    element = document.querySelector('[class*="map"]');
  }
  if (!element) {
    element = document.querySelector('[class*="Map"]');
  }
  
  if (!element) {
    console.error('Map container not found. Tried ID:', containerId);
    if (callback) callback(null);
    return;
  }

  // Dynamic import of html2canvas
  import('html2canvas').then(({ default: html2canvas }) => {
    html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
      ignoreElements: (el) => {
        // Ignore popups and controls that might interfere
        if (el.classList?.contains('leaflet-popup')) return true;
        if (el.classList?.contains('leaflet-control')) return true;
        return false;
      },
    }).then(canvas => {
      const dataURL = canvas.toDataURL('image/png');
      
      // Trigger download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (callback) callback(dataURL);
    }).catch(err => {
      console.error('Failed to capture map:', err);
      // Fallback: try to capture just the leaflet pane
      captureLeafletMap(filename, callback);
    });
  }).catch(() => {
    // If html2canvas is not installed, provide instructions
    console.warn('html2canvas not installed. Run: npm install html2canvas');
  });
};

/**
 * Fallback: Capture just the Leaflet map pane
 */
const captureLeafletMap = (filename, callback) => {
  const leafletPane = document.querySelector('.leaflet-tile-pane');
  if (!leafletPane) {
    console.error('Leaflet tile pane not found');
    if (callback) callback(null);
    return;
  }

  import('html2canvas').then(({ default: html2canvas }) => {
    html2canvas(leafletPane, {
      useCORS: true,
      backgroundColor: null,
      scale: 1,
    }).then(canvas => {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (callback) callback(dataURL);
    }).catch(err => {
      console.error('Fallback map capture failed:', err);
      if (callback) callback(null);
    });
  });
};

/**
 * Generate a printable report
 * @param {Object} reportData - Data for the report
 */
export const generatePrintableReport = (reportData) => {
  const { title, date, summary, stats, charts, customSections } = reportData;
  
  const printWindow = window.open('', '_blank');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
        h1 { color: #d97706; border-bottom: 3px solid #d97706; padding-bottom: 10px; }
        h2 { color: #78716c; margin-top: 30px; }
        .meta { color: #a8a29e; font-size: 0.9em; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e7e5e4; padding: 12px; text-align: left; }
        th { background: #f5f5f4; font-weight: 600; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .kpi-card { background: #f5f5f4; padding: 20px; border-radius: 8px; border-left: 4px solid #d97706; }
        .kpi-value { font-size: 2em; font-weight: bold; color: #d97706; }
        .kpi-label { font-size: 0.85em; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; }
        .chart-container { margin: 30px 0; page-break-inside: avoid; }
        .summary { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">Generated on: ${date || new Date().toLocaleString()}</div>
      
      ${summary ? `<div class="summary"><strong>Summary:</strong> ${summary}</div>` : ''}
      
      ${stats ? `
        <h2>Key Metrics</h2>
        <div class="kpi-grid">
          ${stats.kpis?.map(kpi => `
            <div class="kpi-card">
              <div class="kpi-value">${kpi.value}</div>
              <div class="kpi-label">${kpi.label}</div>
              ${kpi.sub ? `<div style="font-size: 0.75em; color: #a8a29e; margin-top: 4px;">${kpi.sub}</div>` : ''}
            </div>
          `).join('') || ''}
        </div>
        
        <h2>Detailed Statistics</h2>
        <table>
          <thead>
            <tr>
              ${stats.headers?.map(h => `<th>${h}</th>`).join('') || ''}
            </tr>
          </thead>
          <tbody>
            ${stats.rows?.map(row => `
              <tr>
                ${stats.headers?.map(h => `<td>${row[h]}</td>`).join('')}
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
      ` : ''}
      
      ${customSections || ''}
      
      ${charts && charts.length > 0 ? `
        <h2>Visualizations</h2>
        ${charts.map(chart => `
          <div class="chart-container">
            <h3>${chart.title}</h3>
            <img src="${chart.dataUrl}" style="width: 100%; max-height: 400px; object-fit: contain;" />
          </div>
        `).join('')}
      ` : ''}
      
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Format statistics data for export
 */
export const formatStatsForExport = (tableStats, selectedYear) => {
  if (!tableStats) return [];
  
  const yearData = tableStats[selectedYear] || {};
  const rows = [];
  
  Object.entries(yearData).forEach(([className, data]) => {
    rows.push({
      'Land Use Class': className.replace(/_/g, ' '),
      'Area (km²)': data.area?.toFixed(2) || '0.00',
      'Percentage': `${(data.percentage || 0).toFixed(2)}%`,
      'Year': selectedYear
    });
  });
  
  return rows;
};

/**
 * Format change detection data for export
 */
export const formatChangeForExport = (tableStats) => {
  if (!tableStats?.['2020'] || !tableStats?.['2025']) return [];
  
  const rows = [];
  const allClasses = new Set([
    ...Object.keys(tableStats['2020']),
    ...Object.keys(tableStats['2025'])
  ]);
  
  allClasses.forEach(className => {
    const data2020 = tableStats['2020'][className] || { area: 0, percentage: 0 };
    const data2025 = tableStats['2025'][className] || { area: 0, percentage: 0 };
    const areaChange = (data2025.area || 0) - (data2020.area || 0);
    const pctChange = data2020.area > 0 
      ? ((areaChange / data2020.area) * 100).toFixed(2) 
      : '0.00';
    
    rows.push({
      'Land Use Class': className.replace(/_/g, ' '),
      'Area 2020 (km²)': data2020.area?.toFixed(2) || '0.00',
      'Percentage 2020': `${(data2020.percentage || 0).toFixed(2)}%`,
      'Area 2025 (km²)': data2025.area?.toFixed(2) || '0.00',
      'Percentage 2025': `${(data2025.percentage || 0).toFixed(2)}%`,
      'Area Change (km²)': areaChange.toFixed(2),
      'Percentage Change': `${pctChange > 0 ? '+' : ''}${pctChange}%`
    });
  });
  
  return rows;
};

export default {
  exportToCSV,
  exportToJSON,
  captureMapAsImage,
  generatePrintableReport,
  formatStatsForExport,
  formatChangeForExport
};