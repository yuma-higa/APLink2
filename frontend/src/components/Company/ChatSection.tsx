import React, { useState } from 'react';
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
} from '@mui/material';
import { Send, Chat } from '@mui/icons-material';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onMarkAsRead: (messageId: number) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  onSendMessage,
  onMarkAsRead
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const groupedMessages = messages.reduce((acc, message) => {
    if (!acc[message.sender]) {
      acc[message.sender] = [];
    }
    acc[message.sender].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chat />
              Messages
            </Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error">
                <Typography variant="body2" color="text.secondary">
                  New Messages
                </Typography>
              </Badge>
            )}
          </Box>
        </CardContent>

        {/* Chat List */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
          {Object.entries(groupedMessages).map(([sender, senderMessages]) => (
            <Box key={sender} sx={{ mb: 2 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 1, 
                  borderRadius: 1,
                  bgcolor: selectedChat === sender ? 'action.selected' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => setSelectedChat(selectedChat === sender ? null : sender)}
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {sender.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{sender}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {senderMessages[senderMessages.length - 1].content}
                  </Typography>
                </Box>
                {senderMessages.some(msg => !msg.isRead) && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                )}
              </Box>
              
              {selectedChat === sender && (
                <Box sx={{ ml: 7, mt: 1 }}>
                  <List dense>
                    {senderMessages.map((message) => (
                      <ListItem key={message.id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={message.content}
                          secondary={message.timestamp}
                          onClick={() => onMarkAsRead(message.id)}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: message.isRead ? 'normal' : 'bold'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </Box>

        {/* Message Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              size="small"
            />
            <Button 
              variant="contained" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <Send />
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ChatSection;
