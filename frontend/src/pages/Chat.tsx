import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Chip,
  useTheme,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

/**
 * Message interface defining the structure of chat messages
 * @property {string} id - Unique identifier for the message
 * @property {string} content - The actual message content
 * @property {('user' | 'bot')} sender - Who sent the message
 */
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

// Welcome message when the chat starts
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  content: `Hello! 👋 Welcome to MindMate, your AI companion for emotional support and mental well-being.

I'm here to:
• 🎯 Listen without judgment
• 💡 Offer practical coping strategies
• 🌱 Support your mental well-being journey
• 🧘‍♀️ Share mindfulness techniques

While I'm not a replacement for professional help, I can be a supportive friend on your journey. 

How are you feeling today? 💭`,
  sender: 'bot',
  timestamp: new Date().toISOString(),
};

// Message component with improved styling
const MessageComponent: React.FC<{ message: Message }> = ({ message }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {message.sender === 'bot' && (
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 32,
            height: 32,
          }}
        >
          <PsychologyIcon fontSize="small" />
        </Avatar>
      )}
      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
            color: message.sender === 'user' ? 'white' : 'text.primary',
            borderRadius: 2,
            position: 'relative',
            '&:hover .message-actions': {
              opacity: 1,
            },
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
          <Box
            className="message-actions"
            sx={{
              position: 'absolute',
              top: -28,
              right: message.sender === 'user' ? 0 : 'auto',
              left: message.sender === 'bot' ? 0 : 'auto',
              opacity: 0,
              transition: 'opacity 0.2s',
              display: 'flex',
              gap: 0.5,
            }}
          >
            <Tooltip title={copied ? "Copied!" : "Copy message"}>
              <IconButton size="small" onClick={handleCopy} sx={{ bgcolor: 'background.paper' }}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
        </Paper>
      </Box>
      {message.sender === 'user' && (
        <Avatar
          sx={{
            bgcolor: theme.palette.secondary.main,
            width: 32,
            height: 32,
          }}
        >
          <PersonIcon fontSize="small" />
        </Avatar>
      )}
    </Box>
  );
};

/**
 * Main Chat component that handles the messaging interface
 * Provides real-time chat functionality with OpenAI integration
 */
const Chat: React.FC = () => {
  // State management for messages and UI
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference for auto-scrolling to latest message
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const theme = useTheme();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handles sending messages and receiving AI responses
   * Makes API calls to OpenAI with proper error handling
   */
  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.apiUrl}/chat`, {
        message: inputMessage
      });

      const botMessage: Message = {
        id: Date.now().toString(),
        content: response.data.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  // Quick access emotional prompts for common scenarios
  const QUICK_PROMPTS = [
    { label: '😔 Feeling Down', text: "I'm feeling really down today and could use some support." },
    { label: '😰 Anxiety', text: "I'm feeling anxious and need help calming down." },
    { label: '😤 Stress', text: "I'm dealing with a lot of stress and need coping strategies." },
    { label: '💭 Overthinking', text: "I can't stop overthinking and need help clearing my mind." },
  ];

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 64px)', // Subtract header height
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <MessageComponent key={message.id} message={message} />
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 2,
          bgcolor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Quick Prompts */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((prompt) => (
            <Chip
              key={prompt.label}
              label={prompt.label}
              onClick={() => setInputMessage(prompt.text)}
              sx={{
                '&:hover': { 
                  opacity: 0.8,
                  bgcolor: 'primary.light',
                  color: 'white',
                },
                transition: 'all 0.2s',
              }}
            />
          ))}
          <Tooltip title="Clear chat">
            <IconButton 
              onClick={handleClearChat}
              sx={{ ml: 'auto' }}
              color="inherit"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {/* Message Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            variant="outlined"
            size="small"
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton 
            onClick={handleSend} 
            color="primary" 
            disabled={!inputMessage.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat; 