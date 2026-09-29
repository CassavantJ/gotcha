import type { ComponentType } from 'react';

import type { SceneId } from '../../quiz/questions';
import { Catch, Flash, Hold, Mash, Sort, Ten, Trophy, Wait } from './Actions';
import {
  Balloon,
  Difference,
  Fish,
  FruitMaths,
  Lights,
  OddFace,
  Radio,
  Scroll,
  Stars,
  Wake,
  Wires,
} from './Pictures';
import type { SceneProps } from './types';

export const SCENES: Record<SceneId, ComponentType<SceneProps>> = {
  wait: Wait,
  lights: Lights,
  balloon: Balloon,
  catch: Catch,
  fish: Fish,
  hold: Hold,
  'odd-face': OddFace,
  wake: Wake,
  scroll: Scroll,
  mash: Mash,
  ten: Ten,
  fruit: FruitMaths,
  flash: Flash,
  difference: Difference,
  sort: Sort,
  stars: Stars,
  radio: Radio,
  wires: Wires,
  trophy: Trophy,
};

export type { SceneProps } from './types';
