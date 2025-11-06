# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Support for 16KB page sizes - Android 15+ requirement
-keep class com.balipass.app.** { *; }
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }

# Preserve native methods for 16KB compatibility
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Capacitor plugins
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.getcapacitor.plugin.** { *; }