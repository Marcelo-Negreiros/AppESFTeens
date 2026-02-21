
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Post, ContentType, Lesson, MediaAsset } from './types';
import { INITIAL_USERS, INITIAL_POSTS, INITIAL_LESSONS } from './constants';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import LiveSession from './components/LiveSession';
import EducationSection from './components/EducationSection';
import Auth from './components/Auth';
import { generateFinancialTip, moderateComment } from './services/geminiService';
import { Plus, BookOpen, LayoutGrid, LogOut, Moon, Camera, GraduationCap, Search, ExternalLink, Database } from 'lucide-react';

const IS_DEV = false; // Set to true only during development

const dbRequest = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('ESFFinancasDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

interface TipState {
  text: string;
  sources: { title: string; uri: string }[];
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('esf_teens_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch (e) { return INITIAL_USERS; }
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('esf_teens_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch (e) { return INITIAL_POSTS; }
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem('esf_teens_lessons');
      return saved ? JSON.parse(saved) : INITIAL_LESSONS;
    } catch (e) { return INITIAL_LESSONS; }
  });

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem('esf_teens_media_meta');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('esf_teens_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('esf_teens_darkmode') === 'true';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [dailyTip, setDailyTip] = useState<TipState>({ text: 'Buscando sabedoria...', sources: [] });
  const [view, setView] = useState<'feed' | 'education'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [eduTab, setEduTab] = useState<'library' | 'podcasts' | 'videos' | 'create'>('library');

  const safeSave = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (IS_DEV) console.warn(`Erro ao salvar ${key}. Limite do LocalStorage pode estar próximo.`);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('esf_teens_darkmode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => safeSave('esf_teens_users', users), [users, safeSave]);
  useEffect(() => safeSave('esf_teens_posts', posts), [posts, safeSave]);
  useEffect(() => safeSave('esf_teens_lessons', lessons), [lessons, safeSave]);
  useEffect(() => safeSave('esf_teens_media_meta', mediaAssets), [mediaAssets, safeSave]);
  useEffect(() => safeSave('esf_teens_session', currentUser), [currentUser, safeSave]);

  useEffect(() => {
    let mounted = true;
    generateFinancialTip().then(tip => {
      if (mounted && tip) setDailyTip(tip);
    });
    return () => { mounted = false; };
  }, []);

  const handleLike = useCallback((postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const liked = post.likes.includes(currentUser.id);
        return {
          ...post,
          likes: liked ? post.likes.filter(id => id !== currentUser.id) : [...post.likes, currentUser.id]
        };
      }
      return post;
    }));
  }, [currentUser]);

  const handleComment = useCallback(async (postId: string, text: string) => {
    if (!currentUser) return;
    const moderation = await moderateComment(text);
    if (!moderation.safe) { alert(`Comentário moderado: ${moderation.reason}`); return; }
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, { 
            id: Math.random().toString(36).substr(2, 9), 
            userId: currentUser.id, 
            userName: currentUser.name, 
            text, 
            timestamp: Date.now() 
          }]
        };
      }
      return post;
    }));
  }, [currentUser]);

  const handlePostFeed = useCallback((data: any) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: data.type,
      content: data.content,
      description: data.description,
      title: data.title,
      likes: [],
      comments: [],
      views: 0,
      timestamp: Date.now()
    };
    setPosts(prev => [newPost, ...prev]);
  }, [currentUser]);

  const handleUpdateLesson = useCallback((lesson: Lesson) => {
    if (currentUser?.role !== 'admin') {
      alert("Apenas administradores podem gerenciar a estrutura fixa de aulas.");
      return;
    }
    setLessons(prev => {
      const exists = prev.find(l => l.id === lesson.id);
      if (exists) {
        return prev.map(l => l.id === lesson.id ? lesson : l);
      }
      return [lesson, ...prev];
    });
    setEduTab('library');
    setView('education');
    setIsModalOpen(false);
    setEditingLesson(undefined);
  }, [currentUser]);

  const handleDeleteLesson = useCallback((id: string) => {
    if (currentUser?.role !== 'admin') {
      alert("Acesso negado: Apenas administradores podem excluir aulas fixas.");
      return;
    }
    if (confirm("Deseja excluir esta aula permanentemente da biblioteca fixa? Esta ação não pode ser desfeita.")) {
      setLessons(prev => prev.filter(l => l.id !== id));
    }
  }, [currentUser]);

  const handleAddMedia = useCallback(async (asset: MediaAsset) => {
    try {
      const db = await dbRequest();
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');
      await new Promise((res, rej) => {
        const req = store.put(asset);
        req.onsuccess = res;
        req.onerror = rej;
      });
      setMediaAssets(prev => [asset, ...prev]);
    } catch (e) {
      alert("Falha crítica ao salvar arquivo no banco de dados local.");
    }
  }, []);

  const handleDeleteMedia = useCallback(async (id: string) => {
    if (confirm("Excluir este arquivo da biblioteca?")) {
      try {
        const db = await dbRequest();
        const tx = db.transaction('media', 'readwrite');
        tx.objectStore('media').delete(id);
        setMediaAssets(prev => prev.filter(a => a.id !== id));
      } catch (e) {}
    }
  }, []);

  const handleCompleteTest = useCallback((lessonId: string, score: number, responses: Record<number, number>) => {
    if (!currentUser) return;
    const updatedUser: User = { 
      ...currentUser, 
      completedTests: { ...(currentUser.completedTests || {}), [lessonId]: { score, responses } } 
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const celebrationPost: Post = {
        id: `celebration-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type: 'article',
        title: `CONQUISTA: Teste de ${lesson.title} finalizado! 🏆✨`,
        content: `Acabei de completar a avaliação teórica da aula "${lesson.title}" na ESF Finanças!\n\nMinha Nota: ${score}/100 🎯\n\nParabéns por mais esse degrau rumo à sabedoria! #EducaçãoFinanceira #ESFFinanças #Sucesso`,
        description: `${currentUser.name} completou com sucesso um dos pilares teóricos da Escola de Sabedoria!`,
        likes: [],
        comments: [],
        views: 0,
        timestamp: Date.now()
    };
    setPosts(prev => [celebrationPost, ...prev]);
  }, [currentUser, lessons]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return posts.filter(p => p.description.toLowerCase().includes(q) || p.userName.toLowerCase().includes(q));
  }, [posts, searchQuery]);

  if (!currentUser) return <Auth onLogin={setCurrentUser} existingUsers={users} />;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-[#fcfbf7] text-gray-900'} pb-24 transition-colors`}>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b dark:border-white/5 h-20 flex items-center px-4">
        <div className="max-w-screen-md mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div onClick={() => setIsLiveOpen(true)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#c5a059] to-red-500 p-0.5 cursor-pointer hover:scale-105 transition-transform"><div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-white"><Camera size={14} className="text-white"/></div></div>
             <h1 className="font-black text-lg tracking-tighter uppercase">ESF FINANÇAS</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                <Database size={10} /> Estrutura Fixa Ativa
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl hover:bg-[#c5a059]/10 transition-colors"><Moon size={20}/></button>
            <button onClick={() => setCurrentUser(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        {view === 'education' ? (
          <EducationSection 
            currentUser={currentUser} 
            lessons={lessons} 
            mediaAssets={mediaAssets}
            onAddLesson={handleUpdateLesson}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
            onAddMedia={handleAddMedia}
            onDeleteMedia={handleDeleteMedia}
            onEditLesson={(l) => { setEditingLesson(l); setIsModalOpen(true); }}
            onCompleteTest={handleCompleteTest}
            onCompletePractice={(id, avg, ex) => {
              const updated = { ...currentUser, completedPractices: { ...(currentUser.completedPractices || {}), [id]: { averageScore: avg, exercises: ex } } };
              setCurrentUser(updated);
              setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            }}
            onCompleteArticle={(id) => {
              const updated = { ...currentUser, completedArticles: { ...(currentUser.completedArticles || {}), [id]: true } };
              setCurrentUser(updated);
              setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            }}
            isDarkMode={isDarkMode}
            activeTab={eduTab}
            setActiveTab={(t: any) => setEduTab(t)}
            onOpenCreateModal={() => { setEditingLesson(undefined); setIsModalOpen(true); }}
          />
        ) : (
          <>
            <div className="mb-6 p-6 bg-[#4b5335] text-white rounded-[2.5rem] shadow-xl animate-in fade-in duration-500">
              <div className="flex items-center gap-2 mb-2"><BookOpen size={14} className="text-[#c5a059]"/><span className="text-[10px] font-black uppercase tracking-widest">Dica ESF</span></div>
              <p className="italic text-lg mb-2">{dailyTip.text}</p>
              {dailyTip.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                  {dailyTip.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-black/20 hover:bg-black/40 rounded text-[9px] font-bold transition-all"><ExternalLink size={10} /> {s.title}</a>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Buscar no feed..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059]/20 transition-all" /></div>
            <div className="space-y-6">{filteredPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onLike={handleLike} onComment={handleComment} />)}</div>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 h-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t dark:border-white/5 flex items-center justify-around px-10 z-40">
        <button onClick={() => setView('feed')} className={`flex flex-col items-center transition-colors ${view === 'feed' ? 'text-[#c5a059]' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid/><span className="text-[8px] font-black uppercase">Feed</span></button>
        <button onClick={() => { setEditingLesson(undefined); setIsModalOpen(true); }} className="bg-[#4b5335] text-[#c5a059] p-4 rounded-3xl shadow-2xl -translate-y-4 ring-8 ring-white dark:ring-[#0a0a0a] hover:scale-110 active:scale-95 transition-all"><Plus size={32}/></button>
        <button onClick={() => { setView('education'); setEduTab('library'); }} className={`flex flex-col items-center transition-colors ${view === 'education' ? 'text-[#c5a059]' : 'text-gray-400 hover:text-gray-600'}`}><GraduationCap/><span className="text-[8px] font-black uppercase">Aula</span></button>
      </nav>

      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} onPost={handlePostFeed} onPostLesson={handleUpdateLesson} existingLesson={editingLesson} currentUser={currentUser} />}
      {isLiveOpen && <LiveSession onClose={() => setIsLiveOpen(false)} isDarkMode={isDarkMode} />}
    </div>
  );
};

export default App;
