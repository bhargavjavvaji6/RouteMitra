// Voice Navigation & Speech Recognition Service for Hands-Free Driving

export type VoiceNavigationCommandType =
  | 'GAS_STATION'
  | 'HOME'
  | 'OFFICE'
  | 'FOOD'
  | 'REROUTE'
  | 'MUTE'
  | 'UNMUTE'
  | 'END_TRIP'
  | 'WEATHER'
  | 'REPORT_HAZARD'
  | 'CUSTOM_DESTINATION'
  | 'UNKNOWN';

export interface VoiceCommandResult {
  type: VoiceNavigationCommandType;
  transcript: string;
  parameter?: string;
  feedbackSpeech: string;
  description: string;
}

/**
 * Speaks text using Web SpeechSynthesis API for hands-free driver feedback
 */
export const speakFeedback = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
};

/**
 * Parses user speech into actionable driving navigation commands
 */
export const parseNavigationVoiceCommand = (transcript: string): VoiceCommandResult => {
  const clean = transcript.trim().toLowerCase();

  // 1. Gas / Petrol / Fuel
  if (
    clean.includes('gas') ||
    clean.includes('petrol') ||
    clean.includes('fuel') ||
    clean.includes('diesel') ||
    clean.includes('cng')
  ) {
    return {
      type: 'GAS_STATION',
      transcript,
      feedbackSpeech: 'Searching for nearest petrol bunk along your route.',
      description: 'Finding nearest gas station on your route',
    };
  }

  // 2. Home
  if (clean.includes('home') || clean.includes('house') || clean.includes('my place')) {
    return {
      type: 'HOME',
      transcript,
      parameter: 'Home, Jubilee Hills, Hyderabad',
      feedbackSpeech: 'Routing to Home. Recalculating directions now.',
      description: 'Navigating to Home (Jubilee Hills)',
    };
  }

  // 3. Office / Work
  if (clean.includes('office') || clean.includes('work') || clean.includes('workplace')) {
    return {
      type: 'OFFICE',
      transcript,
      parameter: 'Office, HITEC City, Hyderabad',
      feedbackSpeech: 'Routing to Office in HITEC City.',
      description: 'Navigating to Office (HITEC City)',
    };
  }

  // 4. Food / Restaurants
  if (
    clean.includes('food') ||
    clean.includes('restaurant') ||
    clean.includes('eat') ||
    clean.includes('cafe') ||
    clean.includes('coffee') ||
    clean.includes('hotel')
  ) {
    return {
      type: 'FOOD',
      transcript,
      feedbackSpeech: 'Searching for highly rated restaurants and food stops along your route.',
      description: 'Finding restaurants along route',
    };
  }

  // 5. Reroute / Traffic Avoidance
  if (
    clean.includes('reroute') ||
    clean.includes('re route') ||
    clean.includes('alternative') ||
    clean.includes('avoid traffic') ||
    clean.includes('faster') ||
    clean.includes('detour')
  ) {
    return {
      type: 'REROUTE',
      transcript,
      feedbackSpeech: 'Checking live traffic on NH16 and calculating alternative route.',
      description: 'Recalculating alternative faster route',
    };
  }

  // 6. Mute Voice
  if (
    clean === 'mute' ||
    clean.includes('mute voice') ||
    clean.includes('be quiet') ||
    clean.includes('stop talking') ||
    clean.includes('silent')
  ) {
    return {
      type: 'MUTE',
      transcript,
      feedbackSpeech: 'Voice guidance muted.',
      description: 'Voice navigation guidance muted',
    };
  }

  // 7. Unmute Voice
  if (
    clean === 'unmute' ||
    clean.includes('unmute voice') ||
    clean.includes('speak') ||
    clean.includes('voice on') ||
    clean.includes('sound on')
  ) {
    return {
      type: 'UNMUTE',
      transcript,
      feedbackSpeech: 'Voice guidance unmuted. Continuing turn-by-turn alerts.',
      description: 'Voice navigation guidance unmuted',
    };
  }

  // 8. End Trip / Cancel
  if (
    clean.includes('end trip') ||
    clean.includes('stop trip') ||
    clean.includes('end navigation') ||
    clean.includes('stop navigation') ||
    clean.includes('cancel navigation') ||
    clean.includes('finish trip')
  ) {
    return {
      type: 'END_TRIP',
      transcript,
      feedbackSpeech: 'Stopping navigation. Please confirm to finish trip.',
      description: 'Stopping active navigation',
    };
  }

  // 9. Weather / Rain
  if (
    clean.includes('weather') ||
    clean.includes('rain') ||
    clean.includes('climate') ||
    clean.includes('temperature')
  ) {
    return {
      type: 'WEATHER',
      transcript,
      feedbackSpeech: 'Destination weather is 23 degrees Celsius with moderate rain advisory.',
      description: 'Checking destination weather conditions',
    };
  }

  // 10. Hazard / Police / Roadblock
  if (
    clean.includes('hazard') ||
    clean.includes('accident') ||
    clean.includes('police') ||
    clean.includes('roadblock') ||
    clean.includes('pothole')
  ) {
    return {
      type: 'REPORT_HAZARD',
      transcript,
      feedbackSpeech: 'Hazard reported to convoy participants and live map.',
      description: 'Hazard reported on route',
    };
  }

  // 11. Custom destination ("take me to X", "navigate to X", "go to X")
  const navigatePrefixes = [
    'take me to ',
    'navigate to ',
    'go to ',
    'directions to ',
    'drive to ',
    'route to ',
  ];

  for (const prefix of navigatePrefixes) {
    if (clean.startsWith(prefix)) {
      const dest = clean.slice(prefix.length).trim();
      if (dest) {
        return {
          type: 'CUSTOM_DESTINATION',
          transcript,
          parameter: dest,
          feedbackSpeech: `Setting destination to ${dest}. Calculating route.`,
          description: `Navigating to ${dest}`,
        };
      }
    }
  }

  // Default fallback if a place name was simply spoken
  if (clean.length > 2) {
    return {
      type: 'CUSTOM_DESTINATION',
      transcript,
      parameter: transcript,
      feedbackSpeech: `Routing to ${transcript}. Updating navigation.`,
      description: `Searching route to ${transcript}`,
    };
  }

  return {
    type: 'UNKNOWN',
    transcript,
    feedbackSpeech: "Sorry, I didn't catch that navigation command. Say 'find gas station', 'home', or 'reroute'.",
    description: 'Command not recognized',
  };
};
