import React, { useState, useRef } from "react";
import { createPortal } from 'react-dom';
import { useToast } from '../../components/ToastProvider.jsx'
import { API_BASE } from '../../config.js'

const sendMessage = async (message, isAnonymous, roomId, socket, notify) => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Check if message is JSON (rich content) or plain text
  let payloadText = message;
  try {
     if (typeof message === 'object') {
        payloadText = JSON.stringify(message);
     }
  } catch (e) {
      // ignore
  }

  try {
    const response = await fetch(`${API_BASE}/user/room/message/send`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({"isAnonymous" : isAnonymous, "text": payloadText, "isPoll": false, "roomId": roomId}),
    });
    if(response.ok){
        console.log("Message sent successfully!");
        socket.emit("message", { "room": roomId, "message" : await response.json() });
    }
    else{
        const errorText = await response.text();
        console.log("Error while sending message", errorText);
        if (notify) notify(`Failed to send: ${errorText}`, { type: 'error' });
    }
  } catch (error) {
     console.error("Network error sending message", error);
     if (notify) notify("Network error while sending message", { type: 'error' });
  }
};

const sendPoll = async (pollQuestion, pollOptions, isAnonymous, roomId, socket, notify) => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch(`${API_BASE}/user/room/poll/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${refreshToken}`
    },
    body: JSON.stringify({"isAnonymous" : isAnonymous, "text": pollQuestion, "pollOptions": pollOptions, "roomId": roomId, "isPoll": true}),
  });
  if(response.ok){
    console.log("Poll sent successfully!");
    socket.emit("message", { "room": roomId, "message" : await response.json() });
  }
  else{
    notify(await response.text(), { type: 'error' });
  }
};

const ChatInput = ({room, socket}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isNewPoll, setIsNewPoll] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  const [pollOptions, setPollOptions] = useState([""]);
  const [pollQuestion, setPollQuestion] = useState("");
  
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");

  const [newMessage, setNewMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const fileInputRef = useRef(null);
  const { notify } = useToast();

  const handleAddOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...pollOptions];
    updatedOptions[index] = value;
    setPollOptions(updatedOptions);
  };

  const handlePollSend = () => {
    sendPoll(pollQuestion, pollOptions, isAnonymous, room.roomId, socket, notify);
    setIsNewPoll(false);
    setPollOptions([""]);
    setPollQuestion("");
  };

  const handleSendMessage = () => {
    sendMessage(newMessage, isAnonymous, room.roomId, socket, notify);
    setNewMessage("");
  };

  const handleCodeSend = () => {
      const richMessage = {
          type: 'CODE',
          content: codeContent,
          language: codeLanguage
      };
      sendMessage(richMessage, isAnonymous, room.roomId, socket, notify);
      setIsCodeModalOpen(false);
      setCodeContent("");
  };

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64
          notify("Image is too large (max 2MB)", { type: 'error' });
          e.target.value = null; // Reset input
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result;
          const richMessage = {
              type: 'IMAGE',
              content: base64String
          };
          sendMessage(richMessage, isAnonymous, room.roomId, socket, notify);
      };
      reader.onerror = () => {
          notify("Failed to read image file", { type: 'error' });
      };
      reader.readAsDataURL(file);
      setIsOptionsOpen(false);
      e.target.value = null; // Reset input so same file can be selected again
  };

  return (
    <div className="w-full z-10 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          
          {/* Options Menu Button caused */}
          <div className="relative">
            <button
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className={`p-2.5 rounded-full transition-all duration-200 ${isOptionsOpen ? 'bg-brand-500 text-white rotate-45' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-brand-600'}`}
                title="Add Attachment"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>

            {/* Options Dropdown */}
            {isOptionsOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200/60 dark:border-neutral-700/50 overflow-hidden animate-scale-up origin-bottom-left">
                    <button onClick={() => { setIsNewPoll(true); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
                        <span className="text-xl">📊</span> <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Create Poll</span>
                    </button>
                    <button onClick={() => { setIsCodeModalOpen(true); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
                        <span className="text-xl">💻</span> <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Share Code</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
                        <span className="text-xl">🖼️</span> <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Upload Image</span>
                    </button>
                </div>
            )}
          </div>
            
          <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
          />

          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full pl-5 pr-12 py-3 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 transition-all outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-500 text-white disabled:opacity-50 disabled:bg-neutral-400 hover:bg-brand-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20"
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition opacity-70 hover:opacity-100">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="w-4 h-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 select-none">Anon</span>
          </label>
        </div>


      {/* POLL MODAL */}
      {isNewPoll && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="card w-full max-w-lg p-6 bg-white dark:bg-neutral-900 shadow-2xl animate-scale-up border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
            <h2 className="text-xl font-bold mb-4 text-gradient">Create New Poll</h2>
            
            <input
              type="text"
              placeholder="What would you like to ask?"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="input mb-4 text-lg font-medium bg-neutral-50 dark:bg-neutral-800"
              autoFocus
            />
            
            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                   <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">{index + 1}</div>
                   <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="input flex-1 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleAddOption}
              className="w-full py-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all text-sm font-medium mb-6"
            >
              + Add Another Option
            </button>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setIsNewPoll(false); setPollOptions([""]); setPollQuestion(""); }}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handlePollSend}
                disabled={!pollQuestion.trim() || pollOptions.some(opt => !opt.trim())}
                className="btn shadow-lg shadow-brand-500/20"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CODE BLOCK MODAL */}
      {isCodeModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
              <div className="card w-full max-w-2xl p-6 bg-white dark:bg-neutral-900 shadow-2xl animate-scale-up border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
                  <h2 className="text-xl font-bold mb-4 text-gradient flex items-center gap-2">
                       <span className="text-2xl">💻</span> Share Code Snippet
                  </h2>

                  <div className="mb-4">
                      <select 
                          value={codeLanguage} 
                          onChange={(e) => setCodeLanguage(e.target.value)}
                          className="input w-full md:w-1/3 bg-neutral-50 dark:bg-neutral-800"
                      >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="bata">Java</option>
                          <option value="cpp">C++</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="sql">SQL</option>
                      </select>
                  </div>

                  <textarea
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      placeholder="// Paste your code here..."
                      className="flex-1 w-full p-4 font-mono text-sm bg-neutral-900 text-neutral-200 rounded-xl resize-none outline-none focus:ring-2 ring-brand-500/50 mb-6 custom-scrollbar min-h-[300px]"
                      spellCheck="false"
                  />

                  <div className="flex items-center justify-end gap-3">
                      <button
                          onClick={() => { setIsCodeModalOpen(false); setCodeContent(""); }}
                          className="btn-ghost"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={handleCodeSend}
                          disabled={!codeContent.trim()}
                          className="btn shadow-lg shadow-brand-500/20"
                      >
                          Send Snippet
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default ChatInput;
