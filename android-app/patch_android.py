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
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Looper;
import android.os.SystemClock;
import androidx.core.content.ContextCompat;
import org.json.JSONArray;
import org.json.JSONObject;
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

  /* ===== jejak GPS untuk laporan, dengan tanda lokasi palsu (mock) ===== */
  private final Object locLock = new Object();
  private JSONArray locBuf = new JSONArray();
  private LocationListener locL = null;
  private boolean locPerm() {
    return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
  }
  private void locAdd(Location l) {
    try {
      boolean mock = Build.VERSION.SDK_INT >= 31 ? l.isMock() : l.isFromMockProvider();
      long t = System.currentTimeMillis() - (SystemClock.elapsedRealtimeNanos() - l.getElapsedRealtimeNanos()) / 1000000L;
      JSONObject o = new JSONObject();
      o.put("t", t); o.put("lat", l.getLatitude()); o.put("lon", l.getLongitude());
      o.put("acc", l.hasAccuracy() ? l.getAccuracy() : 99); o.put("mock", mock ? 1 : 0); o.put("p", String.valueOf(l.getProvider()));
      synchronized (locLock) { if (locBuf.length() > 400) locBuf = new JSONArray(); locBuf.put(o); }
    } catch (Exception e) { }
  }
  private void locStart() {
    if (locL != null || !locPerm()) return;
    LocationManager lm = (LocationManager) getSystemService(LOCATION_SERVICE);
    if (lm == null) return;
    locL = new LocationListener() {
      @Override public void onLocationChanged(Location l) { locAdd(l); }
      @Override public void onProviderEnabled(String p) { }
      @Override public void onProviderDisabled(String p) { }
      @Override public void onStatusChanged(String p, int st, Bundle b) { }
    };
    try {
      if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 0f, locL, Looper.getMainLooper());
      if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 2000L, 0f, locL, Looper.getMainLooper());
    } catch (SecurityException e) { locL = null; }
  }
  private void locStop() {
    if (locL == null) return;
    LocationManager lm = (LocationManager) getSystemService(LOCATION_SERVICE);
    try { if (lm != null) lm.removeUpdates(locL); } catch (Exception e) { }
    locL = null;
  }
  public class JcLoc {
    @JavascriptInterface public String start() { if (!locPerm()) return "noperm"; runOnUiThread(() -> locStart()); return "ok"; }
    @JavascriptInterface public void stop() { runOnUiThread(() -> locStop()); }
    @JavascriptInterface public String read() { synchronized (locLock) { String r = locBuf.toString(); locBuf = new JSONArray(); return r; } }
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
  public void onPause() { super.onPause(); locStop(); }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus && full) applyMode();
  }
}
''')
print('edge-to-edge ok')
