"use client";
import useSWR from "swr";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Trash2, Link as LinkIcon, ExternalLink, Copy, Check, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Define the Link type
type Link = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

// --- Confirmation Modal Component ---
// Note: Props are passed directly instead of destructured inside to avoid linting warnings
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, linkCode }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, linkCode: string | null }) => {
  if (!isOpen || !linkCode) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform scale-100 transition-transform duration-300 ease-out">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          Confirm Deletion
        </h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the short link: <code className="font-mono bg-gray-100 p-1 rounded text-sm text-blue-600">{linkCode}</code>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 shadow-md hover:shadow-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
export default function App() {
  const { data, mutate, error } = useSWR<Link[]>("/api/links", fetcher);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pagination & Search States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 10;

  // Utility function to copy link to clipboard
  const copyToClipboard = useCallback((text: string, linkCode: string) => {
    try {
      // Use document.execCommand('copy') for better compatibility in iframe environments
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      setCopiedCode(linkCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  const resetMessage = () => {
    setTimeout(() => setMsg(null), 3000);
  };

  // --- Filtered and Paginated Links Logic ---
  const filteredLinks = useMemo(() => {
    if (!data) return [];
    
    // Convert search query to lowercase for case-insensitive matching
    const query = searchQuery.toLowerCase();

    // Filter by code, target URL, or clicks (if numeric search)
    return data
      .filter(link => 
        link.code.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        (Number.isInteger(parseInt(query)) && link.clicks === parseInt(query))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first
  }, [data, searchQuery]);

  // Calculate pagination details
  const totalPages = Math.ceil(filteredLinks.length / linksPerPage);
  const startIndex = (currentPage - 1) * linksPerPage;
  const currentLinks = filteredLinks.slice(startIndex, startIndex + linksPerPage);

  // Handle page changes
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  // --- API Handlers ---

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code: code || undefined })
      });
      const body = await res.json();

      if (!res.ok) {
        setMsg(body.error || "Creation failed. Please try a different code or URL.");
      } else {
        setUrl("");
        setCode("");
        setMsg(`Success! Short link: /${body.code}`);
        mutate();
      }
    } catch (error) {
      setMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
      resetMessage();
    }
  }

  const handleDeleteClick = (code: string) => {
    setLinkToDelete(code);
    setIsModalOpen(true);
  };

  async function delLinkConfirmed() {
    if (!linkToDelete) return;

    setIsModalOpen(false); // Close the modal immediately
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/links/${linkToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setMsg(`Link '/${linkToDelete}' deleted successfully.`);
        mutate();
      } else {
        const body = await res.json();
        setMsg(body.error || `Failed to delete link: ${linkToDelete}`);
      }
    } catch (e) {
      setMsg("An error occurred during deletion.");
    } finally {
      setLinkToDelete(null);
      setLoading(false);
      resetMessage();
    }
  }

  const handleDeleteCancel = () => {
    setLinkToDelete(null);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="border-b border-blue-200 mb-6 py-4 px-2 sm:px-0">
  <h1 className="text-2xl sm:text-4xl font-extrabold text-blue-700 tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
    <LinkIcon className="w-7 h-7 sm:w-8 sm:h-8" />
    NanoLink Dashboard
  </h1>
  <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
    Manage your personalized short links.
  </p>
</header>


        {/* --- Link Creation Form --- */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-10 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Create New Short Link</h2>
          <form onSubmit={createLink} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-3">
              <label htmlFor="url" className="text-sm font-medium text-gray-600 block mb-1">Target URL (Required)</label>
              <input
                id="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                type="url"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-600 block mb-1">Custom Code (Optional)</label>
              <input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g., custom-name"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                type="text"
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={loading || !url}
                className={`w-full px-4 py-3 text-white rounded-xl font-semibold transition duration-300 transform shadow-md
                  ${loading || !url
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg'
                  }`}
              >
                {loading ? 'Creating...' : 'Shorten'}
              </button>
            </div>
            {msg && (
              <div className={`mt-2 md:col-span-6 text-sm p-3 rounded-xl transition duration-300 ${msg.startsWith('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {msg}
              </div>
            )}
          </form>
        </div>

        {/* --- Search Box and Links Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Your Short Links ({data ? data.length : 0})</h2>
            <div className="relative w-full sm:w-80">
                <input
                    type="text"
                    placeholder="Search by code, URL, or clicks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-inner"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
        </div>


        {/* --- Link Table --- */}
        {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg shadow-md">Failed to load links from API.</div>}
        
        {!data ? (
          <div className="text-center py-10 text-lg text-gray-500">
            <div className="animate-spin inline-block w-6 h-6 border-4 border-t-4 border-blue-500 border-opacity-25 rounded-full mr-2"></div>
            Loading Links...
          </div>
        ) : filteredLinks.length === 0 ? (
            <div className="text-center py-10 text-lg text-gray-500 border border-dashed rounded-xl bg-white shadow-md">
                {searchQuery ? `No results found for "${searchQuery}".` : "No links have been created yet."}
            </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Target URL</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Last Clicked</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentLinks.map(l => (
                  <tr key={l.id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                    
                    {/* Code Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`/${l.code}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 font-medium hover:text-blue-800 transition duration-150"
                        >
                          /{l.code}
                        </a>
                        <button 
                          onClick={() => copyToClipboard(`${window.location.origin}/${l.code}`, l.code)}
                          className="text-gray-500 hover:text-blue-600 transition duration-150 p-1 rounded-full bg-gray-100 hover:bg-blue-200"
                          title="Copy Link"
                        >
                          {copiedCode === l.code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>

                    {/* Target URL Column */}
                    <td className="px-6 py-4">
                      <a 
                        href={l.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-gray-500 text-sm hover:text-blue-600 transition duration-150 block truncate max-w-xs" 
                        title={l.url}
                      >
                        {l.url}
                        <ExternalLink className="inline-block w-3 h-3 ml-1" />
                      </a>
                    </td>
                    
                    {/* Clicks Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      {l.clicks}
                    </td>
                    
                    {/* Last Clicked Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "-"}
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteClick(l.code)} 
                        className="text-red-500 hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-100"
                        title="Delete Link"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 sm:px-6 rounded-b-2xl">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </button>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + linksPerPage, filteredLinks.length)}</span> of <span className="font-medium">{filteredLinks.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        aria-current={page === currentPage ? 'page' : undefined}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium 
                                            ${page === currentPage 
                                                ? 'z-10 bg-blue-600 border-blue-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal Render */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={delLinkConfirmed}
        onCancel={handleDeleteCancel}
        linkCode={linkToDelete}
      />
    </div>
  );
}