import { useState } from 'react';
import type { GameMode, OutRule, ShanghaiRounds } from '../../game/scoring';
export function useMatchSetup() {
  const [names, setNames] = useState<string[]>([]);
  const [bull, setBull] = useState(false);
  const [bullSetup, setBullSetup] = useState(false);
  const [fairEnding, setFairEnding] = useState(true);
  const [mode, setMode] = useState<GameMode>('301');
  const [shanghaiRounds, setShanghaiRounds] = useState<ShanghaiRounds>(7);
  const [rule, setRule] = useState<OutRule>('double');
  return {
    names,
    setNames,
    bull,
    setBull,
    bullSetup,
    setBullSetup,
    fairEnding,
    setFairEnding,
    shanghaiRounds,
    setShanghaiRounds,
    mode,
    setMode,
    rule,
    setRule
  };
}
export type MatchSetupState = ReturnType<typeof useMatchSetup>;
