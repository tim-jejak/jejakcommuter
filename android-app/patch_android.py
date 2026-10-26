import re,sys
p='android/app/src/main/AndroidManifest.xml'
s=open(p,encoding='utf-8').read()
perms=['android.permission.ACCESS_COARSE_LOCATION','android.permission.ACCESS_FINE_LOCATION','android.permission.FOREGROUND_SERVICE','android.permission.FOREGROUND_SERVICE_LOCATION','android.permission.POST_NOTIFICATIONS','android.permission.WAKE_LOCK']
add=''.join('    <uses-permission android:name="%s" />\n'%x for x in perms if x not in s)
assert '<application' in s
s=s.replace('<application',add+'    <application',1)
open(p,'w',encoding='utf-8').write(s)
print('manifest ok')
# nama versi
g='android/app/build.gradle'
t=open(g,encoding='utf-8').read()
t=re.sub(r'versionName\s+"[^"]*"','versionName "1.0.0"',t)
open(g,'w',encoding='utf-8').write(t)
print('gradle ok')
 
