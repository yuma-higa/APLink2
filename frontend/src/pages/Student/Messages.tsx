import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Container, Typography, List, ListItemButton, ListItemText, Divider, TextField, Button, Paper, Avatar, ListItemAvatar, Badge } from '@mui/material';
import Header from '../../layouts/Header';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';
import { useLocation } from 'react-router-dom';

const Messages: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const userName = user || 'student';
  const userRole = getUserRole() || 'STUDENT';

  const [threads, setThreads] = useState<any[]>([]); // grouped by company when no companyId param
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation();
  const preselectCompanyId = useMemo(() => new URLSearchParams(location.search).get('companyId'), [location.search]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadThreads = async () => {
    const data = await studentApi.getMessages();
    setThreads(data);
  };

  const loadCompanyMessages = async (companyId: string) => {
    const data = await studentApi.getMessages(companyId);
    // Ensure chronological order just in case
    const sorted = [...data].sort((a: any, b: any) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    setMessages(sorted);
    await studentApi.markMessagesAsRead(companyId);
  };

  useEffect(() => { loadThreads(); }, []);

  // If query param is present, auto-select the thread after threads load
  useEffect(() => {
    if (threads.length && preselectCompanyId) {
      handleSelect(preselectCompanyId);
    }
  }, [threads, preselectCompanyId]);

  const handleSelect = async (companyId: string) => {
    setSelectedCompany(companyId);
    await loadCompanyMessages(companyId);
  };

  const handleSend = async () => {
    if (!selectedCompany || !newMessage.trim()) return;
    await studentApi.sendMessage({ companyId: selectedCompany, content: newMessage });
    setNewMessage('');
    await loadCompanyMessages(selectedCompany);
  };

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, selectedCompany]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userName} userRole={userRole} />
      <Container sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Messages</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 2 }}>
          {/* Threads */}
          <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
            <List>
              {threads.map((t: any) => (
                <React.Fragment key={t.company.id}>
                  <ListItemButton selected={selectedCompany === t.company.id} onClick={() => handleSelect(t.company.id)} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={t.company.logoUrl}>{t.company.name?.[0]?.toUpperCase() || 'C'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{t.company.name}</Typography>
                          {t.unreadCount > 0 && <Badge color="error" badgeContent={t.unreadCount} />}
                        </Box>
                      }
                      secondary={<Typography variant="body2" color="text.secondary" noWrap>{t.lastMessage?.content || ''}</Typography>}
                    />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Conversation */}
          <Paper sx={{ p: 2, maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'auto' }} ref={scrollRef}>
              {messages.map((m: any) => {
                const isMine = m.sender === 'STUDENT';
                return (
                  <Box key={m.id} sx={{ mb: 1.5, display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <Paper variant="outlined" sx={{ p: 1.2, maxWidth: '75%', bgcolor: isMine ? 'primary.main' : 'background.paper', color: isMine ? 'primary.contrastText' : 'text.primary' }}>
                      <Typography variant="body2">{m.content}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>{new Date(m.sentAt).toLocaleString()}</Typography>
                    </Paper>
                  </Box>
                );
              })}
              {selectedCompany && messages.length === 0 && (
                <Typography variant="body2" color="text.secondary">No messages yet. Say hello!</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField fullWidth size="small" placeholder={selectedCompany ? 'Type a message...' : 'Select a conversation'} value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} disabled={!selectedCompany} />
              <Button variant="contained" onClick={handleSend} disabled={!newMessage.trim() || !selectedCompany}>Send</Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Messages;
