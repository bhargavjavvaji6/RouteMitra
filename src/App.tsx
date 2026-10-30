import React, { useState, useEffect } from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { SplashScreen } from './screens/SplashScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { StartTripScreen } from './screens/StartTripScreen';
import { LiveNavigationScreen } from './screens/LiveNavigationScreen';
import { AdvancedGuidanceScreen } from './screens/AdvancedGuidanceScreen';
import { NearbyPlacesScreen } from './screens/NearbyPlacesScreen';
import { GroupNotificationScreen } from './screens/GroupNotificationScreen';
import { MemberArrivedScreen } from './screens/MemberArrivedScreen';
import { MusicScreen } from './screens/MusicScreen';
import { TripCompletionScreen } from './screens/TripCompletionScreen';
import { RealTimeGoogleMapScreen } from './screens/RealTimeGoogleMapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { Smartphone, Monitor } from 'lucide-react';

const ScreenRouter: React.FC = () => {
  const { currentScreen, toastMessage, phoneFrame, togglePhoneFrame, user } = useTrip();
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const renderScreen = () => {
    // Strict authentication gate (Requirement 5)
    if (!user && currentScreen !== 'register' && currentScreen !== 'splash') {
      return <LoginScreen />;
    }

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen />;
      case 'start-trip':
        return <StartTripScreen />;
      case 'live-navigation':
        return <LiveNavigationScreen />;
      case 'advanced-guidance':
        return <AdvancedGuidanceScreen />;
      case 'members':
        return <ProfileScreen initialSection="members" />;
      case 'history':
        return <ProfileScreen initialSection="history" />;
      case 'settings':
        return <ProfileScreen initialSection="overview" />;
      case 'my-trips':
        return <ProfileScreen initialSection="history" />;
      case 'nearby':
        return <NearbyPlacesScreen />;
      case 'notifications':
        return <GroupNotificationScreen />;
      case 'member-arrived':
        return <MemberArrivedScreen />;
      case 'music':
        return <MusicScreen />;
      case 'completion':
        return <TripCompletionScreen />;
      case 'google-maps':
        return <RealTimeGoogleMapScreen />;
      case 'profile':
        return <ProfileScreen initialSection="overview" />;
      default:
        return <HomeScreen />;
    }
  };

  // On real mobile screens (< 768px), ALWAYS render native full-bleed (Fix for Requirement #3)
  const shouldRenderFrame = !isMobileDevice && phoneFrame;

  return (
    <div className="relative min-h-screen bg-[#070D12] text-slate-800 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Top Device Bar (Visible only on desktop screens for frame toggle) */}
      <header className="hidden md:flex w-full z-40 bg-[#0B151E]/95 backdrop-blur-md border-b border-[#1E2E3E] px-4 py-2 items-center justify-between text-xs text-white">
        <div className="flex items-center gap-2">
          <img
            src="/assets/aistudio/Route_Mitra_Logo_69de06f0.jpeg"
            alt="RouteMitra"
            className="w-5 h-5 rounded-md object-cover shadow"
          />
          <span className="font-black text-sm tracking-tight text-white">
            Route<span className="text-[#34D399]">Mitra</span>
          </span>
          <span className="text-[11px] text-white/50 pl-2 border-l border-white/10">
            Real-Time Convoy Navigation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePhoneFrame}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A2633] border border-[#2D3D4F] text-white/80 hover:text-white hover:border-[#34D399]/50 transition-all text-[11px] font-semibold cursor-pointer"
            title="Toggle between Mobile Phone Frame (Image 3/4) and Full Desktop View"
          >
            {shouldRenderFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Expand Full Screen</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Phone Frame View</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <div className={`w-full flex-1 flex items-center justify-center ${shouldRenderFrame ? 'py-6 px-4' : 'p-0'}`}>
        {shouldRenderFrame ? (
          /* Luxury Mobile Bezel for Desktop Preview (Image 3 & 4 Model) */
          <div className="relative w-full max-w-[412px] h-[846px] rounded-[52px] p-[10px] bg-gradient-to-b from-[#2E3C48] via-[#1A2633] to-[#121B24] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(52,211,153,0.12)] border-2 border-[#3D4F63] overflow-hidden flex flex-col">
            {/* Phone Screen Inner Shell */}
            <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-[#F8FAFC] flex flex-col shadow-inner">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 shadow-md pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1A2633] border border-white/20" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>

              {/* Screen Content */}
              <div className="w-full flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-none">
                {renderScreen()}
              </div>
            </div>
          </div>
        ) : (
          /* Native Full-Bleed Mobile Resolution (Matches real phone screen seamlessly) */
          <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] flex flex-col relative shadow-xl overflow-x-hidden">
            {renderScreen()}
          </div>
        )}
      </div>

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-3 bg-[#1A2633]/95 backdrop-blur-md border border-[#34D399]/50 text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#34D399]" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <TripProvider>
      <ScreenRouter />
    </TripProvider>
  );
}

export default App;
