"""Render Money Lab's original 96-BPM motif for native mobile media playback."""
import math,struct,wave,subprocess,tempfile
from pathlib import Path
rate=22050;duration=20;total=rate*duration
pattern=[0,2,1,3,0,1,2,1,0,2,3,2,1,0,2,1]
for hard in [False,True]:
 samples=[0.0]*total;notes=[146.83,174.61,220,261.63] if hard else [130.81,155.56,196,233.08]
 def tone(freq,start,length,level,triangle=False):
  for k in range(int(length*rate)):
   t=k/rate;env=min(1,t/.015)*math.exp(-7*t/length);phase=t*freq
   v=(2/math.pi*math.asin(math.sin(2*math.pi*phase))) if triangle else math.sin(2*math.pi*phase)
   samples[(int(start*rate)+k)%total]+=v*env*level
 for step in range(64):
  at=step*60/96/2;n=notes[pattern[step%16]]*(2 if step%8==7 else 1)
  tone(n,at,.24,.11,True);tone(n*2,at,.32,.055)
  if step%4==0:tone(notes[0]/2,at,.55,.3);tone(52,at,.1,.22)
  if hard and step%4==2:tone(65,at,.1,.13)
 peak=max(abs(x) for x in samples);data=b''.join(struct.pack('<h',int(x/peak*.8*32767)) for x in samples)
 out=Path('dist/assets/moneylab-music-'+('hard' if hard else 'calm')+'-v1.mp3')
 with tempfile.TemporaryDirectory() as tmp:
  wav=Path(tmp)/'loop.wav'
  with wave.open(str(wav),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(data)
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','64k','-map_metadata','-1',str(out)],check=True)
 print(out, out.stat().st_size)
