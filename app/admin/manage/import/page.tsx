'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type ImportType = 'assets' | 'tags' | 'boards';

interface ImportResult {
  success: boolean;
  row: number;
  slug: string;
  title?: string;
  name?: string;
  error?: string;
  created?: boolean;
  updated?: boolean;
}

interface ImportSummary {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface ImportResponse {
  success: boolean;
  summary?: ImportSummary;
  results?: ImportResult[];
  totalResults?: number;
  error?: string;
  details?: string;
}

const importConfigs: Record<ImportType, {
  label: string;
  description: string;
  exportUrl: string;
  importUrl: string;
  columns: string;
  notes: string;
}> = {
  assets: {
    label: 'Assets',
    description: 'Import catalog entries (slides, documents, videos, etc.)',
    exportUrl: '/api/export',
    importUrl: '/api/import',
    columns: 'title,slug,description,externalUrl,videoUrl,slidesUrl,keyAssetUrl,transcriptUrl,hub,format,type,tags,publishedAt',
    notes: `<strong>Required:</strong> title, hub<br />
<strong>Optional:</strong> slug (auto-generated from title if blank)<br />
<strong>Hub values:</strong> CoE, Content, Enablement<br />
<strong>Tags format:</strong> Pipe-separated, e.g., <code style="background: #F3F4F6; padding: 2px 4px; border-radius: 3px">sales|gladly|Meeting Examples</code><br />
<strong>publishedAt:</strong> Date for ordering (YYYY-MM-DD or MM/DD/YYYY), e.g., <code style="background: #F3F4F6; padding: 2px 4px; border-radius: 3px">2024-12-15</code>`,
  },
  tags: {
    label: 'Tags',
    description: 'Import and manage tags for categorizing assets',
    exportUrl: '/api/export/tags',
    importUrl: '/api/import/tags',
    columns: 'name,slug,category,color,sortOrder,boards',
    notes: `<strong>Required:</strong> name<br />
<strong>Optional:</strong> slug (auto-generated from name if blank)<br />
<strong>Boards format:</strong> Pipe-separated board slugs, e.g., <code style="background: #F3F4F6; padding: 2px 4px; border-radius: 3px">product|competitive|sales</code>`,
  },
  boards: {
    label: 'Boards',
    description: 'Import and manage boards for organizing content',
    exportUrl: '/api/export/boards',
    importUrl: '/api/import/boards',
    columns: 'name,slug,icon,color,lightColor,accentColor,sortOrder,tags',
    notes: `<strong>Required:</strong> name<br />
<strong>Optional:</strong> slug (auto-generated from name if blank)<br />
<strong>Colors:</strong> Hex values like #8C69F0<br />
<strong>Tags format:</strong> Pipe-separated tag slugs, e.g., <code style="background: #F3F4F6; padding: 2px 4px; border-radius: 3px">zendesk|sidekick|ai</code>`,
  },
};

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportType>('assets');
  const [file, setFile] = useState<File | null>(null);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update' | 'create'>('update');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = importConfigs[activeTab];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setResults(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(config.exportUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setProgress(10);

    // Create abort controller with 5 minute timeout for large imports
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skipDuplicates', (duplicateAction === 'skip').toString());
      formData.append('updateDuplicates', (duplicateAction === 'update').toString());

      setProgress(30);

      // Animate progress while waiting
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 85));
      }, 1000);

      const response = await fetch(config.importUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      setProgress(90);

      const data: ImportResponse = await response.json();

      setProgress(100);
      setResults(data);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setResults({
          success: false,
          error: 'Import timed out',
          details: 'The import took too long. Try importing smaller batches of data.',
        });
      } else {
        setResults({
          success: false,
          error: 'Failed to import',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      setIsImporting(false);
    }
  };

  const downloadResults = () => {
    if (!results?.results) return;

    const csv = [
      ['Row', 'Slug', 'Name/Title', 'Status', 'Error'].join(','),
      ...results.results.map(r => [
        r.row,
        `"${r.slug}"`,
        `"${r.title || r.name || ''}"`,
        r.created ? 'Created' : r.updated ? 'Updated' : r.error ? 'Error' : 'Skipped',
        `"${r.error || ''}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-import-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTabChange = (tab: ImportType) => {
    setActiveTab(tab);
    setFile(null);
    setResults(null);
    setProgress(0);
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
      {/* Header */}
      <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
        <Link
          href="/admin/manage"
          className="flex items-center"
          style={{
            gap: '8px',
            padding: '8px 14px',
            color: '#4B5563',
            textDecoration: 'none',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Import / Export
          </h1>
          <p style={{ fontSize: '14px', color: '#4B5563' }}>
            Bulk import and export assets, tags, and boards via CSV.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(Object.keys(importConfigs) as ImportType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              background: activeTab === tab ? '#8C69F0' : '#F3F4F6',
              color: activeTab === tab ? 'white' : '#4B5563',
              transition: 'all 0.2s ease',
            }}
          >
            {importConfigs[tab].label}
          </button>
        ))}
      </div>

      {/* Export Section */}
      <div
        style={{
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
            Export Current {config.label}
          </h3>
          <p style={{ fontSize: '13px', color: '#4B5563' }}>
            Download all {activeTab} as a CSV file to edit and re-import.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#10B981',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.7 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isExporting ? 'Exporting...' : `Export ${config.label}`}
        </button>
      </div>

      {/* CSV Format Info */}
      <div
        style={{
          background: '#EEF2FF',
          border: '1px solid #C7D2FE',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4338CA', marginBottom: '12px' }}>
          CSV Format for {config.label}
        </h3>
        <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '12px' }}>
          {config.description}
        </p>
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            padding: '12px 16px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#374151',
            overflowX: 'auto',
          }}
        >
          {config.columns}
        </div>
        <div
          style={{ marginTop: '12px', fontSize: '12px', color: '#6B7280' }}
          dangerouslySetInnerHTML={{ __html: config.notes }}
        />
      </div>

      {/* Upload Area */}
      {!results && (
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              border: '2px dashed #E5E7EB',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: file ? '#F0FDF4' : '#FAFAFA',
              borderColor: file ? '#10B981' : '#E5E7EB',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {file ? (
              <>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    background: '#D1FAE5',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '24px',
                  }}
                >
                  ✓
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  {(file.size / 1024).toFixed(1)} KB • Click to change
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    background: '#F3F4F6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                  Drop your {config.label.toLowerCase()} CSV file here
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  or click to browse
                </div>
              </>
            )}
          </div>

          {/* Options */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
              When a {activeTab === 'assets' ? 'asset' : activeTab.slice(0, -1)} already exists (matching slug):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="flex items-center" style={{ gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="duplicateAction"
                  checked={duplicateAction === 'update'}
                  onChange={() => setDuplicateAction('update')}
                  style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  <strong>Update existing</strong> - Replace all fields with CSV values
                </span>
              </label>
              <label className="flex items-center" style={{ gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="duplicateAction"
                  checked={duplicateAction === 'skip'}
                  onChange={() => setDuplicateAction('skip')}
                  style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  <strong>Skip</strong> - Keep existing unchanged
                </span>
              </label>
              <label className="flex items-center" style={{ gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="duplicateAction"
                  checked={duplicateAction === 'create'}
                  onChange={() => setDuplicateAction('create')}
                  style={{ width: '18px', height: '18px', accentColor: '#8C69F0' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  <strong>Create new</strong> - Add with modified slug (e.g., my-item-1)
                </span>
              </label>
            </div>
          </div>

          {/* Import Button */}
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={handleImport}
              disabled={!file || isImporting}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: file && !isImporting ? '#8C69F0' : '#E5E7EB',
                border: 'none',
                borderRadius: '8px',
                color: file && !isImporting ? 'white' : '#9CA3AF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: file && !isImporting ? 'pointer' : 'not-allowed',
              }}
            >
              {isImporting ? 'Importing...' : `Import ${config.label}`}
            </button>
          </div>

          {/* Progress */}
          {isImporting && (
            <div style={{ marginTop: '20px' }}>
              <div
                style={{
                  height: '8px',
                  background: '#F3F4F6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: '#8C69F0',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px', textAlign: 'center' }}>
                {progress < 50 ? 'Uploading and parsing file...' :
                 progress < 85 ? 'Importing records... This may take a minute for large files.' :
                 'Finalizing import...'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Results Header */}
          <div
            style={{
              padding: '20px 24px',
              background: results.success ? '#F0FDF4' : '#FEF2F2',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: results.success ? '#047857' : '#B91C1C',
                    marginBottom: '8px',
                  }}
                >
                  {results.success ? 'Import Complete!' : 'Import Failed'}
                </h3>
                {results.summary && (
                  <div className="flex" style={{ gap: '20px', fontSize: '14px', color: '#4B5563' }}>
                    <span><strong>{results.summary.created}</strong> created</span>
                    <span><strong>{results.summary.updated}</strong> updated</span>
                    <span><strong>{results.summary.skipped}</strong> skipped</span>
                    <span><strong>{results.summary.errors}</strong> errors</span>
                  </div>
                )}
                {results.error && (
                  <p style={{ fontSize: '14px', color: '#B91C1C' }}>
                    {results.error}: {results.details}
                  </p>
                )}
              </div>
              <div className="flex" style={{ gap: '12px' }}>
                {results.results && (
                  <button
                    onClick={downloadResults}
                    style={{
                      padding: '10px 16px',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#4B5563',
                      cursor: 'pointer',
                    }}
                  >
                    Download Results
                  </button>
                )}
                <button
                  onClick={() => {
                    setResults(null);
                    setFile(null);
                    setProgress(0);
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#8C69F0',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Import Another
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {results.results && results.results.length > 0 && (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                      Row
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                      {activeTab === 'assets' ? 'Title' : 'Name'}
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.slice(0, 50).map((result, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>
                        {result.row}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827' }}>
                        {result.title || result.name || '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: result.created
                              ? '#D1FAE5'
                              : result.updated
                              ? '#DBEAFE'
                              : result.error && result.success
                              ? '#FEF3C7'
                              : '#FEE2E2',
                            color: result.created
                              ? '#047857'
                              : result.updated
                              ? '#1D4ED8'
                              : result.error && result.success
                              ? '#B45309'
                              : '#B91C1C',
                          }}
                        >
                          {result.created
                            ? 'Created'
                            : result.updated
                            ? 'Updated'
                            : result.error && result.success
                            ? 'Skipped'
                            : 'Error'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#9CA3AF' }}>
                        {result.error || result.slug}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(results.results.length > 50 || (results.totalResults && results.totalResults > results.results.length)) && (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
                  Showing {Math.min(50, results.results.length)} of {results.totalResults || results.results.length} results.
                  {results.summary && results.summary.errors > 0 && ' Errors are shown first.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* View Library Link */}
      {results?.success && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href={activeTab === 'assets' ? '/admin/manage' : `/admin/manage/${activeTab}`}
            style={{
              fontSize: '14px',
              color: '#8C69F0',
              textDecoration: 'none',
            }}
          >
            View imported {activeTab} in {activeTab === 'assets' ? 'Asset Manager' : `${config.label} Manager`} →
          </Link>
        </div>
      )}
    </div>
  );
}
