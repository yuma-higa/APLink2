import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Avatar,
  Divider,
  Badge,
  ListItemButton,
  ListItemAvatar,
  Paper,
} from '@mui/material';
import { Send, Chat } from '@mui/icons-material';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  // augmented by API
  studentId?: string;
}

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (content: string, studentId: string) => void;
  onMarkAsRead: (messageId: number) => void;
  initialStudentId?: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  onSendMessage,
  onMarkAsRead,
  initialStudentId
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  const byStudent = useMemo(() => {
    const m = new Map<string, { name: string; items: Message[] }>();
    messages.forEach(msg => {
      const sid = msg.studentId || msg.sender; // fallback by name
      const key = String(sid);
      const entry = m.get(key) || { name: msg.sender, items: [] };
      entry.items.push(msg);
      m.set(key, entry);
    });
    return Array.from(m.entries()).map(([id, v]) => ({ id, name: v.name, items: v.items.sort((a,b) => (a.timestamp > b.timestamp ? 1 : -1)) }));
  }, [messages]);

  // Auto-select first thread
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    } else if (!selectedStudentId && byStudent.length) {
      setSelectedStudentId(byStudent[0].id);
    }
  }, [byStudent, selectedStudentId, initialStudentId]);

  const active = byStudent.find(t => t.id === selectedStudentId);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [active?.items.length]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      if (!selectedStudentId) return;
      onSendMessage(newMessage, selectedStudentId);
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 2, height: 500 }}>
      {/* Threads */}
      <Paper variant="outlined" sx={{ overflow: 'auto' }}>
        <List>
          {byStudent.map(t => {
            const last = t.items[t.items.length - 1];
            const unread = t.items.some(i => !i.isRead);
            return (
              <ListItemButton key={t.id} selected={selectedStudentId === t.id} onClick={() => setSelectedStudentId(t.id)} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{t.name?.[0]?.toUpperCase() || 'U'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{t.name}</Typography>
                      {unread && <Badge color="error" variant="dot" />}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {last?.content}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Paper>

      {/* Conversation */}
      <Card sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chat />
              {active?.name || 'Messages'}
            </Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error">
                <Typography variant="body2" color="text.secondary">New</Typography>
              </Badge>
            )}
          </Box>
        </CardContent>
        <Divider />
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {(active?.items || []).map(m => {
            const isMine = (m as any).from === 'COMPANY' || (m as any).sender === 'Me';
            return (
              <Box key={m.id} sx={{ mb: 1.5, display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }} onClick={() => onMarkAsRead(m.id)}>
                <Paper sx={{ p: 1.2, maxWidth: '75%', bgcolor: isMine ? 'primary.main' : 'background.paper', color: isMine ? 'primary.contrastText' : 'text.primary' }}>
                  <Typography variant="body2">{m.content}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>{m.timestamp}</Typography>
                </Paper>
              </Box>
            );
          })}
          {(!active || active.items.length === 0) && (
            <Typography variant="body2" color="text.secondary">No messages yet.</Typography>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder={selectedStudentId ? 'Type a message...' : 'Select a conversation to start chatting'}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              size="small"
              disabled={!selectedStudentId}
            />
            <Button variant="contained" onClick={handleSendMessage} disabled={!newMessage.trim() || !selectedStudentId} sx={{ minWidth: 'auto', px: 2 }}>
              <Send />
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ChatSection;
