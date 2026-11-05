import re,sys
p='android/app/src/main/AndroidManifest.xml'
s=open(p,encoding='utf-8').read()
perms=['android.permission.ACCESS_COARSE_LOCATION','android.permission.ACCESS_FINE_LOCATION','android.permission.FOREGROUND_SERVICE','android.permission.FOREGROUND_SERVICE_LOCATION','android.permission.POST_NOTIFICATIONS','android.permission.WAKE_LOCK']
add=''.join('    <uses-permission android:name="%s" />\n'%x for x in perms if x not in s)
assert '<application' in s
s=s.replace('<application',add+'    <application',1)
# keyboard tidak menggeser seluruh layar (header tetap terlihat)
if 'windowSoftInputMode' in s: s=re.sub(r'android:windowSoftInputMode="[^"]*"','android:windowSoftInputMode="adjustResize"',s)
else: s=s.replace('android:name=".MainActivity"','android:name=".MainActivity"\n            android:windowSoftInputMode="adjustResize"',1)
assert 'adjustResize' in s
open(p,'w',encoding='utf-8').write(s)
print('manifest ok')
# nama versi
g='android/app/build.gradle'
t=open(g,encoding='utf-8').read()
t=re.sub(r'versionName\s+"[^"]*"','versionName "1.0.0"',t)
open(g,'w',encoding='utf-8').write(t)
print('gradle ok')
 
# layar penuh (edge-to-edge): peta tampil di belakang status bar & navigasi HP
import os,glob
ma=glob.glob('android/app/src/main/java/**/MainActivity.java',recursive=True)
assert ma, 'MainActivity tidak ditemukan'
open(ma[0],'w',encoding='utf-8').write('''package id.jejak.commuter;

import android.Manifest;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.Intent;
import androidx.core.content.ContextCompat;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private volatile int insTop = 0, insBot = 0, insKb = 0;
  private volatile boolean full = false, dark = false;
  private static final int BAR_90 = 0xFF2E3236;   // abu-abu tua (mode 90%)
  private static final int SCRIM_FULL = 0x59000000; // abu-abu transparan di atas (mode Penuh)

  public class JcInsets {
    @JavascriptInterface public String get() { return full ? insTop + "," + insBot : "0,0"; }
    @JavascriptInterface public void dark(final boolean d) { dark = d; runOnUiThread(() -> applyMode()); }
    @JavascriptInterface public void mode(final String m) {
      full = "full".equals(m);
      getSharedPreferences("jc", MODE_PRIVATE).edit().putBoolean("full", full).apply();
      runOnUiThread(() -> applyMode());
    }
  }

  /* ===== jejak GPS untuk laporan: dicatat oleh JcLocService (tetap jalan saat layar terkunci) ===== */
  private boolean locPerm() {
    return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
  }
  public class JcLoc {
    @JavascriptInterface public String start() {
      if (!locPerm()) return "noperm";
      JcLocService.touch = System.currentTimeMillis();
      if (!JcLocService.running) {
        try { ContextCompat.startForegroundService(MainActivity.this, new Intent(MainActivity.this, JcLocService.class)); } catch (Exception e) { return "err"; }
      }
      return "ok";
    }
    @JavascriptInterface public void stop() { try { stopService(new Intent(MainActivity.this, JcLocService.class)); } catch (Exception e) { } }
    @JavascriptInterface public String read() { return JcLocService.drain(); }
  }

  private void applyMode() {
    Window w = getWindow();
    View dv = w.getDecorView();
    WindowCompat.setDecorFitsSystemWindows(w, !full);
    WindowInsetsControllerCompat c = WindowCompat.getInsetsController(w, dv);
    if (full) {
      c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
      c.hide(WindowInsetsCompat.Type.statusBars());
      w.setStatusBarColor(SCRIM_FULL);
      w.setNavigationBarColor(Color.TRANSPARENT);
      c.setAppearanceLightStatusBars(false);
      c.setAppearanceLightNavigationBars(!dark);
    } else {
      c.show(WindowInsetsCompat.Type.statusBars());
      w.setStatusBarColor(BAR_90);
      w.setNavigationBarColor(BAR_90);
      c.setAppearanceLightStatusBars(false);
      c.setAppearanceLightNavigationBars(false);
    }
    ViewCompat.requestApplyInsets(dv);
    push();
  }

  private void push() {
    final WebView wv = bridge == null ? null : bridge.getWebView();
    if (wv == null) return;
    final int t = full ? insTop : 0, b = full ? insBot : 0, k = full ? insKb : 0;
    final String js = "(function(){var r=document.documentElement;r.style.setProperty('--sat','" + t + "px');r.style.setProperty('--sab','" + b + "px');r.style.setProperty('--kb','" + k + "px');window.dispatchEvent(new Event('resize'));})()";
    wv.post(() -> wv.evaluateJavascript(js, null));
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Window w = getWindow();
    if (Build.VERSION.SDK_INT >= 29) { w.setStatusBarContrastEnforced(false); w.setNavigationBarContrastEnforced(false); }
    if (Build.VERSION.SDK_INT >= 28) { WindowManager.LayoutParams lp = w.getAttributes(); lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES; w.setAttributes(lp); }
    full = getSharedPreferences("jc", MODE_PRIVATE).getBoolean("full", false);
    dark = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
    final WebView wv = bridge.getWebView();
    wv.addJavascriptInterface(new JcInsets(), "JcInsets");
    wv.addJavascriptInterface(new JcLoc(), "JcLoc");
    ViewCompat.setOnApplyWindowInsetsListener(w.getDecorView(), (v, ins) -> {
      Insets i = ins.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
      float d = getResources().getDisplayMetrics().density;
      insTop = Math.round(i.top / d);
      insBot = Math.round(i.bottom / d);
      insKb = ins.isVisible(WindowInsetsCompat.Type.ime()) ? Math.round(ins.getInsets(WindowInsetsCompat.Type.ime()).bottom / d) : 0;
      push();
      return ViewCompat.onApplyWindowInsets(v, ins);
    });
    applyMode();
    wv.postDelayed(this::push, 1500);
    wv.postDelayed(this::push, 4000);
  }

  @Override
  public void onResume() { super.onResume(); push(); }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus && full) applyMode();
  }
}
''')
print('edge-to-edge ok')

# layanan pencatat lokasi untuk laporan (foreground service, tetap jalan saat layar terkunci)
import os
svc=os.path.join(os.path.dirname(ma[0]),'JcLocService.java')
open(svc,'w',encoding='utf-8').write('''package id.jejak.commuter;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import androidx.core.app.NotificationCompat;
import java.util.ArrayList;
import org.json.JSONArray;
import org.json.JSONObject;

public class JcLocService extends Service {
  static final Object LOCK = new Object();
  static final ArrayList<JSONObject> BUF = new ArrayList<>();
  static volatile long touch = 0;
  static volatile boolean running = false;
  private LocationManager lm;
  private LocationListener ll;
  private Handler h;
  private final Runnable check = new Runnable() {
    @Override public void run() {
      if (System.currentTimeMillis() - touch > 30L * 60L * 1000L) { stopSelf(); return; }
      if (h != null) h.postDelayed(this, 60000L);
    }
  };

  static void add(Location l) {
    try {
      boolean mock = Build.VERSION.SDK_INT >= 31 ? l.isMock() : l.isFromMockProvider();
      long t = System.currentTimeMillis() - (SystemClock.elapsedRealtimeNanos() - l.getElapsedRealtimeNanos()) / 1000000L;
      double acc = l.hasAccuracy() ? l.getAccuracy() : 99.0;
      synchronized (LOCK) {
        int n = BUF.size();
        if (n > 0) {
          JSONObject p = BUF.get(n - 1);
          if (t - p.getLong("t") < 2000L && p.getDouble("acc") <= acc && p.getInt("mock") == (mock ? 1 : 0)) return;
        }
        JSONObject o = new JSONObject();
        o.put("t", t); o.put("lat", l.getLatitude()); o.put("lon", l.getLongitude()); o.put("acc", acc); o.put("mock", mock ? 1 : 0);
        BUF.add(o);
        long cut = System.currentTimeMillis() - 1500000L;
        while (!BUF.isEmpty() && BUF.get(0).getLong("t") < cut) BUF.remove(0);
        while (BUF.size() > 1600) BUF.remove(0);
      }
    } catch (Exception e) { }
  }

  static String drain() {
    synchronized (LOCK) {
      JSONArray a = new JSONArray();
      for (JSONObject o : BUF) a.put(o);
      BUF.clear();
      return a.toString();
    }
  }

  private Notification note() {
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
      if (nm != null && nm.getNotificationChannel("jcloc") == null)
        nm.createNotificationChannel(new NotificationChannel("jcloc", "Lokasi untuk laporan", NotificationManager.IMPORTANCE_LOW));
    }
    Intent open = new Intent(this, MainActivity.class);
    open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
    PendingIntent pi = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    return new NotificationCompat.Builder(this, "jcloc")
      .setContentTitle("jejakcommuter aktif")
      .setContentText("Mencatat lokasi untuk laporan")
      .setSmallIcon(getApplicationInfo().icon)
      .setOngoing(true)
      .setContentIntent(pi)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    touch = System.currentTimeMillis();
    try {
      if (Build.VERSION.SDK_INT >= 29) startForeground(7101, note(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
      else startForeground(7101, note());
    } catch (Exception e) { stopSelf(); return START_NOT_STICKY; }
    if (!running) {
      running = true;
      try {
        lm = (LocationManager) getSystemService(LOCATION_SERVICE);
        ll = new LocationListener() {
          @Override public void onLocationChanged(Location l) { add(l); }
          @Override public void onProviderEnabled(String p) { }
          @Override public void onProviderDisabled(String p) { }
          @Override public void onStatusChanged(String p, int st, Bundle b) { }
        };
        if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 0f, ll, Looper.getMainLooper());
        if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 2000L, 0f, ll, Looper.getMainLooper());
      } catch (Exception e) { stopSelf(); return START_NOT_STICKY; }
      h = new Handler(Looper.getMainLooper());
      h.postDelayed(check, 60000L);
    }
    return START_NOT_STICKY;
  }

  @Override
  public void onDestroy() {
    running = false;
    try { if (lm != null && ll != null) lm.removeUpdates(ll); } catch (Exception e) { }
    if (h != null) h.removeCallbacks(check);
    super.onDestroy();
  }

  @Override public IBinder onBind(Intent i) { return null; }
}
''')
m='android/app/src/main/AndroidManifest.xml'
t=open(m,encoding='utf-8').read()
if 'JcLocService' not in t:
    t=t.replace('</application>','    <service android:name=".JcLocService" android:exported="false" android:foregroundServiceType="location" />\n    </application>',1)
open(m,'w',encoding='utf-8').write(t)
print('layanan lokasi ok')
