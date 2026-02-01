import React, { useEffect, useState } from 'react';
import MemberSidebar from './MemberSidebar';
import { useToast } from '../../components/ToastProvider.jsx';
import { API_BASE } from '../../config.js';

const fetchMembers = async (roomId) => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch(`${API_BASE}/user/room/allUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ roomId }),
  });
  if (res.ok) return res.json();
  return [];
};

const removeUser = async (userId, roomId, socket, setIsToBeRefreshed, notify) => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch(`${API_BASE}/user/room/removeUser`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ roomId, userId }),
  });
  if (res.ok) {
    socket?.emit('rejectUser', { roomId, userId });
    setIsToBeRefreshed((p) => !p);
  } else {
    notify(await res.text(), { type: 'error' });
  }
};

const acceptUser = async (userId, roomId, socket, setIsToBeRefreshed, notify) => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch(`${API_BASE}/user/room/authenticateUser`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ roomId, userId }),
  });
  if (res.ok) {
    socket?.emit('acceptUser', { roomId, userId });
    setIsToBeRefreshed((p) => !p);
  } else {
    notify('You are not authorized to perform this action', { type: 'error' });
  }
};

const renameGroup = async (roomId, newName, socket, setIsToBeRefreshed, notify) => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch(`${API_BASE}/user/room/rename`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ roomId, newName }),
  });
  if (res.ok) {
    socket?.emit('renameGroup', { roomId });
    setIsToBeRefreshed((p) => !p);
  } else {
    notify('You are not authorized to perform this action', { type: 'error' });
  }
};

const leaveGroup = async (roomId, setIsToBeRefreshed, notify) => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch(`${API_BASE}/user/room/leaveRoom`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ roomId }),
  });
  if (res.ok) {
    setIsToBeRefreshed((p) => !p);
  } else {
    notify(await res.text(), { type: 'error' });
  }
};

const endGroup = async (roomId, socket, setIsToBeRefreshed, notify) => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch(`${API_BASE}/user/room/deleteRoom`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ roomId }),
  });
  if (res.ok) {
    socket?.emit('endGroup', { roomId });
    setIsToBeRefreshed((p) => !p);
  } else {
    notify(await res.text(), { type: 'error' });
  }
};

const RoomOptions = ({ room, isNewGroupCreatedOrJoined, setIsNewGroupCreatedOrJoined, socket, setIsToBeRefreshed }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [refreshMembers, setRefreshMembers] = useState(false);
  const [isRenameGroup, setIsRenameGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const { notify } = useToast();

  useEffect(() => {
    if (showMembers) {
      const id = setTimeout(() => {
        fetchMembers(room.roomId).then((data) => setMembers(data));
      }, 400);
      return () => clearTimeout(id);
    }
  }, [showMembers, refreshMembers, room]);

  useEffect(() => {
    setShowMembers(false);
    setIsRenameGroup(false);
    setShowOptions(false);
    setMembers([]);
    setNewGroupName('');
  }, [room]);

  const handleMemberAction = async (action, userId) => {
    if (action === 'accept') {
      await acceptUser(userId, room.roomId, socket, setIsToBeRefreshed, notify);
    } else if (action === 'reject' || action === 'remove') {
      await removeUser(userId, room.roomId, socket, setIsToBeRefreshed, notify);
    }
    setRefreshMembers((p) => !p);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setShowOptions((prev) => !prev)}
        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition opacity-80 hover:opacity-100"
        title="Room Options"
      >
        <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-1 bg-white/95 dark:bg-neutral-700/90 backdrop-blur text-neutral-900 dark:text-neutral-100 rounded-md shadow-lg z-[60] overflow-hidden border border-neutral-200/60 dark:border-neutral-700/50">
          <button
            onClick={async () => {
              await leaveGroup(room.roomId, setIsToBeRefreshed, notify);
              setIsNewGroupCreatedOrJoined(!isNewGroupCreatedOrJoined);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Leave Group
          </button>
          <button
            onClick={() => setIsRenameGroup(true)}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Rename Group
          </button>
          <button
            onClick={() => setShowMembers(true)}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Members
          </button>
          <button
            onClick={async () => {
              await endGroup(room.roomId, socket, setIsToBeRefreshed, notify);
              setIsNewGroupCreatedOrJoined(!isNewGroupCreatedOrJoined);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 dark:text-red-300 dark:hover:bg-neutral-700"
          >
            End Group
          </button>
        </div>
      )}

      {showMembers && (
        <MemberSidebar
          members={members}
          onClose={() => setShowMembers(false)}
          handleMemberAction={handleMemberAction}
        />
      )}

      {isRenameGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Rename Group</h2>
            <input
              type="text"
              placeholder="Enter new group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
              className="input"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn-outline" onClick={() => setIsRenameGroup(false)}>Cancel</button>
              <button
                className="btn"
                onClick={async () => {
                  await renameGroup(room.roomId, newGroupName, socket, setIsToBeRefreshed, notify);
                  setIsRenameGroup(false);
                  setTimeout(() => setIsNewGroupCreatedOrJoined(!isNewGroupCreatedOrJoined), 500);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomOptions;
