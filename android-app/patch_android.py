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
 
# layar penuh (edge-to-edge): peta tampil di belakang status bar & navigasi HP
import os,glob
ma=glob.glob('android/app/src/main/java/**/MainActivity.java',recursive=True)
assert ma, 'MainActivity tidak ditemukan'
open(ma[0],'w',encoding='utf-8').write('''package id.jejak.commuter;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private volatile int insTop = 0, insBot = 0;

  public class JcInsets {
    @JavascriptInterface public String get() { return insTop + "," + insBot; }
    @JavascriptInterface public void dark(final boolean d) { runOnUiThread(() -> setIcons(d)); }
  }

  private void setIcons(boolean dark) {
    Window w = getWindow();
    WindowInsetsControllerCompat c = WindowCompat.getInsetsController(w, w.getDecorView());
    c.setAppearanceLightStatusBars(!dark);
    c.setAppearanceLightNavigationBars(!dark);
  }

  private void push() {
    final WebView wv = bridge == null ? null : bridge.getWebView();
    if (wv == null) return;
    final String js = "(function(){var r=document.documentElement;r.style.setProperty('--sat','" + insTop + "px');r.style.setProperty('--sab','" + insBot + "px');window.dispatchEvent(new Event('resize'));})()";
    wv.post(() -> wv.evaluateJavascript(js, null));
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Window w = getWindow();
    WindowCompat.setDecorFitsSystemWindows(w, false);
    w.setStatusBarColor(Color.TRANSPARENT);
    w.setNavigationBarColor(Color.TRANSPARENT);
    if (Build.VERSION.SDK_INT >= 29) { w.setStatusBarContrastEnforced(false); w.setNavigationBarContrastEnforced(false); }
    boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
    setIcons(night);
    final WebView wv = bridge.getWebView();
    wv.addJavascriptInterface(new JcInsets(), "JcInsets");
    ViewCompat.setOnApplyWindowInsetsListener(w.getDecorView(), (v, ins) -> {
      Insets i = ins.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
      float d = getResources().getDisplayMetrics().density;
      insTop = Math.round(i.top / d);
      insBot = Math.round(i.bottom / d);
      push();
      return ViewCompat.onApplyWindowInsets(v, ins);
    });
    wv.postDelayed(this::push, 1500);
    wv.postDelayed(this::push, 4000);
  }

  @Override
  public void onResume() { super.onResume(); push(); }
}
''')
print('edge-to-edge ok')
