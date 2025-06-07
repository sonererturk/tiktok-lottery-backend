@echo off
title TikTok Cekilisci - Durdur
echo TikTok Cekilisci sunucusu durduruluyor...
echo.
taskkill /F /IM node.exe
echo.
echo Sunucu durduruldu!
echo Yeniden baslatmak icin 'baslat.bat' dosyasini calistirin.
timeout /t 3 