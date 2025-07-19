import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../api';

function CreateRoomModal({ isOpen, onClose }) {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const generateRandomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const sections = [3, 4, 3];
    let id = '';
    for (let i = 0; i < sections.length; i++) {
      for (let j = 0; j < sections[i]; j++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < sections.length - 1) {
        id += '-';
      }
    }
    return id;
  };

  useEffect(() => {
    if (isOpen) {
      setRoomId(generateRandomId());
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const roomName = e.target.elements['room-name'].value;
    const roomPassword = e.target.elements['room-password'].value;
    
    const roomData = {
      name: roomName,
      password: roomPassword,
    };

    try {
      const response = await createRoom(roomData);
      // 백엔드 응답에서 meetingCode를 받는다고 가정합니다. 실제 키 이름은 백엔드와 확인해야 합니다.
      const { meetingCode } = response.data; 
      
      if (meetingCode) {
        alert(`방이 성공적으로 생성되었습니다. 방으로 입장합니다. (ID: ${meetingCode})`);
        onClose();
        navigate(`/rooms/${meetingCode}`);
      } else {
        alert('방 생성에 성공했지만, 입장 코드를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('방 생성에 실패했습니다:', error);
      alert('방 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>새 페이스룸 만들기</h2>
        <div className="room-id-display">
          <span>방 ID:</span>
          <strong>{roomId}</strong>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="room-name">방 이름</label>
            <input type="text" id="room-name" required />
          </div>
          <div className="form-group">
            <label htmlFor="room-password">비밀번호 (선택 사항)</label>
            <input type="password" id="room-password" />
          </div>
          <button type="submit" className="primary-btn">만들기</button>
        </form>
      </div>
    </div>
  );
}

export default CreateRoomModal;
