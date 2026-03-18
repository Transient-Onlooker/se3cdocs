import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Library, CreditCard, Link as LinkIcon, 
  History, Users, ChevronRight, Zap, Database, Calendar, 
  Globe, Loader2, Clock, Star, Lock, Key, RefreshCw, LogOut,
  Menu, X, Search
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';

// 타입 정의
interface SubPage {
  title: string;
  content: string;
  subPages: SubPage[];
}

interface Page extends SubPage {}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbx46VVeZVivPdBoaTwBBKU_-84-32fInb0cFbMI97lV_eCSL11LmPgiJMc64Z30n8xmEg/exec';
const SESSION_TIMEOUT = 3600000; // 1시간 (밀리초)

// 텍스트에서 Markdown 링크 형식을 제거하는 유틸리티
const stripMarkdown = (text: string) => {
  return text.replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/<br\s*\/?>/gi, " ");
};

// 페이지 데이터를 검색하기 좋게 평탄화하는 함수
const flattenPages = (pages: Page[], parentPath = ""): {title: string, content: string, path: string}[] => {
  let result: {title: string, content: string, path: string}[] = [];
  pages.forEach(page => {
    const currentPath = `${parentPath}/${encodeURIComponent(page.title)}`;
    result.push({ 
      title: page.title, 
      content: stripMarkdown(page.content || ""), 
      path: currentPath 
    });
    if (page.subPages) {
      result = [...result, ...flattenPages(page.subPages as Page[], currentPath)];
    }
  });
  return result;
};

// 브레드크럼 컴포넌트
const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-8 overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar">
      <Link to="/" className="hover:text-blue-400 transition-colors shrink-0">DASHBOARD</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <div key={name} className="flex items-center gap-3 shrink-0">
            <ChevronRight size={10} className="text-slate-800" />
            {isLast ? (
              <span className="text-blue-500">{decodeURIComponent(name)}</span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-400 transition-colors">
                {decodeURIComponent(name)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

// 검색 모달 컴포넌트
const SearchModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: Page[] }) => {
  const [query, setQuery] = useState('');
  const flatPages = flattenPages(data);
  
  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return flatPages
      .filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, flatPages]);

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const getContentSnippet = (content: string, q: string) => {
    const index = content.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return content.slice(0, 60) + "...";
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + 40);
    return (start > 0 ? "..." : "") + content.slice(start, end) + (end < content.length ? "..." : "");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300 relative z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <Search className="text-blue-500" size={24} />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH TITLES OR CONTENT..."
            className="flex-1 bg-transparent border-none outline-none text-white font-bold tracking-widest placeholder:text-slate-700 uppercase"
          />
          <kbd className="hidden sm:block px-3 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-500 font-black tracking-widest">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((item: {title: string, content: string, path: string}, idx: number) => (
                <Link 
                  key={idx} 
                  to={item.path} 
                  onClick={onClose}
                  className="flex flex-col p-4 md:p-5 rounded-2xl hover:bg-blue-600/10 border border-transparent hover:border-blue-500/20 transition-all group overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1 gap-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <Database size={18} className="text-slate-600 group-hover:text-blue-400 shrink-0" />
                      <span className="text-slate-200 font-bold group-hover:text-white uppercase tracking-wider truncate text-sm md:text-base">{item.title}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-800 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  <p className="text-[10px] md:text-[11px] text-slate-500 ml-7 md:ml-9 font-medium lowercase tracking-tight line-clamp-1 truncate">
                    {getContentSnippet(item.content, query)}
                  </p>
                </Link>
              ))}
            </div>
          ) : query ? (
            <div className="p-10 text-center space-y-4">
              <div className="text-slate-600 font-black tracking-[0.3em] uppercase">No matches found</div>
              <p className="text-slate-800 text-xs uppercase tracking-widest">Deep search across all nodes completed</p>
            </div>
          ) : (
            <div className="p-10 text-center space-y-4">
              <div className="text-slate-700 font-black tracking-[0.3em] uppercase">Type to search nodes</div>
              <p className="text-slate-800 text-xs uppercase tracking-widest italic">Querying se3c_fulltext_index...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 비밀번호 입력 컴포넌트
const LoginPage = ({ onLogin }: { onLogin: (pw: string) => void }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === import.meta.env.VITE_SITE_PASSWORD) {
      onLogin(input);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-['IBM_Plex_Sans_KR']">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-[0_0_40px_rgba(37,99,235,0.3)] border border-blue-400/20">
            <Lock size={36} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">SE3C Access</h1>
          <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Operational Database Node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <Key size={20} strokeWidth={1.5} />
            </div>
            <input 
              type="password" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER CLEARANCE CODE"
              className={`w-full bg-slate-900/50 border-2 ${error ? 'border-red-500/50' : 'border-slate-800'} rounded-[2rem] py-5 pl-14 pr-6 text-white font-black tracking-[0.3em] focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 placeholder:tracking-widest text-center`}
              autoFocus
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[2rem] shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            Authenticate Node
          </button>
          {error && (
            <p className="text-center text-red-500 text-xs font-bold uppercase tracking-widest animate-bounce">Access Denied: Invalid Credentials</p>
          )}
        </form>
      </div>
    </div>
  );
};

// 대시보드 컴포넌트
const Dashboard = ({ data }: { data: Page[] }) => {
  const getSafePath = (title: string, defaultPath: string) => {
    const exists = data.some(p => p.title.toLowerCase().includes(title.toLowerCase()));
    if (exists) {
      const found = data.find(p => p.title.toLowerCase().includes(title.toLowerCase()));
      return `/${encodeURIComponent(found!.title)}`;
    }
    return defaultPath;
  };

  return (
    <div className="w-full p-4 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="mb-10 md:mb-16 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="p-2 md:p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Database className="text-blue-400" size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-white uppercase">
            SE3C <span className="text-blue-500 font-light uppercase">Operational Space</span>
          </h1>
        </div>

        <div className="p-6 md:p-10 bg-slate-900/40 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] flex gap-5 md:gap-8 items-start shadow-2xl shadow-black/60 relative overflow-hidden group font-['IBM_Plex_Sans_KR']">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Star size={20} className="md:w-[28px] md:h-[28px]" strokeWidth={1.5} />
          </div>
          <div className="space-y-3 md:space-y-4 font-['IBM_Plex_Sans_KR']">
            <h4 className="font-bold text-blue-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm flex items-center gap-2 md:gap-3">
              🎯 SE3C 핵심 목표
            </h4>
            <div className="space-y-3 md:space-y-4 text-slate-100 font-medium leading-relaxed text-lg md:text-xl">
              <p>상상하던 걸 실현해보는 실험 정신을 바탕으로, 단순한 형식을 넘어선 실제적인 결과물을 만들어냅니다.</p>
              <p className="hidden sm:block">2026년은 더 정밀한 데이터 계측과 실제적인 우주 공학 프로젝트에 집중하여, 학문적 깊이와 기술적 성장을 동시에 도모합니다.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-10 max-w-screen-3xl mx-auto mb-24 font-['IBM_Plex_Sans_KR']">
        <div className="flex items-center gap-6 px-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.5em] shrink-0">Operational Shortcuts</h3>
          <div className="h-px flex-1 bg-slate-800/50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {[
            { title: "예산관리", icon: <CreditCard />, path: getSafePath("예산관리", "/예산관리") },
            { title: "링크 모음집", icon: <LinkIcon />, path: getSafePath("링크", "/링크") },
            { title: "활동 기록", icon: <History />, path: getSafePath("활동 기록", "/활동 기록") },
            { title: "활동 계획", icon: <Calendar />, path: getSafePath("활동 계획", "/활동 계획") },
            { title: "인원 관리", icon: <Users />, path: getSafePath("인원 관리", "/인원 관리") }
          ].map((item, idx) => (
            <Link 
              key={idx} 
              to={item.path}
              className="group p-10 bg-slate-900/20 border border-slate-800/60 rounded-[2.5rem] hover:border-blue-500/40 hover:bg-slate-800/40 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center shadow-xl backdrop-blur-sm font-['IBM_Plex_Sans_KR']"
            >
              <div className="w-16 h-16 text-slate-300 group-hover:text-blue-400 transition-all mb-8 flex items-center justify-center bg-slate-800/50 rounded-3xl group-hover:rotate-6 border border-slate-700/50 group-hover:border-blue-500/30">
                {typeof item.icon === 'object' && 'type' in item.icon 
                  ? <item.icon.type {...item.icon.props} size={36} strokeWidth={1.2} /> 
                  : item.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2 uppercase tracking-widest group-hover:text-blue-400 transition-colors">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-10 max-w-screen-3xl mx-auto font-['IBM_Plex_Sans_KR']">
        <div className="flex items-center gap-6 px-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.5em] shrink-0">Main Registry</h3>
          <div className="h-px flex-1 bg-slate-800/50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-8 font-['IBM_Plex_Sans_KR']">
          {data.map((page, idx) => (
            <Link 
              key={idx} 
              to={`/${encodeURIComponent(page.title)}`}
              className="group p-10 bg-slate-900/10 border border-slate-800/80 rounded-[2.5rem] hover:border-slate-600 hover:bg-slate-900/40 transition-all duration-500 hover:-translate-y-2 shadow-2xl flex flex-col relative"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-slate-800/30 rounded-2xl flex items-center justify-center border border-slate-700/50">
                  <Library size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <Zap size={18} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter group-hover:text-blue-400 transition-colors line-clamp-1 italic">{page.title}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-3 mb-8 flex-1">
                {page.content ? stripMarkdown(page.content) : "해당 섹션의 세부 기록이 없습니다."}
              </p>
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end">
                <ChevronRight size={18} className="text-slate-700 group-hover:translate-x-1 transition-all group-hover:text-blue-500" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const PageContent = ({ data }: { data: Page[] }) => {
  const params = useParams();
  const path = params['*'] ? params['*'].split('/') : [];
  
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="animate-spin text-blue-500 mb-6" size={32} />
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] animate-pulse">Establishing Connection...</h2>
      </div>
    );
  }

  if (path.length === 0) return <Dashboard data={data} />;

  let currentContent: Page | SubPage | undefined = undefined;
  let fullPath = "";
  let currentLevel: (Page | SubPage)[] = data;
  let tempPath = "";

  for (let i = 0; i < path.length; i++) {
    const targetTitle = decodeURIComponent(path[i]);
    const found = currentLevel.find(item => item.title === targetTitle);
    if (found) {
      currentContent = found;
      tempPath += `/${encodeURIComponent(found.title)}`;
      currentLevel = found.subPages || [];
    } else {
      currentContent = undefined;
      break;
    }
  }
  fullPath = tempPath;

  if (!currentContent) return (
    <div className="p-20 flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-4xl font-black text-slate-700 mb-4 uppercase tracking-widest italic font-['IBM_Plex_Sans_KR']">404 NODE_MISSING</h2>
      <p className="text-slate-500 mb-8 font-medium font-['IBM_Plex_Sans_KR']">요청하신 페이지를 찾을 수 없습니다. 탭 이름을 확인해 주세요.</p>
      <Link to="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 font-['IBM_Plex_Sans_KR']">대시보드로 돌아가기</Link>
    </div>
  );

  const sanitizedContent = currentContent.content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/^(\s*)>/gm, "$1\\>");

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-8 md:p-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <Breadcrumbs />
      <header className="mb-20">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tighter leading-[0.9] uppercase italic font-['IBM_Plex_Sans_KR']">
          {currentContent.title}
        </h1>
        <div className="h-1.5 w-32 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </header>
      
      {currentContent.content ? (
        <article className="prose prose-slate prose-2xl dark:prose-invert max-w-none font-['IBM_Plex_Sans_KR']">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({node, ...props}) => (
                <a 
                  {...props} 
                  className="text-[#4ade80] font-black hover:text-white transition-all underline decoration-[#4ade80] decoration-2 underline-offset-4" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                />
              ),
              table: ({node, ...props}) => (
                <div className="overflow-x-auto my-16 rounded-[2rem] border border-slate-800 bg-slate-900/30 p-2 shadow-2xl backdrop-blur-sm">
                  <table {...props} className="min-w-full divide-y divide-slate-800" />
                </div>
              ),
              th: ({node, ...props}) => <th {...props} className="px-10 py-8 bg-slate-800/50 text-left text-[11px] font-bold text-white uppercase tracking-[0.3em]" />,
              td: ({node, ...props}) => <td {...props} className="px-10 py-8 text-base text-slate-200 font-medium border-t border-slate-800 whitespace-pre-wrap" />,
              p: ({node, ...props}) => <p {...props} className="mb-10 leading-relaxed text-slate-200 text-xl font-medium" />,
              img: ({node, ...props}) => (
                <div className="my-16 flex flex-col items-center">
                  <img 
                    {...props} 
                    className="rounded-[2rem] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-full hover:scale-[1.02] transition-transform duration-500" 
                  />
                  {props.alt && (
                    <span className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
                      {props.alt}
                    </span>
                  )}
                </div>
              )
            }}
          >
            {sanitizedContent}
          </ReactMarkdown>
        </article>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12 font-['IBM_Plex_Sans_KR']">
          {currentContent.subPages && currentContent.subPages.map((sub, i) => (
            <Link 
              key={i} 
              to={`${fullPath}/${encodeURIComponent(sub.title)}`}
              className="group p-12 bg-slate-900/20 border border-slate-800 rounded-[2.5rem] hover:border-blue-500/30 transition-all duration-500 hover:bg-slate-900/40 shadow-xl"
            >
              <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors uppercase tracking-tighter italic">
                {sub.title}
              </h3>
              <p className="text-slate-400 font-medium text-base line-clamp-3">
                {sub.content ? stripMarkdown(sub.content) : "세부 내용을 확인하려면 클릭하세요."}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const NavItem = ({ page, depth = 0, parentPath = "" }: { page: Page; depth?: number; parentPath?: string }) => {
  const currentPath = `${parentPath}/${encodeURIComponent(page.title)}`;
  const location = useLocation();
  const isActive = decodeURIComponent(location.pathname) === currentPath;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-1 font-['IBM_Plex_Sans_KR']">
      <div className={`flex items-center group rounded-2xl transition-all ${isActive ? 'bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)] border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
        <Link 
          to={currentPath} 
          className={`flex-1 flex items-center gap-4 py-3.5 pr-3 font-bold text-[13px] tracking-widest transition-all ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
          style={{ paddingLeft: `${(depth * 1.5) + 1.5}rem` }}
        >
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-blue-400 scale-150 shadow-[0_0_12px_rgba(96,165,250,0.8)]' : 'bg-slate-700'}`} />
          <span className="truncate uppercase">{page.title}</span>
        </Link>
        {page.subPages && page.subPages.length > 0 && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
            className={`p-3 mr-1 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          >
            <ChevronRight size={16} className={isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'} />
          </button>
        )}
      </div>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        {page.subPages && page.subPages.length > 0 && (
          <div>
            {page.subPages.map((sub, idx) => (
              <NavItem key={idx} page={sub as Page} depth={depth + 1} parentPath={currentPath} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [data, setData] = useState<Page[]>([]);
  const [time, setTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isDashboardActive = location.pathname === '/';

  // 페이지 이동 시 사이드바 닫기 (모바일용)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // 검색 단축키 (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = useCallback(async (force = false) => {
    setIsSyncing(true);
    try {
      const url = force ? `${GAS_URL}?t=${Date.now()}` : '/data.json';
      const res = await fetch(url);
      const json = await res.json();
      if (Array.isArray(json)) setData(json);
    } catch (err) {
      console.error("Data load failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('se3c_auth');
    localStorage.removeItem('se3c_auth_time');
  }, []);

  useEffect(() => {
    const authStatus = localStorage.getItem('se3c_auth') === 'true';
    const authTime = parseInt(localStorage.getItem('se3c_auth_time') || '0', 10);
    const now = Date.now();

    if (authStatus && (now - authTime < SESSION_TIMEOUT)) {
      setIsAuthenticated(true);
      localStorage.setItem('se3c_auth_time', now.toString());
    } else {
      handleLogout();
    }

    fetchData();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchData, handleLogout]);

  const handleLogin = (pw: string) => {
    if (pw === 'se3cboin') {
      const now = Date.now();
      setIsAuthenticated(true);
      localStorage.setItem('se3c_auth', 'true');
      localStorage.setItem('se3c_auth_time', now.toString());
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-white overflow-hidden font-['IBM_Plex_Sans_KR'] uppercase">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#080808] border-r border-slate-900 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-96 shrink-0 shadow-2xl font-['IBM_Plex_Sans_KR'] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-14 mb-4 relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-10 right-8 p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <Link to="/" className="flex flex-col gap-1 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:rotate-12 transition-all duration-500 border border-blue-400/20">
                <Database size={24} strokeWidth={2} />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white uppercase leading-none">
                SE3C
              </span>
            </div>
            <span className="text-[11px] font-black tracking-[0.5em] text-slate-500 uppercase ml-16 group-hover:text-blue-400 transition-colors">
              Database
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-8 pb-16 space-y-12 custom-scrollbar">
          <div>
            <Link 
              to="/" 
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group font-bold text-[12px] uppercase tracking-[0.3em] border ${
                isDashboardActive ? 'bg-blue-500/10 text-white border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-900 hover:border-slate-800'
              }`}
            >
              <LayoutDashboard size={20} strokeWidth={1.5} className={isDashboardActive ? 'text-blue-400' : 'group-hover:text-blue-400'} /> 
              <span>Operational Dashboard</span>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="px-6 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Registry Archive</span>
              <Library size={14} className="text-slate-800" />
            </div>
            <div className="space-y-2 px-2">
              {data.map((page, idx) => (
                <NavItem key={idx} page={page} />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-10 border-t border-slate-900/50 space-y-4 font-['IBM_Plex_Sans_KR']">
          <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-500 bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/10 uppercase tracking-[0.2em] shadow-inner">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            Sync Node Active
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-95 group uppercase tracking-widest"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Disconnect Node
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505] font-['IBM_Plex_Sans_KR']">
        <header className="h-20 border-b border-slate-900/50 flex items-center justify-between px-6 md:px-16 bg-[#050505]/80 backdrop-blur-2xl z-30 shrink-0">
          <div className="flex items-center gap-4 md:gap-5 text-[11px] font-bold text-slate-600 uppercase tracking-[0.5em]">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-5">
              <Globe size={16} /> Operation Terminal v2.4
            </div>
            <div className="sm:hidden font-black text-blue-500 tracking-tighter text-lg">SE3C</div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-95 group"
              title="Search (Ctrl+K)"
            >
              <Search size={14} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline tracking-widest uppercase">Search</span>
            </button>
            <div className="h-6 w-px bg-slate-800/50 hidden sm:block" />
            <button 
              onClick={() => fetchData(true)}
              disabled={isSyncing}
              className="flex items-center gap-3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:border-blue-500/50 transition-all active:scale-95 disabled:opacity-50 group"
            >
              <RefreshCw size={14} className={`${isSyncing ? 'animate-spin text-blue-500' : 'group-hover:text-blue-400'}`} />
              <span className="hidden sm:inline tracking-widest uppercase">{isSyncing ? 'SYNCING...' : 'FORCE_SYNC'}</span>
            </button>
            <div className="hidden md:block h-8 w-px bg-slate-900" />
            <div className="hidden md:flex items-center gap-4 text-3xl font-black text-slate-100 uppercase tracking-widest font-mono text-shadow-blue">
              <Clock className="text-blue-500" size={28} /> {time.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-black/20">
          <Routes>
            <Route path="/" element={<PageContent data={data} />} />
            <Route path="/*" element={<PageContent data={data} />} />
          </Routes>
        </div>
      </main>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        data={data} 
      />
    </div>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
