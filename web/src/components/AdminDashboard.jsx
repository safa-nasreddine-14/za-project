import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { ShieldCheck, Bell, Phone, PhoneOff, Mic } from 'lucide-react';

// Connect to backend
const BASE_URL = import.meta.env.VITE_API_URL || '';
const socket = io(BASE_URL);

const RINGTONE_DATA_URI = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAzAAAC1AAZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZ//uQxAAACtsM4AAA0AAAAANIAAAAQZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZ//uQxAAACtsM4AAA0AAAAANIAAAAQZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZ'; // Short silence/beep fallback, but ideally use a real one.
// Better: Real beep
const REAL_RINGTONE_URI = 'data:audio/wav;base64,UklGRqAHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV4HAACA/5T/m/+e/6H/o/+/v8C/v7+5uLi3t7e0tLOzs7Cvr66urqysrKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiov+6/7L/sP+u/6v/qf+m/6T/of+f/5z/mv+X/5X/kv+Q/47/i/+J/4b/hP+B/3//fP96/3j/df9z/3D/bv9s/2n/Z/9l/2L/YP9e/1v/Wf9X/1T/Uv9Q/03/S/9J/0b/RP9C/z//Pf87/zj/Nf8z/zD/Lv8s/yn/KP8m/yP/If8f/xz/Gv8Y/xX/E/8R/w7/DP8K/wf/Bv8D/wH///8B/wP/Bf8H/wn/C/8N/w//Ef8T/xX/F/8Z/xt/HX8ffyB/In8kfyd/KX8tfy9/MX8xfzF/MX8xfzV/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81vzW/Nb81v8=';
const AdminDashboard = ({ token, onLogout }) => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [callQueue, setCallQueue] = useState([]); // Array of { callerId, offer, socketId }
    const [callHistory, setCallHistory] = useState([]); // Array of saved calls
    const [activeCall, setActiveCall] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const peerRef = React.useRef(null);
    const localStreamRef = React.useRef(null);
    const remoteAudioRef = React.useRef(null);
    const activeCallRef = React.useRef(null); // Ref to track active call for socket listeners


    const [voices, setVoices] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [audioAllowed, setAudioAllowed] = useState(false); // NEW: Track audio permission
    const [isSecureContext, setIsSecureContext] = useState(true);
    const [notifications, setNotifications] = useState([]); // NEW: Non-blocking notifications
    const iceQueueRef = React.useRef([]); // NEW: Queue for candidates arriving before PC is ready
    const [mapCenter, setMapCenter] = useState([36.75, 3.05]); // Default center
    const [twilioError, setTwilioError] = useState(null);

    const handleLocateEvent = (item) => {
        if (!item.location || item.location === 'غير محدد') {
            addNotification('الموقع غير متوفر لهذا الحدث', 'warning');
            return;
        }
        const [lat, lng] = item.location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setActiveTab('map');
        }
    };

    // Helper component to center map
    const MapController = ({ center }) => {
        const map = useMap();
        useEffect(() => {
            map.flyTo(center, 15);
        }, [center]);
        return null;
    };

    useEffect(() => {
        const fetchOptions = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const handleAuthError = (res) => {
            if (res.status === 401 || res.status === 403) {
                onLogout();
                return true;
            }
            return false;
        };

        // Check for secure context
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setIsSecureContext(false);
        }

        // Fetch initial data
        fetch(`${BASE_URL}/api/reports`, fetchOptions)
            .then(res => {
                if (handleAuthError(res)) return;
                return res.json();
            })
            .then(data => data && setReports(data));

        fetch(`${BASE_URL}/api/voice`, fetchOptions)
            .then(res => {
                if (handleAuthError(res)) return;
                return res.json();
            })
            .then(data => data && setVoices(data));

        fetch(`${BASE_URL}/api/calls`, fetchOptions)
            .then(res => {
                if (handleAuthError(res)) return;
                return res.json();
            })
            .then(data => data && setCallHistory(data));

        socket.on('connect', () => {
            console.log('Connected to server, registering dashboard...');
            socket.emit('register_dashboard', { token });
        });

        // Listen for real-time updates
        socket.on('new_report', (report) => {
            setReports(prev => [report, ...prev]);
            addNotification(`تقرير جديد: ${report.type} - ${report.description?.substring(0, 30)}...`, 'info');
        });

        socket.on('new_alarm', (alarm) => {
            // Replaced block alert() with notification and sound trigger
            triggerAlertSound(); // Trigger ringtone for SOS too

            fetch(`${BASE_URL}/api/calls`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => {
                if (handleAuthError(res)) return;
                return res.json();
            }).then(data => data && setCallHistory(data));
        });

        socket.on('new_voice', (voice) => {
            setVoices(prev => [voice, ...prev]);
            addNotification('رسالة صوتية جديدة مستلمة', 'info');
        });

        socket.on('new_call_history', (call) => {
            setCallHistory(prev => {
                // Prevent duplicates based on ID
                if (prev.find(c => c.id === call.id)) return prev;
                return [call, ...prev];
            });
        });

        // Call Signaling (WebRTC)
        socket.on('incoming_call', (data) => {
            console.log('Incoming call from:', data.callerId);
            setCallQueue(prev => {
                const existingIndex = prev.findIndex(c => c.callerId === data.callerId);
                // Important: Ensure socketId is preserved
                const callData = { ...data, timestamp: new Date() };
                if (existingIndex !== -1) {
                    const newQueue = [...prev];
                    newQueue[existingIndex] = callData;
                    return newQueue;
                }
                return [...prev, callData];
            });
            iceQueueRef.current = []; // NEW: Reset queue for new incoming call

            // Play ringtone if not already playing for another call
            triggerAlertSound();
        });

        socket.on('call_ended', (data) => {
            const callerId = data?.callerId;
            console.log('Call ended for:', callerId);

            if (activeCallRef.current && activeCallRef.current.callerId === callerId) {
                cleanupCall();
            }

            setCallQueue(prev => prev.filter(c => c.callerId !== callerId));

            // Stop ringtone if queue is empty
            setCallQueue(currentQueue => {
                if (currentQueue.length === 0) stopRingtone();
                return currentQueue;
            });
        });

        socket.on('ice_candidate', async (data) => {
            if (data.candidate) {
                if (peerRef.current && peerRef.current.remoteDescription) {
                    try {
                        await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } catch (e) { console.error("Error adding ice candidate", e); }
                } else {
                    console.log('Queuing ICE candidate (PC not ready)');
                    iceQueueRef.current.push(data.candidate);
                }
            }
        });

        return () => {
            socket.off('connect');
            socket.off('new_report');
            socket.off('new_alarm');
            socket.off('new_voice');
            socket.off('new_call_history');
            socket.off('incoming_call');
            socket.off('call_answered');
            socket.off('call_ended');
            socket.off('ice_candidate');
            stopRingtone();
            cleanupCall();
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isCallActive) {
            interval = setInterval(() => setCallDuration(d => d + 1), 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [isCallActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const triggerAlertSound = () => {
        if (document.querySelectorAll('.ringtone-element').length === 0) {
            // Use /ringtone.mp3 from public folder if exists, fallback to data URI
            const audio = new Audio('/ringtone.mp3');
            audio.loop = true;
            audio.volume = 1.0;
            audio.className = 'ringtone-element';
            audio.id = 'ringtone';
            document.body.appendChild(audio);
            audio.play()
                .then(() => setAudioAllowed(true))
                .catch(e => {
                    console.error('Audio play failed:', e);
                    setAudioAllowed(false);
                    // Fallback to data URI if file fails
                    const fallback = new Audio(REAL_RINGTONE_URI);
                    fallback.loop = true;
                    fallback.volume = 1.0;
                    fallback.className = 'ringtone-element';
                    document.body.appendChild(fallback);
                    fallback.play().catch(() => { });
                });
        }
    };

    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [{ id, message, type }, ...prev]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 8000);
    };

    const stopRingtone = () => {
        const ringtones = document.querySelectorAll('.ringtone-element, #ringtone');
        ringtones.forEach(audio => {
            audio.pause();
            audio.remove();
        });
    };

    const handleAnswerCall = async (call) => {
        if (isCallActive) {
            alert('يوجد اتصال نشط حالياً. يرجى إنهاء الاتصال الحالي أولاً.');
            return;
        }

        stopRingtone();

        try {
            // WebRTC Call Initiation
            if (!call || !call.offer) {
                console.warn('Call has no WebRTC offer');
                socket.emit('call_accept', { accepted: true, callerId: call.callerId, targetId: call.socketId });
                setIsCallActive(true);
                setActiveCall(call);
                activeCallRef.current = call;
                setCallQueue(prev => prev.filter(c => c.callerId !== call.callerId));
                return;
            }

            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' }
                ]
            });
            peerRef.current = pc;

            pc.ontrack = (event) => {
                console.log('Received remote track on dashboard', event.streams);
                if (remoteAudioRef.current) {
                    const rStream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
                    remoteAudioRef.current.srcObject = rStream;
                    remoteAudioRef.current.play().catch(e => console.warn("Dashboard audio play failed:", e));
                    console.log('Remote stream attached to audio element');
                }
            };

            pc.onaddstream = (event) => {
                console.log('Received remote stream on dashboard', event.stream);
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.stream;
                    console.log('Remote stream attached via onaddstream');
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice_candidate', {
                        candidate: event.candidate,
                        targetId: call.socketId,
                        dashboardSocketId: socket.id
                    });
                }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(call.offer));

            // Process queued ICE candidates
            console.log(`Processing ${iceQueueRef.current.length} queued candidates`);
            while (iceQueueRef.current.length > 0) {
                const cand = iceQueueRef.current.shift();
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) { console.warn("Failed to add queued candidate", e); }
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true }
            });
            localStreamRef.current = stream;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const answer = await pc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });
            await pc.setLocalDescription(answer);

            socket.emit('call_accept', {
                answer,
                callerId: call.callerId,
                targetId: call.socketId,
                dashboardSocketId: socket.id
            });

            setIsCallActive(true);
            setActiveCall(call);
            activeCallRef.current = call; // Update ref immediately
            setCallQueue(prev => prev.filter(c => c.callerId !== call.callerId));
        } catch (err) {
            console.error("Call Answer failed:", err);
            socket.emit('call_accept', { accepted: true, error: 'Mic access failed', callerId: call.callerId });
            setIsCallActive(true);
            setActiveCall(call);
            activeCallRef.current = call; // Update ref immediately
            setCallQueue(prev => prev.filter(c => c.callerId !== call.callerId));
        }
    };

    const handleRejectCall = (call) => {
        socket.emit('call_reject', { callerId: call.callerId });
        setCallQueue(prev => prev.filter(c => c.callerId !== call.callerId));

        // If queue becomes empty, stop ringtone
        setCallQueue(currentQueue => {
            if (currentQueue.length === 0) stopRingtone();
            return currentQueue;
        });
    };

    const handleEndActiveCall = () => {
        if (activeCall) {
            socket.emit('call_reject', {
                callerId: activeCall.callerId,
                targetId: activeCall.socketId
            });
        }
        cleanupCall();
    };

    const cleanupCall = () => {
        setIsCallActive(false);
        setActiveCall(null);
        activeCallRef.current = null; // Clear ref
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }
        iceQueueRef.current = [];
    };

    return (
        <div
            className="flex h-screen bg-gray-100 flex-col md:flex-row overflow-hidden relative"
            dir="rtl"
            onClick={() => {
                // Silent unlock on first click anywhere
                if (!audioAllowed) {
                    const audio = new Audio(REAL_RINGTONE_URI);
                    audio.volume = 0;
                    audio.play().then(() => {
                        audio.pause();
                        setAudioAllowed(true);
                    }).catch(() => { });
                }
            }}
        >
            {!isSecureContext && (
                <div className="bg-red-600 text-white p-4 fixed top-0 w-full z-[100] text-center">
                    ⚠️ البراوزر يمنع الميكروفون - استخدم localhost أو HTTPS
                </div>
            )}

            {/* Twilio Error Banner */}
            {twilioError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 fixed top-16 w-full z-[48] flex justify-between items-center animate-pulse" >
                    <div className="flex items-center gap-2">
                        <PhoneOff size={24} />
                        <p className="font-bold">{twilioError}</p>
                    </div>
                </div>
            )}

            {/* Active Call Banner */}
            {isCallActive && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    <span className="font-bold">اتصال نشط: {activeCall?.callerId}</span>
                    <span className="font-mono bg-green-700 px-3 py-1 rounded-lg">{formatTime(callDuration)}</span>
                    <button
                        onClick={handleEndActiveCall}
                        className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors"
                    >
                        <PhoneOff size={20} />
                    </button>
                </div>
            )}

            {/* Notifications Toasts */}
            <div className="fixed top-20 right-6 z-[120] flex flex-col gap-2 w-80">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-lg shadow-xl text-white flex justify-between items-center transition-all animate-slide-in ${n.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        <span className="font-medium text-sm">{n.message}</span>
                        <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="ml-4 opacity-70 hover:opacity-100">✕</button>
                    </div>
                ))}
            </div>

            {/* Call Queue Floating Button/Drawer */}
            {!isCallActive && callQueue.length > 0 && (
                <div className="fixed bottom-6 left-6 z-[100] animate-bounce">
                    <button
                        onClick={() => setActiveTab('calls')}
                        className="bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 relative"
                    >
                        <Phone size={24} />
                        <span className="absolute -top-2 -right-2 bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-red-600">
                            {callQueue.length}
                        </span>
                        <span className="hidden md:inline font-bold">اتصالات واردة ({callQueue.length})</span>
                    </button>
                </div>
            )}

            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-primary-blue text-white p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck size={32} />
                    <h1 className="text-xl font-bold">لوحة التحكم</h1>
                </div>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`p-3 rounded-lg text-right flex items-center gap-3 ${activeTab === 'overview' ? 'bg-secondary-blue' : 'hover:bg-blue-900'}`}
                    >
                        <span>🏠 نظرة عامة</span>
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button
                        onClick={() => setActiveTab('calls')}
                        className={`p-3 rounded-lg text-right flex items-center justify-between ${activeTab === 'calls' ? 'bg-secondary-blue' : 'hover:bg-blue-900'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span>📞 المكالمات</span>
                        </div>
                        {callQueue.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse font-bold">{callQueue.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('call_history')}
                        className={`p-3 rounded-lg text-right flex items-center justify-between ${activeTab === 'call_history' ? 'bg-secondary-blue' : 'hover:bg-blue-900'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span>📜 سجل المكالمات</span>
                        </div>
                        {callHistory.length > 0 && <span className="bg-secondary-blue text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{callHistory.length}</span>}
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`p-3 rounded-lg text-right flex items-center justify-between ${activeTab === 'reports' ? 'bg-secondary-blue' : 'hover:bg-blue-900'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span>📋 البلاغات الميدانية</span>
                        </div>
                        {reports.length > 0 && <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{reports.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('voice')}
                        className={`p-3 rounded-lg text-right flex items-center justify-between ${activeTab === 'voice' ? 'bg-secondary-blue' : 'hover:bg-blue-900'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span>🎙️ تقارير صوتية</span>
                        </div>
                        {voices.length > 0 && <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{voices.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`p-3 rounded-lg text-right flex items-center gap-3 ${activeTab === 'map' ? 'bg-secondary-blue' : 'hover:bg-blue-900'}`}
                    >
                        <span>🗺️ الخريطة التفاعلية</span>
                    </button>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="px-3 mb-2 flex items-center gap-2 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                            متصل حالياً
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full text-right p-3 rounded-lg text-red-300 hover:bg-red-900/30 flex items-center gap-3 transition-colors group"
                        >
                            <span className="group-hover:translate-x-[-2px] transition-transform">🚪 تسجيل الخروج</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto bg-gray-50">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">المكالمات الجارية</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{isCallActive ? 1 : 0}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${isCallActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Phone size={24} />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between" onClick={() => setActiveTab('calls')}>
                                <div>
                                    <p className="text-gray-500 text-sm">اتصالات نشطة</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{callQueue.length}</h3>
                                </div>
                                <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
                                    <Phone size={24} />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between" onClick={() => setActiveTab('reports')}>
                                <div>
                                    <p className="text-gray-500 text-sm">إجمالي البلاغات</p>
                                    <h3 className="text-2xl font-bold text-blue-600">{reports.length}</h3>
                                </div>
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between" onClick={() => setActiveTab('voice')}>
                                <div>
                                    <p className="text-gray-500 text-sm">رسائل صوتية</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{voices.length}</h3>
                                </div>
                                <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
                                    <Mic size={24} />
                                </div>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Phone size={20} className="text-green-600" />
                                    مكالمات في الانتظار ({callQueue.length})
                                </h3>
                                {callQueue.slice(0, 3).length > 0 ? (
                                    <div className="space-y-3">
                                        {callQueue.slice(0, 3).map(call => (
                                            <div key={call.callerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{call.callerId}</span>
                                                    {call.location && call.location !== 'غير محدد' && (
                                                        <span className="text-[10px] text-blue-600 flex items-center gap-1">
                                                            📍 الموقع متوفر
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {call.location && call.location !== 'غير محدد' && (
                                                        <button
                                                            onClick={() => handleLocateEvent(call)}
                                                            className="text-green-600 text-xs font-bold"
                                                        >
                                                            تحديد
                                                        </button>
                                                    )}
                                                    <button onClick={() => setActiveTab('calls')} className="text-blue-600 text-sm">عرض</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-400 text-sm py-4">لا توجد مكالمات حالياً</p>}
                            </div>

                        </div>

                        {/* Recent Recorded Calls */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-900 border-r-4 border-blue-600 pr-3">
                                <Phone size={20} className="text-blue-600" />
                                سجل المكالمات الأخير ({callHistory.length})
                            </h3>
                            {callHistory.slice(0, 5).length > 0 ? (
                                <div className="space-y-3">
                                    {callHistory.slice(0, 5).map(call => (
                                        <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 ${call.type === 'SOS' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center`}>
                                                    {call.type === 'SOS' ? <Bell size={18} /> : <Phone size={18} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-800 text-sm">{call.callerId}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${call.type === 'SOS' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                            {call.type === 'SOS' ? 'SOS' : 'إتصال'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">{new Date(call.timestamp).toLocaleString('ar-DZ')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {call.location && call.location !== 'غير محدد' && (
                                                    <button
                                                        onClick={() => handleLocateEvent(call)}
                                                        className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded shadow-sm hover:bg-blue-700 transition-colors"
                                                    >
                                                        📍 تحديد
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setActiveTab('call_history')}
                                                    className="text-gray-500 hover:text-blue-600 text-xs font-bold px-2 py-1 rounded hover:bg-white transition-colors"
                                                >
                                                    تفاصيل
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {callHistory.length > 5 && (
                                        <button
                                            onClick={() => setActiveTab('call_history')}
                                            className="w-full text-center py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg mt-2 font-bold border border-dashed border-blue-200"
                                        >
                                            مشاهدة السجل الكامل ({callHistory.length}) ←
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <PhoneOff size={32} className="mx-auto mb-2 opacity-20" />
                                    لا يوجد سجل مكالمات حتى الآن
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'calls' && (
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">قائمة الانتظار للمكالمات</h2>
                        {callQueue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <PhoneOff size={64} className="mb-4 opacity-20" />
                                <p className="text-xl">لا توجد مكالمات واردة حالياً</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {callQueue.map((call) => (
                                    <div key={call.callerId} className="p-5 bg-gradient-to-br from-red-50 to-white border-2 border-red-100 rounded-2xl flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                            <Phone size={32} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-lg text-gray-800">{call.callerId}</h3>
                                            <p className="text-xs text-gray-500">{new Date(call.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="flex gap-4 w-full">
                                            <button
                                                onClick={() => handleRejectCall(call)}
                                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-bold transition-colors"
                                            >
                                                رفض
                                            </button>
                                            <button
                                                onClick={() => handleAnswerCall(call)}
                                                className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold shadow-[0_4px_15px_rgba(34,197,94,0.3)] transition-all"
                                            >
                                                رد
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'call_history' && (
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            📜 سجل المكالمات
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-gray-600">
                                        <th className="p-4">هوية المتصل</th>
                                        <th className="p-4 text-right">التوقيت</th>
                                        <th className="p-4 text-right">الموقع الجغرافي</th>
                                        <th className="p-4 text-right">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {callHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-10 text-center text-gray-400">لا يوجد سجل مكالمات حتى الآن</td>
                                        </tr>
                                    ) : (
                                        callHistory.map((call) => (
                                            <tr key={call.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 ${call.type === 'SOS' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center`}>
                                                            {call.type === 'SOS' ? <Bell size={14} /> : <Phone size={14} />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800">{call.callerId}</span>
                                                            <span className={`text-[10px] font-bold ${call.type === 'SOS' ? 'text-red-600' : 'text-blue-600'}`}>
                                                                {call.type === 'SOS' ? 'استغاثة SOS' : 'مكالمة صوتية'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">{new Date(call.timestamp).toLocaleString('ar-DZ')}</td>
                                                <td className="p-4 text-sm">
                                                    {call.location && call.location !== 'غير محدد' ? (
                                                        <span className="text-green-600 flex items-center gap-1">📍 {call.location}</span>
                                                    ) : (
                                                        <span className="text-gray-400">غير متوفر</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {call.location && call.location !== 'غير محدد' && (
                                                        <button
                                                            onClick={() => handleLocateEvent(call)}
                                                            className="bg-secondary-blue text-white px-3 py-1.5 rounded-lg text-xs hover:opacity-90"
                                                        >
                                                            تحدد على الخريطة
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">سجل البلاغات</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="p-3">نوع الحدث</th>
                                        <th className="p-3">الوصف</th>
                                        <th className="p-3">التوقيت</th>
                                        <th className="p-3">الموقع</th>
                                        <th className="p-3">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium text-blue-900">{report.category || report.type}</td>

                                            <td className="p-3 text-gray-600">{report.description}</td>
                                            <td className="p-3 text-sm text-gray-500">{new Date(report.timestamp).toLocaleString('ar-DZ')}</td>
                                            <td className="p-3 text-sm">
                                                {report.location ? '📍 متوفر' : 'غير محدد'}
                                            </td>
                                            <td className="p-3 flex gap-2">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="text-blue-600 hover:underline text-sm font-bold bg-blue-50 px-3 py-1 rounded"
                                                >
                                                    👁️ عرض التفاصيل
                                                </button>
                                                {report.location && (
                                                    <button
                                                        onClick={() => handleLocateEvent(report)}
                                                        className="text-green-600 hover:underline text-sm font-bold bg-green-50 px-3 py-1 rounded"
                                                    >
                                                        📍 الموقع
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {activeTab === 'voice' && (
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-800">الرسائل الصوتية</h2>
                        <div className="space-y-4">
                            {voices.length === 0 ? (
                                <p className="text-gray-500 text-center">لا توجد رسائل صوتية بعد.</p>
                            ) : (
                                voices.map((voice) => (
                                    <div key={voice.id} className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-blue-900">رسالة من: {voice.deviceId || 'مجهول'}</p>
                                                <p className="text-xs text-gray-500">{new Date(voice.timestamp).toLocaleString('ar-DZ')}</p>
                                            </div>
                                            <button
                                                onClick={() => handleLocateEvent(voice)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                📍 تحديد الموقع
                                            </button>
                                        </div>
                                        <audio controls className="w-full">
                                            <source src={`${BASE_URL}${voice.path}`} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="bg-white rounded-xl shadow h-[600px] overflow-hidden">
                        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                            <MapController center={mapCenter} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {/* Markers for SOS Calls from History */}
                            {callHistory.filter(c => c.type === 'SOS').map(call => {
                                if (!call.location || call.location === 'غير محدد') return null;
                                const [lat, lng] = call.location.split(',').map(Number);
                                return (
                                    <Marker key={call.id} position={[lat, lng]}>
                                        <Popup>
                                            <div className="text-right">
                                                <p className="font-bold text-red-600">🔴 استغاثة عاجلة</p>
                                                <p className="text-sm">الجهاز: {call.callerId}</p>
                                                <p className="text-xs text-gray-500">{new Date(call.timestamp).toLocaleString('ar-DZ')}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            })}
                            {/* Markers for Voice Messages */}
                            {voices.map(voice => {
                                if (!voice.location || voice.location === 'غير محدد') return null;
                                const [lat, lng] = voice.location.split(',').map(Number);
                                return (
                                    <Marker key={voice.id} position={[lat, lng]}>
                                        <Popup>
                                            🎙️ رسالة صوتية من: {voice.deviceId} <br />
                                            ⏰ {new Date(voice.timestamp).toLocaleTimeString()}
                                        </Popup>
                                    </Marker>
                                )
                            })}
                            {/* Markers for Reports */}
                            {reports.map(report => {
                                if (!report.location || report.location === 'غير محدد') return null;
                                const [lat, lng] = report.location.split(',').map(Number);
                                return (
                                    <Marker key={report.id} position={[lat, lng]}>
                                        <Popup>
                                            📋 بلاغ: {report.type} <br />
                                            {report.description} <br />
                                            ⏰ {new Date(report.timestamp).toLocaleTimeString()}
                                        </Popup>
                                    </Marker>
                                )
                            })}

                            <Marker position={[36.75, 3.05]}>
                                <Popup>
                                    المديرية العامة <br /> المركز الرئيسي.
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                )}

            </main>

            {/* Report Details Modal */}
            {
                selectedReport && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <h2 className="text-2xl font-bold mb-4 text-primary-blue border-b pb-2">تفاصيل البلاغ</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">النوع</p>
                                        <p className="font-bold text-lg">{selectedReport.category || selectedReport.type}</p>

                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">التوقيت</p>
                                        <p className="font-bold">{new Date(selectedReport.timestamp).toLocaleString('ar-DZ')}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">الوصف</p>
                                    <p className="bg-gray-50 p-3 rounded-lg border">{selectedReport.description}</p>
                                </div>

                                {selectedReport.location && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">الموقع</p>
                                        <button
                                            onClick={() => {
                                                handleLocateEvent(selectedReport);
                                                setSelectedReport(null);
                                            }}
                                            className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 px-4 py-2 rounded-lg w-full justify-center"
                                        >
                                            📍 الانتقال إلى الموقع على الخريطة
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-500 mb-2">المرفقات (صور/فيديو)</p>
                                    {selectedReport.media && selectedReport.media.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedReport.media.map((file, idx) => (
                                                <div key={idx} className="border rounded-lg overflow-hidden bg-gray-100">
                                                    {file.mimetype.startsWith('image/') ? (
                                                        <img src={`${BASE_URL}${file.path}`} alt="Evidence" className="w-full h-48 object-cover" />
                                                    ) : (
                                                        <video controls className="w-full h-48 object-cover">
                                                            <source src={`${BASE_URL}${file.path}`} type={file.mimetype} />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4 border-2 border-dashed rounded-lg">لا توجد مرفقات</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <audio ref={remoteAudioRef} autoPlay />
        </div>
    );
};

export default AdminDashboard;
