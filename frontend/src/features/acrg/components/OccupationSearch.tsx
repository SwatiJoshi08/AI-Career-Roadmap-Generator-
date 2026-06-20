import React, { useState, useEffect } from 'react';
import { Search, Briefcase, GraduationCap } from 'lucide-react';
import { apiClient } from '../../../lib/http/apiClient';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';

interface Occupation {
  occupationCode: string;
  title: string;
  description: string;
  jobZone: number;
  education: string;
}

interface OccupationSearchProps {
  onSelect: (occupation: {
    occupationCode: string;
    title: string;
    description: string;
  }) => void;
  placeholder?: string;
}

type SearchType = 'title' | 'skill' | 'keyword';

export const OccupationSearch: React.FC<OccupationSearchProps> = ({
  onSelect,
  placeholder = 'Search by job title, skill, or keyword...',
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [results, setResults] = useState<Occupation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const fetchOccupations = async (searchVal: string, type: SearchType) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (type === 'skill') {
        params.skill = searchVal;
      } else {
        // Title or Keyword maps to text search query `q`
        params.q = searchVal;
      }

      const response = await apiClient.get('/onet/search', {
        params,
        withCredentials: true,
      });

      const occupations = response.data?.data || [];
      setResults(occupations);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch occupations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupations(debouncedQuery, searchType);
  }, [debouncedQuery, searchType]);

  const handleRetry = () => {
    fetchOccupations(debouncedQuery, searchType);
  };

  return (
    <div className="space-y-4 border border-gray-100 bg-gray-50/50 p-4 rounded-xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-1/3">
          <label className="text-sm font-medium text-gray-700 block mb-1">Search By</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="title">Occupation Title</option>
            <option value="skill">Skill</option>
            <option value="keyword">Keyword / Description</option>
          </select>
        </div>
        <div className="flex-1">
          <Input
            label="Search Query"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {loading && (
        <div className="space-y-2 mt-2">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-2">
          <ErrorAlert message={error} onRetry={handleRetry} />
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="mt-2">
          <EmptyState
            icon={<Search className="w-8 h-8" />}
            title="No occupations found"
            description="Try adjusting your filters or query."
          />
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white divide-y divide-gray-100 shadow-inner mt-2">
          {results.map((occupation) => (
            <button
              key={occupation.occupationCode}
              type="button"
              onClick={() => onSelect(occupation)}
              className="w-full text-left p-4 hover:bg-blue-50/50 transition-colors flex flex-col gap-2 focus:outline-none focus:bg-blue-50/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                  {occupation.title}
                </span>
                <div className="flex items-center gap-2">
                  <Badge status="draft" label={occupation.occupationCode} className="bg-gray-100 text-gray-600 text-[10px]" />
                  <Badge
                    status="processing"
                    label={`Zone ${occupation.jobZone}`}
                    className="bg-blue-50 text-blue-700 text-[10px]"
                  />
                </div>
              </div>

              {occupation.description && (
                <p className="text-xs text-gray-500 line-clamp-2 overflow-hidden text-ellipsis leading-relaxed">
                  {occupation.description}
                </p>
              )}

              {occupation.education && (
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Education: {occupation.education}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
