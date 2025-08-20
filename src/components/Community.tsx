import React, { useEffect, useMemo, useState } from 'react';
import './Community.css';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

type Announcement = {
  id: number;
  title: string;
  body: string;
  group_name: string | null;
  created_by: string;
  created_at: string;
  is_unread?: boolean;
};

type Channel = {
  id: number;
  name: string;
  group_name: string | null;
  created_by: string;
  created_at: string;
  unread_count?: number;
};

type Message = {
  id: number;
  channel_id: number;
  user_id: string;
  content: string;
  created_at: string;
};

const Community: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || null;
  const userEmail = currentUser?.email || null;

  const [activeTab, setActiveTab] = useState<'announcements' | 'chat'>('announcements');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnBody, setNewAnnBody] = useState('');

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

  const selectedChannel = useMemo(
    () => channels.find(c => c.id === selectedChannelId) || null,
    [channels, selectedChannelId]
  );

  useEffect(() => {
    if (activeTab === 'announcements') {
      void fetchAnnouncements();
      void checkIsAdmin();
    } else {
      void fetchChannels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userId, userEmail]);

  useEffect(() => {
    if (activeTab === 'chat' && selectedChannelId) {
      void fetchMessages(selectedChannelId);
      void markChannelRead(selectedChannelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedChannelId, userId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ann, error: e1 } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (e1) throw e1;

      let result: Announcement[] = ann || [];
      if (userId) {
        const { data: reads, error: e2 } = await supabase
          .from('announcement_reads')
          .select('announcement_id')
          .eq('user_id', userId);
        if (e2) throw e2;
        const readSet = new Set((reads || []).map(r => r.announcement_id));
        result = result.map(a => ({ ...a, is_unread: !readSet.has(a.id) }));
      }

      setAnnouncements(result);
    } catch (e: any) {
      setError(e.message || 'Duyurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const checkIsAdmin = async () => {
    if (!userEmail) { setIsAdmin(false); return; }
    try {
      const { data, error } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', userEmail);
      if (error) throw error;
      setIsAdmin((data || []).length > 0);
    } catch {
      setIsAdmin(false);
    }
  };

  const markAnnouncementRead = async (announcementId: number) => {
    if (!userId) return;
    try {
      await supabase
        .from('announcement_reads')
        .upsert({ announcement_id: announcementId, user_id: userId, read_at: new Date().toISOString() }, { onConflict: 'announcement_id,user_id' });
      setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, is_unread: false } : a));
    } catch {
      // ignore
    }
  };

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: ch, error: e1 } = await supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: false });
      if (e1) throw e1;

      let result: Channel[] = ch || [];
      if (userId) {
        const { data: reads } = await supabase
          .from('chat_reads')
          .select('*')
          .eq('user_id', userId);
        const lastReadMap = new Map<number, string>();
        (reads || []).forEach(r => lastReadMap.set(r.channel_id, r.last_read_at));

        for (const c of result) {
          const lastRead = lastReadMap.get(c.id);
          const query = supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('channel_id', c.id);
          const { count } = lastRead
            ? await query.gt('created_at', lastRead)
            : await query;
          c.unread_count = count || 0;
        }
      }

      setChannels(result);
      if (!selectedChannelId && result.length > 0) setSelectedChannelId(result[0].id);
    } catch (e: any) {
      setError(e.message || 'Kanallar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: number) => {
    try {
      setLoading(true);
      setError(null);
      const { data: msgs, error: e1 } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      if (e1) throw e1;
      setMessages(msgs || []);
    } catch (e: any) {
      setError(e.message || 'Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userId || !selectedChannelId) return;
    const content = messageText.trim();
    if (!content) return;
    try {
      setMessageText('');
      const { error: e1 } = await supabase
        .from('chat_messages')
        .insert({ channel_id: selectedChannelId, user_id: userId, content });
      if (e1) throw e1;
      await fetchMessages(selectedChannelId);
      await markChannelRead(selectedChannelId);
      await fetchChannels();
    } catch (e: any) {
      setError(e.message || 'Mesaj gönderilemedi');
    }
  };

  const createAnnouncement = async () => {
    if (!isAdmin || !userEmail) return;
    const title = newAnnTitle.trim();
    const body = newAnnBody.trim();
    if (!title || !body) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('announcements')
        .insert({ title, body, created_by: userEmail });
      if (error) throw error;
      setNewAnnTitle('');
      setNewAnnBody('');
      await fetchAnnouncements();
    } catch (e: any) {
      setError(e.message || 'Duyuru oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const markChannelRead = async (channelId: number) => {
    if (!userId) return;
    try {
      await supabase
        .from('chat_reads')
        .upsert({ channel_id: channelId, user_id: userId, last_read_at: new Date().toISOString() }, { onConflict: 'channel_id,user_id' });
      setChannels(prev => prev.map(c => c.id === channelId ? { ...c, unread_count: 0 } : c));
    } catch {
      // ignore
    }
  };

  return (
    <div className="community-page">
      <div className="community-layout">
        <aside className="left-pane">
          <button
            className={`left-tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            Duyurular
          </button>
          <button
            className={`left-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Grup Mesajları
          </button>
        </aside>

        <main className="right-pane">
          {activeTab === 'announcements' ? (
            <div className="announcements-view">
              <div className="pane-header">
                <h2>Duyurular</h2>
              </div>
              {isAdmin && (
                <div className="announcement-compose">
                  <input
                    type="text"
                    placeholder="Başlık"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Duyuru metni..."
                    value={newAnnBody}
                    onChange={(e) => setNewAnnBody(e.target.value)}
                  />
                  <button onClick={createAnnouncement} disabled={!newAnnTitle.trim() || !newAnnBody.trim()}>
                    Duyuru Yayınla
                  </button>
                </div>
              )}
              {loading && <div className="loading">Yükleniyor...</div>}
              {error && <div className="error">{error}</div>}
              <div className="announcement-list">
                {announcements.length === 0 && !loading ? (
                  <div className="empty">Duyuru yok</div>
                ) : (
                  announcements.map(a => (
                    <div key={a.id} className="announcement-item" onClick={() => markAnnouncementRead(a.id)}>
                      <div className="item-top">
                        <h4>{a.title}</h4>
                        {a.is_unread && <span className="badge-unread">Yeni</span>}
                      </div>
                      <p className="body">{a.body}</p>
                      <div className="meta">
                        <span>{new Date(a.created_at).toLocaleString('tr-TR')}</span>
                        {a.group_name && <span className="group">{a.group_name}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="chat-view">
              <div className="pane-header">
                <h2>Grup Mesajları</h2>
              </div>
              <div className="chat-content">
                <div className="channel-list">
                  {channels.map(c => (
                    <button
                      key={c.id}
                      className={`channel-item ${selectedChannelId === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedChannelId(c.id)}
                    >
                      <span className="name">{c.name}</span>
                      {c.unread_count && c.unread_count > 0 && (
                        <span className="badge-unread">{c.unread_count}</span>
                      )}
                    </button>
                  ))}
                  {channels.length === 0 && <div className="empty">Kanal yok</div>}
                </div>

                <div className="message-panel">
                  <div className="message-header">
                    <h3>{selectedChannel?.name || 'Kanal seçin'}</h3>
                  </div>
                  <div className="message-list">
                    {loading && <div className="loading">Yükleniyor...</div>}
                    {error && <div className="error">{error}</div>}
                    {!loading && messages.length === 0 && (
                      <div className="empty">Mesaj yok</div>
                    )}
                    {messages.map(m => (
                      <div key={m.id} className={`message-item ${m.user_id === userId ? 'mine' : ''}`}>
                        <div className="bubble">
                          <div className="text">{m.content}</div>
                          <div className="time">{new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="message-input">
                    <input
                      type="text"
                      placeholder="Mesaj yazın..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                      }}
                      disabled={!selectedChannelId}
                    />
                    <button onClick={sendMessage} disabled={!selectedChannelId || !messageText.trim()}>
                      Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Community;