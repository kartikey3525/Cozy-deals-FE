###############################################
# React Native Production Rules
###############################################

# Preserve stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Runtime annotations
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes EnclosingMethod

###############################################
# Native Methods
###############################################

-keepclassmembers class * {
    native <methods>;
}

###############################################
# React Native
###############################################

-dontwarn com.facebook.react.**

###############################################
# Hermes
###############################################

-dontwarn com.facebook.hermes.**

###############################################
# JNI
###############################################

-dontwarn com.facebook.jni.**

###############################################
# Kotlin
###############################################

-dontwarn kotlin.**

###############################################
# OkHttp
###############################################

-dontwarn okhttp3.**
-dontwarn okio.**

###############################################
# Gson
###############################################

-keep class com.google.gson.stream.** { *; }

###############################################
# Firebase
###############################################

-dontwarn com.google.firebase.**

###############################################
# Google Play Services
###############################################

-dontwarn com.google.android.gms.**

###############################################
# Keep React Native Native Methods
###############################################

-keepclassmembers,includedescriptorclasses class * {
    native <methods>;
}

###############################################
# Suppress harmless notes
###############################################

-dontnote **