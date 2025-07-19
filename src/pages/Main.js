import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles/Main.css';
import CreateRoomModal from './../components/CreateRoomModal';
import FerrisWheel from './../components/FerrisWheel';
import RollerCoaster from './../components/RollerCoaster'; // RollerCoaster 컴포넌트 import
import { getProfile, logout } from '../api';

function Main() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // const fetchProfileData = async () => {
    //   try {
    //     const response = await getProfile();
    //     setUserProfile(response.data); 
    //   } catch (error) {
    //     console.error('프로필 정보를 가져오는데 실패했습니다:', error);
    //     alert('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
    //     navigate('/');
    //   }
    // };
    // fetchProfileData();
  }, [navigate]);

  const handleCreateRoom = () => {
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/');
    }
  };

  // 임시데이터
  const rooms = [
    { id: 'room1', name: 'React 스터디' }, { id: 'room2', name: '프로젝트 회의' },
    { id: 'room3', name: '저녁 수다방' }, { id: 'room4', name: '코테 준비' },
    { id: 'room5', name: '게임 채널' }, { id: 'room6', name: '영화 토론' },
    { id: 'room7', name: '음악 감상실' }, { id: 'room8', name: '요리 레시피' },
    { id: 'room9', name: '여행 계획' }, { id: 'room10', name: '운동 파트너' },
    { id: 'room11', name: '독서 모임' }, { id: 'room12', name: '개발 뉴스' }
  ];

  const rollerCoasterRooms = rooms.slice(6);

  return (
    <>
      <div className="main-container amusement-park-theme">
        <header className="main-header">
          <h1>Zoooooom</h1>
          <div className="header-buttons">
            {userProfile && <span className="user-greeting">{userProfile.nickname || userProfile.name}님, 환영합니다!</span>}
            <button className="create-room-btn" onClick={handleCreateRoom}>+ 새 놀이기구 탑승</button>
            <button className="logout-btn" onClick={handleLogout}>나가기</button>
          </div>
        </header>

        <main className="amusement-park-main">
          <FerrisWheel />
          <RollerCoaster rooms={rollerCoasterRooms} />
        </main>
      </div>

      <CreateRoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default Main;
