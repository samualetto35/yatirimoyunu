import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import type { MarketRow } from '../supabase';
import './MarketHistory.css';

const FIXED_COLUMNS: Array<keyof MarketRow> = ['yatirim_araci_kod', 'yatirim_araci', 'baz_cur'];
const WEEK_PERCENT_COLUMNS: Array<keyof MarketRow> = ['yuzde_t1','yuzde_t2','yuzde_t3','yuzde_t4','yuzde_t5','yuzde_t6','yuzde_t7','yuzde_t8','yuzde_t9'];

const MarketHistory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string>('Tümü');
  const [selectedWeek, setSelectedWeek] = useState<keyof MarketRow | ''>('');
  const [sortKey, setSortKey] = useState<keyof MarketRow>('yatirim_araci_kod');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('market')
          .select('*')
          .order('yatirim_araci_kod', { ascending: true });
        if (error) throw error;
        setRows((data || []) as MarketRow[]);
        setError('');
      } catch (e: any) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableWeeks = useMemo(() => {
    const active: Array<keyof MarketRow> = [];
    WEEK_PERCENT_COLUMNS.forEach(col => {
      if (rows.some(r => (r as any)[col] !== null && (r as any)[col] !== undefined)) {
        active.push(col);
      }
    });
    return active;
  }, [rows]);

  useEffect(() => {
    if (!selectedWeek && availableWeeks.length > 0) {
      setSelectedWeek(availableWeeks[availableWeeks.length - 1]);
    }
  }, [availableWeeks, selectedWeek]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    rows.forEach(r => { if (r.yatirim_grubu) set.add(r.yatirim_grubu); });
    return ['Tümü', ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (group !== 'Tümü') list = list.filter(r => r.yatirim_grubu === group);
    if (q) {
      list = list.filter(r =>
        r.yatirim_araci_kod.toLowerCase().includes(q) ||
        r.yatirim_araci.toLowerCase().includes(q) ||
        r.baz_cur.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return sorted;
  }, [rows, search, group, sortKey, sortDir]);

  const toggleSort = (key: keyof MarketRow) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="market-history-page">
      <div className="market-history-header">
        <h1>Geçmiş Veriler</h1>
        <div className="controls">
          <input
            className="search-input"
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="group-select" value={group} onChange={(e) => setGroup(e.target.value)}>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="week-select" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value as keyof MarketRow)}>
            {availableWeeks.map(col => (
              <option key={String(col)} value={col}>{String(col)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrapper">
        <table className="market-table">
          <thead>
            <tr>
              {FIXED_COLUMNS.map(col => (
                <th key={col as string} onClick={() => toggleSort(col)}>
                  {col}
                  {sortKey === col && <span className="sort-indicator">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </th>
              ))}
              {selectedWeek && (
                <th onClick={() => toggleSort(selectedWeek)}>
                  {String(selectedWeek)}
                  {sortKey === selectedWeek && <span className="sort-indicator">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={FIXED_COLUMNS.length + 1}>Yükleniyor...</td></tr>
            ) : (
              filtered.map((row) => {
                const showWeek = selectedWeek && (row as any)[selectedWeek] !== null && (row as any)[selectedWeek] !== undefined;
                return (
                  <tr key={row.id}>
                    <td>{row.yatirim_araci_kod}</td>
                    <td>{row.yatirim_araci}</td>
                    <td>{row.baz_cur}</td>
                    {selectedWeek && showWeek ? (
                      <td>{(row as any)[selectedWeek]}</td>
                    ) : selectedWeek ? (
                      <td>-</td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketHistory; 