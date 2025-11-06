/** @type {import('next').NextConfig} */
const nextConfig = {
  // images 속성을 추가합니다.
  images: {
    // remotePatterns는 외부 이미지 URL을 처리하기 위한 최신 방식입니다.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // 유튜브 썸네일 서버의 호스트 이름
        port: '',
        pathname: '/vi/**', // /vi/ 경로 아래의 모든 이미지를 허용
      },
      {
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net',
        port: '',
        pathname: '/**', // shopping-phinf.pstatic.net 도메인의 모든 경로를 허용
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/maps/api/place/photo/**',
      },
    ],
  },
};

module.exports = nextConfig;