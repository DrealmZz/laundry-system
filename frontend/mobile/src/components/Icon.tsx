import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const ICON_MAP: Record<string, string> = {
  house: 'home',
  basket: 'shopping-bag',
  'shop': 'shopping-bag',
  coin: '', // handled by FontAwesome5
  search: 'search',
  person: 'user',
  bell: 'bell',
  calendar: 'calendar',
  camera: 'camera',
  'file-text': 'file-text',
  image: 'image',
  'geo-alt': 'map-pin',
  clipboard: 'clipboard',
  'card-list': 'list',
  pencil: 'edit-2',
  inbox: 'inbox',
  star: 'star',
  'hand-index': 'mouse-pointer',
  eye: 'eye',
  'eye-slash': 'eye-off',
  'circle-fill': 'circle',
  record: 'circle',
  'arrow-repeat': 'refresh-cw',
  truck: 'truck',
  box: 'box',
  cart: 'shopping-cart',
  'credit-card': 'credit-card',
  lightning: 'zap',
  droplet: 'droplet',
  wallet: 'credit-card',
  lightbulb: 'sun',
  heart: 'heart',
  'star-fill': 'star',
  'check-circle': 'check-circle',
  'lightning-charge': 'zap',
  'chat-dots': 'message-circle',
  'info-circle': 'info',
  'check-lg': 'check',
  'x-lg': 'x',
  'arrow-left': 'arrow-left',
  'chevron-right': 'chevron-right',
  'qr-code': 'maximize-2',
  clock: 'clock',
  gear: 'settings',
  'door-open': 'log-out',
  envelope: 'mail',
  lock: 'lock',
  plus: 'plus',
  dash: 'minus',
  'check-circle-fill': 'check-circle',
  'exclamation-triangle': 'alert-triangle',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle | TextStyle;
}

export default function Icon({ name, size = 16, color = '#000', style }: IconProps) {
  if (name === 'coin') {
    return <FontAwesome5 name="coins" size={size} color={color} style={style} />;
  }
  const featherName = ICON_MAP[name];
  if (!featherName) return null;
  return <Feather name={featherName as any} size={size} color={color} style={style} />;
}
