import { useEffect, useState } from 'react';

import { QuizAudio } from './audio';
import { Quiz } from './components/Quiz';
import { GameOver, Title, Won } from './components/Screens';
import { newRun, type Run } from './quiz/run';
import { loadSettings, recordProgress, recordWin, saveSettings, type Settings } from './settings';

type Screen = 'title' | 'quiz';

export function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [screen, setScreen] = useState<Screen>('title');
  const [run, setRun] = useState<Run>(newRun);
  const [audio] = useState(() => new QuizAudio(settings.sound, settings.music));

  const update = (next: Settings) => {
    setSettings(next);
    saveSettings(next);
  };

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) audio.suspend();
      else audio.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      audio.close();
    };
  }, [audio]);

  // Development only: lets automated checks jump to any question.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as Window & { gotchaJump?: (index: number) => void }).gotchaJump = (index) => {
      audio.unlock();
      setRun({ ...newRun(), index });
      setScreen('quiz');
    };
  }, [audio]);

  const start = () => {
    audio.unlock();
    setRun(newRun());
    setScreen('quiz');
  };

  const changeRun = (next: Run) => {
    setRun(next);
    let saved = recordProgress(settings, next.index + 1);
    if (next.status === 'won' && run.status !== 'won') {
      audio.play('win');
      saved = recordWin(saved, next.deaths);
    }
    if (saved !== settings) update(saved);
  };

  const toggles = {
    settings,
    onSound: (on: boolean) => {
      audio.setSound(on);
      update({ ...settings, sound: on });
    },
    onMusic: (on: boolean) => {
      audio.setMusic(on);
      update({ ...settings, music: on });
    },
  };

  if (screen === 'title') return <Title onStart={start} {...toggles} />;
  if (run.status === 'game-over') return <GameOver reached={run.index + 1} onRetry={start} />;
  if (run.status === 'won') return <Won deaths={run.deaths} onAgain={start} />;
  return <Quiz run={run} onRun={changeRun} audio={audio} />;
}
