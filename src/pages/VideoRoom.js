import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomInfo, joinRoom, leaveRoom } from '../api';
import './../styles/VideoRoom.css';

// ParticipantView는 원격 참가자용으로 유지합니다.
const ParticipantView = ({ name }) => {
  return (
    <div className="participant-view">
      <video autoPlay playsInline className="video-feed"></video>
      <div className="participant-name">{name}</div>
    </div>
  );
};

// --- 제스처 인식 유틸리티 함수 ---
// 두 점 사이의 거리를 계산하는 함수
const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// 손가락이 펴져 있는지 확인하는 함수
const isFingerExtended = (landmarks, fingerTipIndex, fingerPipIndex) => {
  const wrist = landmarks[0];
  const fingerTip = landmarks[fingerTipIndex];
  const fingerPip = landmarks[fingerPipIndex];
  return getDistance(wrist, fingerTip) > getDistance(wrist, fingerPip);
};

// '따봉' 제스처를 확인하는 함수
const isThumbsUp = (landmarks) => {
  const thumbTip = landmarks[4];
  const indexFingerPip = landmarks[6];
  const pinkyPip = landmarks[18];

  // 엄지손가락이 다른 손가락들보다 위에 있는지 확인
  const isThumbUp = thumbTip.y < indexFingerPip.y && thumbTip.y < pinkyPip.y;

  // 나머지 네 손가락이 주먹처럼 쥐어져 있는지 확인
  const otherFingersFolded =
    !isFingerExtended(landmarks, 8, 6) &&  // 검지
    !isFingerExtended(landmarks, 12, 10) && // 중지
    !isFingerExtended(landmarks, 16, 14) && // 약지
    !isFingerExtended(landmarks, 20, 18);   // 새끼

  return isThumbUp && otherFingersFolded;
};

// '검지 포인팅' 제스처를 확인하는 함수
const isPointing = (landmarks) => {
  const isIndexFingerExtended = isFingerExtended(landmarks, 8, 6);
  const areOtherFingersFolded = 
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);
  return isIndexFingerExtended && areOtherFingersFolded;
};

// '집게' 제스처(Pinching)를 확인하는 함수
const isPinching = (landmarks) => {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const distance = getDistance(thumbTip, indexTip);
  return distance < 0.05; // 임계값, 실험을 통해 조정 필요
};

// 'V' 제스처를 확인하는 함수
const isVShape = (landmarks) => {
  const isIndexFingerExtended = isFingerExtended(landmarks, 8, 6);
  const isMiddleFingerExtended = isFingerExtended(landmarks, 12, 10);
  const areOtherFingersFolded = 
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);
  return isIndexFingerExtended && isMiddleFingerExtended && areOtherFingersFolded;
};

// 'OK' 사인 제스처를 확인하는 함수
const isOkSign = (landmarks) => {
  const isPinchingNow = isPinching(landmarks);
  const areOtherFingersExtended = 
    isFingerExtended(landmarks, 12, 10) &&
    isFingerExtended(landmarks, 16, 14) &&
    isFingerExtended(landmarks, 20, 18);
  return isPinchingNow && areOtherFingersExtended;
};


function VideoRoom() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const [roomInfo, setRoomInfo] = useState({ name: '테스트 채팅방' });
  const [participants, setParticipants] = useState([
    { id: 'remote1', name: '참가자 1' },
  ]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [stickerPosition, setStickerPosition] = useState({ x: 50, y: 50 });
  const [stickerSize, setStickerSize] = useState(50);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentGestureText, setCurrentGestureText] = useState('제스처 없음');
  const lastGesture = useRef(null);
  const gestureTimeout = useRef(null);
  const exitTimeout = useRef(null); // 채팅방 나가기 타임아웃

  const toggleCamera = (status) => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getVideoTracks();
      if (tracks.length > 0) {
        tracks[0].enabled = status;
        setIsCameraOn(status);
        console.log(`카메라 ${status ? '켜짐' : '꺼짐'}`);
      }
    }
  };

  const toggleMic = () => {
    // 실제 오디오 스트림이 연결되면 마이크 음소거 로직 추가
    setIsMicOn(prev => !prev);
    console.log(`마이크 ${!isMicOn ? '켜짐' : '꺼짐'}`);
  };

  const changeVolume = (amount) => {
    setVolume(prev => {
      const newVolume = Math.max(0, Math.min(1, prev + amount));
      console.log(`볼륨: ${Math.round(newVolume * 100)}%`);
      // 실제 오디오 요소에 볼륨 적용 로직 추가
      return newVolume;
    });
  };

  const handleLeaveRoom = async () => {
    if (roomInfo && roomInfo.id) {
      try {
        await leaveRoom(roomInfo.id);
      } catch (error) {
        console.error('방 퇴장 중 오류 발생:', error);
      }
    }
    navigate('/main');
  };

  return (
    <div className="video-room-container">
      <header className="room-header">
        <h2>{roomInfo ? roomInfo.name : '로딩 중...'}</h2>
      </header>
      <div className="main-content-wrapper">
        <div className="video-grid-main">
          {/* 로컬 사용자 뷰 */}
          <div className="participant-view local">
            <video ref={videoRef} autoPlay playsInline muted className="video-feed"></video>
            <canvas ref={canvasRef} className="output_canvas"></canvas>
            <div className="gesture-display">{currentGestureText}</div>
            {isCursorVisible && <div className="cursor" style={{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px` }}></div>}
            <div 
              className="sticker" 
              style={{ 
                left: `${stickerPosition.x}px`, 
                top: `${stickerPosition.y}px`,
                width: `${stickerSize}px`,
                height: `${stickerSize}px`,
                fontSize: `${stickerSize * 0.8}px`
              }}
            >🎨</div>
            <div className="participant-name">나</div>
          </div>
          {/* 원격 참가자 뷰 */}
          {participants.map(p => (
            <ParticipantView key={p.id} name={p.name} />
          ))}
        </div>
        <div className="chat-panel">
          {/* ... 채팅 UI ... */}
        </div>
      </div>
      <div className="controls-bar">
        <div className="control-buttons">
          <button onClick={() => toggleCamera(!isCameraOn)}>
            {isCameraOn ? '📷' : '📸'}
          </button>
          <button onClick={toggleMic}>
            {isMicOn ? '🎤' : '🔇'}
          </button>
          <div className="volume-control">
            <span>🔊</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>
          <button className="leave-btn" onClick={handleLeaveRoom}>🚪 나가기</button>
        </div>
      </div>

    </div>
  );
}

export default VideoRoom;
